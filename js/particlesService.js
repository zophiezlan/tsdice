import { tsParticles } from "https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm";
import { AppState } from "./state.js";
import { UIManager } from "./uiManager.js";
import { ConfigGenerator } from "./configGenerator.js";
import { getRandomItem } from "./utils.js";
import { darkColorPalette, lightColorPalette } from "./constants.js";

/**
 * Reapplies UI toggle states (walls, cursor, gravity) to a configuration.
 * Ensures toggle states persist across shuffles and undo/redo operations.
 */
export const reapplyToggleStates = (config) => {
  // Apply gravity state
  if (!config.particles.move.gravity) config.particles.move.gravity = {};
  config.particles.move.gravity.enable = AppState.ui.isGravityOn;
  config.particles.move.gravity.acceleration = AppState.ui.isGravityOn ? 20 : 0;

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
    config.particles.move.outModes = { default: "bounce" };
  } else {
    if (config.particles.move.outModes?.default !== "bounce") {
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
    config.interactivity.events.onHover.mode = "trail";
    config.interactivity.events.onClick.enable = false;
  }
};

/** Builds a configuration object according to shuffle options. */
export const buildConfig = (shuffleOptions) => {
  const isNew =
    !AppState.particleState.currentConfig ||
    Object.keys(AppState.particleState.currentConfig).length === 0;
  let newConfig = isNew ? {} : { ...AppState.particleState.currentConfig };

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
      color: { value: AppState.ui.isDarkMode ? "#111" : "#f0f0f0" },
    },
    fpsLimit: 120,
    detectRetina: true,
    pauseOnBlur: false,
    pauseOnOutsideViewport: false,
  });
  newConfig.particles.number = {
    value: 20 + AppState.particleState.chaosLevel * 20,
  };

  // Apply all UI toggle states to the new config
  reapplyToggleStates(newConfig);

  return newConfig;
};

/** Loads a given configuration into the tsParticles instance. */
export const loadParticles = async (config) => {
  const previousConfig = AppState.particleState.currentConfig;

  try {
    const loadingTimeout = setTimeout(() => {
      UIManager.showLoadingIndicator();
    }, 300);

    AppState.particleState.currentConfig = config;
    localStorage.setItem("tsDiceLastConfig", JSON.stringify(config));

    const containerEl = document.getElementById("tsparticles");
    if (containerEl && AppState.ui.particlesContainer) {
      containerEl.style.transition = "opacity 0.2s ease";
      containerEl.style.opacity = "0.3";
    }

    AppState.ui.particlesContainer = await tsParticles.load({
      id: "tsparticles",
      options: JSON.parse(JSON.stringify(config)),
    });

    if (containerEl) {
      setTimeout(() => {
        containerEl.style.opacity = "1";
      }, 50);
    }

    AppState.ui.isPaused = false;
    UIManager.syncUI();

    clearTimeout(loadingTimeout);
    UIManager.hideLoadingIndicator();
  } catch (error) {
    console.error("Failed to load particles:", error);
    UIManager.hideLoadingIndicator();

    if (previousConfig && Object.keys(previousConfig).length > 0) {
      AppState.particleState.currentConfig = previousConfig;
      try {
        await tsParticles.load({
          id: "tsparticles",
          options: JSON.parse(JSON.stringify(previousConfig)),
        });
        UIManager.showToast("Config error - restored previous state");
        UIManager.announce("Config error - restored previous state");
      } catch (recoveryError) {
        console.error("Recovery also failed:", recoveryError);
        UIManager.showToast("Failed to load particles - please refresh");
        UIManager.announce("Failed to load particles - please refresh");
      }
    } else {
      UIManager.showToast("Failed to load particle configuration");
      UIManager.announce("Failed to load particle configuration");
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
    config.interactivity.events.onHover.mode = "trail";
    config.interactivity.events.onClick.enable = false;
  } else {
    config.interactivity.events.onHover.mode =
      AppState.particleState.originalInteractionModes.hover || "repulse";
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
    config.particles.move.outModes = { default: "bounce" };
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
  config.particles.move.gravity.acceleration = AppState.ui.isGravityOn ? 20 : 0;
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
  config.background.color.value = AppState.ui.isDarkMode ? "#111" : "#f0f0f0";
  if (config.particles.color.value !== "random")
    config.particles.color.value = getRandomItem(newPalette);
  if (config.particles.links.enable)
    config.particles.links.color.value = AppState.ui.isDarkMode
      ? "#ffffff"
      : "#333333";
  if (config.particles.move.trail.enable)
    config.particles.move.trail.fill.color.value = AppState.ui.isDarkMode
      ? "#111"
      : "#f0f0f0";

  await loadParticles(config);
};
