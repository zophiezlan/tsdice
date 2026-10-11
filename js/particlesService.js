import { tsParticles } from '@tsparticles/engine';
import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { ConfigGenerator } from './configGenerator.js';
import { generatePalette } from './palette.js';
import { PARTICLE_CONFIG } from './constants/particles.js';
import { THEME_BACKGROUNDS } from './constants/colors.js';
import { SafeStorage } from './storage.js';
import { Telemetry } from './telemetry.js';
import { Diagnostics } from './diagnostics.js';
import { TIMING } from './constants/ui.js';
import { STORAGE_KEYS } from './constants/storage.js';
import { applyComfortLimits } from './comfort.js';
import { beginSceneTransition } from './sceneTransition.js';

/** Applies advanced preferences (battery saver, auto-pause) to a config copy. */
export const applyAdvancedPreferences = (options) => {
  if (!options) return;

  if (AppState.advanced.autoPauseHidden) {
    options.pauseOnBlur = true;
    options.pauseOnOutsideViewport = true;
  } else {
    options.pauseOnBlur = false;
    options.pauseOnOutsideViewport = false;
  }

  if (!options.fpsLimit) {
    options.fpsLimit = PARTICLE_CONFIG.FPS_LIMIT;
  }

  if (AppState.advanced.batterySaverMode) {
    options.fpsLimit = Math.min(
      options.fpsLimit,
      PARTICLE_CONFIG.BATTERY_SAVER_FPS_LIMIT
    );

    if (
      options.particles &&
      options.particles.number &&
      typeof options.particles.number.value === 'number'
    ) {
      options.particles.number.value = Math.min(
        options.particles.number.value,
        PARTICLE_CONFIG.BATTERY_SAVER_PARTICLE_CAP
      );
    }

    if (options.particles && options.particles.move) {
      const cap = PARTICLE_CONFIG.BATTERY_SAVER_MAX_SPEED;
      if (typeof options.particles.move.speed === 'number') {
        options.particles.move.speed = Math.min(
          options.particles.move.speed,
          cap
        );
      } else {
        options.particles.move.speed = cap;
      }
    }

    if (options.particles && options.particles.links) {
      const opacity =
        typeof options.particles.links.opacity === 'number'
          ? options.particles.links.opacity
          : 0.4;
      options.particles.links.opacity = Math.min(opacity, 0.4);
    }
  }
};

/**
 * Engine-level options tsDice always sets, whatever the scene config says.
 * - hdr: v4 renders in Display-P3 with HDR tone mapping on capable screens,
 *   which brightens the curated palettes past normal white. Keep sRGB.
 * - motion: the motion plugin freezes every particle (reduceFactor 0) when
 *   the OS prefers reduced motion. tsDice instead announces a hint and lets
 *   the user pause with Space (see main.js), so opt out of the freeze.
 */
export const applyEngineOverrides = (options) => {
  if (!options) return;
  options.hdr = false;
  options.motion = { disable: false, reduce: { value: false } };
};

/**
 * Reapplies UI toggle states (walls, cursor, gravity) to a configuration.
 * Ensures toggle states persist across shuffles and undo/redo operations.
 */
export const reapplyToggleStates = (config) => {
  // Apply gravity state
  if (!config.particles.move.gravity) config.particles.move.gravity = {};
  config.particles.move.gravity.enable = AppState.ui.isGravityOn;
  config.particles.move.gravity.acceleration = AppState.ui.isGravityOn
    ? PARTICLE_CONFIG.GRAVITY_ACCELERATION
    : 0;

  // Apply walls state
  if (AppState.ui.areWallsOn) {
    if (
      !AppState.particleState.originalOutModes ||
      Object.keys(AppState.particleState.originalOutModes).length === 0
    ) {
      AppState.particleState.originalOutModes = structuredClone(
        config.particles.move.outModes
      );
    }
    config.particles.move.outModes = { default: 'bounce' };
  } else {
    if (config.particles.move.outModes?.default !== 'bounce') {
      AppState.particleState.originalOutModes = {};
    }
  }

  // Apply cursor particle state
  if (AppState.ui.isCursorParticle) {
    if (!AppState.particleState.originalInteractionModes.hover) {
      AppState.particleState.originalInteractionModes.hover =
        config.interactivity.events.onHover.mode;
    }
    config.interactivity.modes.trail = {
      delay: 0.05,
      quantity: 1,
      pauseOnStop: true,
    };
    config.interactivity.events.onHover.mode = 'trail';
    config.interactivity.events.onClick.enable = false;
  }
};

