import { tsParticles } from 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm';
import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { ConfigGenerator } from './configGenerator.js';
import { getRandomItem } from './utils.js';
import { darkColorPalette, lightColorPalette } from './constants.js';
import { PARTICLE_CONFIG } from './constants/particles.js';
import { THEME_BACKGROUNDS } from './constants/colors.js';
import { SafeStorage } from './storage.js';
import { Telemetry } from './telemetry.js';

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

      if (options.particles.move.trail) {
        options.particles.move.trail.enable = false;
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
    if (shuffleOptions.appearance)
      Object.assign(newConfig.particles, ConfigGenerator.generateAppearance());
    if (shuffleOptions.movement)
      newConfig.particles.move = {
        ...newConfig.particles.move,
        ...ConfigGenerator.generateMovement(),
      };
    if (shuffleOptions.interaction)
      newConfig.interactivity = ConfigGenerator.generateInteraction();
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

  try {
    const loadingTimeout = setTimeout(() => {
      UIManager.showLoadingIndicator();
    }, 300);

    AppState.particleState.currentConfig = config;
    SafeStorage.setItem('tsDiceLastConfig', JSON.stringify(config));

    const containerEl = document.getElementById('tsparticles');
    if (containerEl && AppState.ui.particlesContainer) {
      containerEl.style.transition = 'opacity 0.2s ease';
      containerEl.style.opacity = '0.3';
    }

    const optionsWithAdvanced = JSON.parse(JSON.stringify(config));
    applyAdvancedPreferences(optionsWithAdvanced);

    AppState.ui.particlesContainer = await tsParticles.load({
      id: 'tsparticles',
      options: optionsWithAdvanced,
    });

    if (containerEl) {
      setTimeout(() => {
        containerEl.style.opacity = '1';
      }, 50);
    }

    AppState.ui.isPaused = false;
    UIManager.syncUI();

    clearTimeout(loadingTimeout);
    UIManager.hideLoadingIndicator();
    const endTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    Telemetry.log('particles:load:success', {
      ...metrics,
      durationMs: Math.round(endTime - loadStart),
      batterySaver: AppState.advanced.batterySaverMode,
    });
  } catch (error) {
    console.error('Failed to load particles:', error);
    UIManager.hideLoadingIndicator();
    Telemetry.logError('particles:load', error, metrics);

    if (previousConfig && Object.keys(previousConfig).length > 0) {
      AppState.particleState.currentConfig = previousConfig;
      try {
        await tsParticles.load({
          id: 'tsparticles',
          options: JSON.parse(JSON.stringify(previousConfig)),
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

  const newPalette = AppState.ui.isDarkMode
    ? darkColorPalette
    : lightColorPalette;
  config.background.color.value = AppState.ui.isDarkMode
    ? THEME_BACKGROUNDS.DARK
    : THEME_BACKGROUNDS.LIGHT;
  if (config.particles.color.value !== 'random')
    config.particles.color.value = getRandomItem(newPalette);
  if (config.particles.links.enable)
    config.particles.links.color.value = AppState.ui.isDarkMode
      ? '#ffffff'
      : '#333333';
  if (config.particles.move.trail.enable)
    config.particles.move.trail.fill.color.value = AppState.ui.isDarkMode
      ? THEME_BACKGROUNDS.DARK
      : THEME_BACKGROUNDS.LIGHT;

  await loadParticles(config);
};