/** Builds a configuration object according to shuffle options. */
export const buildConfig = (shuffleOptions) => {
  const isNew =
    !AppState.particleState.currentConfig ||
    Object.keys(AppState.particleState.currentConfig).length === 0;
  const newConfig = isNew ? {} : { ...AppState.particleState.currentConfig };

  if (shuffleOptions.all || isNew) {
    newConfig.particles = {
      ...ConfigGenerator.generateAppearance(),
      move: ConfigGenerator.generateMovement(),
      ...ConfigGenerator.generateSpecialFX(),
    };
    newConfig.interactivity = ConfigGenerator.generateInteraction();
  } else {
    newConfig.particles = { ...newConfig.particles };
    if (shuffleOptions.appearance) {
      Object.assign(newConfig.particles, ConfigGenerator.generateAppearance());
    }
    if (shuffleOptions.movement) {
      newConfig.particles.move = {
        ...newConfig.particles.move,
        ...ConfigGenerator.generateMovement(),
      };
    }
    if (shuffleOptions.interaction) {
      newConfig.interactivity = ConfigGenerator.generateInteraction();
    }
    if (shuffleOptions.fx) {
      const fx = ConfigGenerator.generateSpecialFX(newConfig.particles);
      Object.assign(newConfig.particles, fx);
      newConfig.interactivity = ConfigGenerator.generateInteraction();
    }
  }

  Object.assign(newConfig, {
    background: {
      color: {
        value: AppState.ui.isDarkMode
          ? THEME_BACKGROUNDS.DARK
          : THEME_BACKGROUNDS.LIGHT,
      },
    },
    fpsLimit: PARTICLE_CONFIG.FPS_LIMIT,
    detectRetina: true,
    pauseOnBlur: false,
    pauseOnOutsideViewport: false,
  });
  newConfig.particles.number = {
    value:
      PARTICLE_CONFIG.BASE_PARTICLE_COUNT +
      AppState.particleState.chaosLevel *
        PARTICLE_CONFIG.CHAOS_PARTICLE_MULTIPLIER,
  };

  // Apply all UI toggle states to the new config
  reapplyToggleStates(newConfig);

  return newConfig;
};

/** Loads a given configuration into the tsParticles instance. */
export const loadParticles = async (config) => {
  const previousConfig = AppState.particleState.currentConfig;
  const loadStart =
    typeof performance !== 'undefined' ? performance.now() : Date.now();
  const metrics = {
    particleCount:
      config && config.particles && config.particles.number
        ? config.particles.number.value || 0
        : 0,
    chaos: AppState.particleState.chaosLevel,
  };
  Telemetry.log('particles:load:start', metrics);

  const loadingTimeout = setTimeout(() => {
    UIManager.showLoadingIndicator();
  }, TIMING.LOADING_DELAY);
  const hangTimeout = setTimeout(() => {
    UIManager.showToast('Still loading… this is taking longer than usual');
    UIManager.announce('Particle load is taking longer than expected');
    Telemetry.log('particles:load:slow', metrics);
  }, TIMING.PARTICLES_LOAD_HANG);

  let transition = null;
  try {
    AppState.particleState.currentConfig = config;
    SafeStorage.setItem(STORAGE_KEYS.LAST_CONFIG, JSON.stringify(config));
    SafeStorage.setItem(
      STORAGE_KEYS.TOGGLE_STATE,
      JSON.stringify({
        isGravityOn: AppState.ui.isGravityOn,
        areWallsOn: AppState.ui.areWallsOn,
        isCursorParticle: AppState.ui.isCursorParticle,
        originalOutModes: AppState.particleState.originalOutModes,
        originalInteractionModes:
          AppState.particleState.originalInteractionModes,
      })
    );

    // Hold the current frame over the canvas while the new scene loads
    transition = beginSceneTransition(AppState.ui.particlesContainer);

    const optionsWithAdvanced = JSON.parse(JSON.stringify(config));
    applyAdvancedPreferences(optionsWithAdvanced);
    const comfortRules = applyComfortLimits(optionsWithAdvanced);
    if (comfortRules.length > 0) {
      Telemetry.log('comfort:limited', { rules: comfortRules });
    }
    applyEngineOverrides(optionsWithAdvanced);

    Diagnostics.markLoadStart(optionsWithAdvanced);
    AppState.ui.particlesContainer = await tsParticles.load({
      id: 'tsparticles',
      options: optionsWithAdvanced,
    });
    Diagnostics.markLoadResolved();

    AppState.ui.isPaused = false;
    UIManager.syncUI();

    UIManager.hideLoadingIndicator();
    const endTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    Telemetry.log('particles:load:success', {
      ...metrics,
      durationMs: Math.round(endTime - loadStart),
      batterySaver: AppState.advanced.batterySaverMode,
    });

    Diagnostics.scheduleProbe(config);
  } catch (error) {
    Diagnostics.markLoadResolved();
    console.error('Failed to load particles:', error);
    UIManager.hideLoadingIndicator();
    Telemetry.logError('particles:load', error, metrics);

    if (previousConfig && Object.keys(previousConfig).length > 0) {
      AppState.particleState.currentConfig = previousConfig;
      try {
        const recoveryOptions = JSON.parse(JSON.stringify(previousConfig));
        applyAdvancedPreferences(recoveryOptions);
        applyComfortLimits(recoveryOptions);
        applyEngineOverrides(recoveryOptions);
        await tsParticles.load({
          id: 'tsparticles',
          options: recoveryOptions,
        });
        UIManager.showToast('Config error - restored previous state');
        UIManager.announce('Config error - restored previous state');
        Telemetry.log('particles:load:recovered');
      } catch (recoveryError) {
        console.error('Recovery also failed:', recoveryError);
        UIManager.showToast('Failed to load particles - please refresh');
        UIManager.announce('Failed to load particles - please refresh');
        Telemetry.logError('particles:load:recovery', recoveryError);
      }
    } else {
      UIManager.showToast('Failed to load particle configuration');
      UIManager.announce('Failed to load particle configuration');
    }
  } finally {
    clearTimeout(loadingTimeout);
    clearTimeout(hangTimeout);
    // Fade to whatever is now drawing: the new scene, or the restored one
    transition?.reveal();
  }
};

/** Applies or removes the cursor particle effect based on the current state. */
export const applyCursorMode = () => {
  const config = AppState.particleState.currentConfig;
  if (AppState.ui.isCursorParticle) {
    if (!AppState.particleState.originalInteractionModes.hover) {
      AppState.particleState.originalInteractionModes.hover =
        config.interactivity.events.onHover.mode;
    }
    config.interactivity.modes.trail = {
      delay: 0.05,
      quantity: 1,
      pauseOnStop: true,
    };
    config.interactivity.events.onHover.mode = 'trail';
    config.interactivity.events.onClick.enable = false;
  } else {
    config.interactivity.events.onHover.mode =
      AppState.particleState.originalInteractionModes.hover || 'repulse';
    config.interactivity.events.onClick.enable = true;
    delete AppState.particleState.originalInteractionModes.hover;
  }
};

/** Applies or removes the walls effect based on the current state. */
export const applyWallsMode = () => {
  const config = AppState.particleState.currentConfig;
  if (!config.particles) return;

  if (AppState.ui.areWallsOn) {
    if (
      !AppState.particleState.originalOutModes ||
      Object.keys(AppState.particleState.originalOutModes).length === 0
    ) {
      AppState.particleState.originalOutModes = structuredClone(
        config.particles.move.outModes
      );
    }
    config.particles.move.outModes = { default: 'bounce' };
  } else {
    if (AppState.particleState.originalOutModes) {
      config.particles.move.outModes = structuredClone(
        AppState.particleState.originalOutModes
      );
    }
    AppState.particleState.originalOutModes = {};
  }
};

/** Applies or removes the gravity effect based on the current state. */
export const applyGravityMode = () => {
  const config = AppState.particleState.currentConfig;
  if (!config.particles.move.gravity) config.particles.move.gravity = {};
  config.particles.move.gravity.enable = AppState.ui.isGravityOn;
  config.particles.move.gravity.acceleration = AppState.ui.isGravityOn
    ? PARTICLE_CONFIG.GRAVITY_ACCELERATION
    : 0;
};

/** Update theme-sensitive colors of current config and reload. */
export const updateThemeAndReload = async () => {
  const config = AppState.particleState.currentConfig;
  if (!config || Object.keys(config).length === 0) {
    UIManager.syncUI();
    return;
  }

  config.background.color.value = AppState.ui.isDarkMode
    ? THEME_BACKGROUNDS.DARK
    : THEME_BACKGROUNDS.LIGHT;
  // Rebuild the palette for the new theme. Preserve the existing palette size
  // so chaos-scaled variety is maintained across theme toggles.
  const fill = config.particles.paint?.fill;
  const currentColor = fill?.color?.value;
  if (fill && currentColor !== 'random') {
    const size = Array.isArray(currentColor) ? currentColor.length : 1;
    const palette = generatePalette(size, AppState.ui.isDarkMode);
    fill.color = {
      ...fill.color,
      value: palette.length === 1 ? palette[0] : palette,
    };
  }
  if (config.particles.links.enable) {
    config.particles.links.color.value = AppState.ui.isDarkMode
      ? '#ffffff'
      : '#333333';
  }
  // Trail fill is empty to inherit the individual particle's color instead of using the background color

  await loadParticles(config);
};
