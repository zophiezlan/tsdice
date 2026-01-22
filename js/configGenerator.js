import { AppState } from './state.js';
import {
  getRandomBool,
  getRandomItem,
  getRandomInRange,
  getChaosProbability,
} from './utils.js';
import {
  darkColorPalette,
  lightColorPalette,
  emojiOptions,
} from './constants/colors.js';
import {
  shapeOptions,
  directionOptions,
  hoverModeOptions,
  safeClickModes,
  PARTICLE_CONFIG,
} from './constants/particles.js';

const { MIN_POLYGON_SIDES, MAX_POLYGON_SIDES } = PARTICLE_CONFIG;

/**
 * @description Encapsulates all logic for generating random particle configurations.
 * All generator functions accept optional parameters for pure/testable behavior.
 * When called without parameters, they default to reading from AppState.
 */
export const ConfigGenerator = {
  /**
   * Generates appearance configuration (colors, shapes, opacity, size, stroke)
   * @param {Object} [options] - Optional parameters for pure function behavior
   * @param {number} [options.chaosLevel] - Chaos level (1-10), defaults to AppState
   * @param {boolean} [options.isDarkMode] - Theme mode, defaults to AppState
   * @returns {Object} Appearance configuration
   */
  generateAppearance: (options = {}) => {
    const chaosLevel = options.chaosLevel ?? AppState.particleState.chaosLevel;
    const isDarkMode = options.isDarkMode ?? AppState.ui.isDarkMode;

    const shapeType = getRandomItem(shapeOptions);
    const useRandomColor = getRandomBool(getChaosProbability(0.12, chaosLevel));
    const appearance = {
      color: {
        value: useRandomColor
          ? 'random'
          : getRandomItem(isDarkMode ? darkColorPalette : lightColorPalette),
      },
      shape: { type: shapeType, options: {} },
      opacity: { value: { min: 0.3, max: 1 } },
      size: {
        value: { min: 2, max: 2 + chaosLevel * 1.8 },
      },
      stroke: {
        width: getRandomBool(getChaosProbability(0.5, chaosLevel))
          ? getRandomInRange(1, 4)
          : 0,
        color: { value: 'random' },
      },
    };

    if (shapeType === 'polygon') {
      appearance.shape.options.polygon = {
        sides: Math.floor(
          getRandomInRange(MIN_POLYGON_SIDES, MAX_POLYGON_SIDES + 1)
        ),
      };
    }
    if (shapeType === 'character') {
      appearance.shape.options.character = {
        value: getRandomItem(emojiOptions),
        fill: true,
      };
    }
    if (Object.keys(appearance.shape.options).length === 0) {
      delete appearance.shape.options;
    }
    return appearance;
  },

  /**
   * Generates movement configuration (speed, direction, trails, attract)
   * @param {Object} [options] - Optional parameters for pure function behavior
   * @param {number} [options.chaosLevel] - Chaos level (1-10), defaults to AppState
   * @returns {Object} Movement configuration
   */
  generateMovement: (options = {}) => {
    const chaosLevel = options.chaosLevel ?? AppState.particleState.chaosLevel;

    const movement = {
      enable: true,
      speed: getRandomInRange(chaosLevel * 0.5, chaosLevel * 2),
      direction: getRandomItem(directionOptions),
      random: true,
      straight: false,
      outModes: { default: 'out' },
      trail: {
        enable: getRandomBool(getChaosProbability(0.4, chaosLevel)),
        length: getRandomInRange(3, 15),
        fill: {},
      },
    };
    if (getRandomBool(getChaosProbability(0.4, chaosLevel))) {
      movement.attract = {
        enable: true,
        rotate: {
          x: getRandomInRange(600, 1500),
          y: getRandomInRange(600, 1500),
        },
      };
    }
    return movement;
  },

  /**
   * Generates interaction configuration (hover/click modes, mode parameters)
   * @param {Object} [options] - Optional parameters for pure function behavior
   * @param {number} [options.chaosLevel] - Chaos level (1-10), defaults to AppState
   * @param {boolean} [options.skipStateUpdate] - If true, skip updating AppState (for pure testing)
   * @returns {Object} Interaction configuration with originalModes property
   */
  generateInteraction: (options = {}) => {
    const chaosLevel = options.chaosLevel ?? AppState.particleState.chaosLevel;
    const skipStateUpdate = options.skipStateUpdate ?? false;

    const hoverMode = getRandomItem(hoverModeOptions);
    const clickMode = getRandomItem(safeClickModes);

    const interaction = {
      detectsOn: 'canvas',
      events: {
        onHover: { enable: true, mode: hoverMode },
        onClick: { enable: true, mode: clickMode },
      },
      modes: {
        repulse: { distance: 50 + chaosLevel * 10 },
        push: { quantity: chaosLevel },
        bubble: {
          distance: 100 + chaosLevel * 15,
          size: 10 + chaosLevel * 2,
          duration: 2,
        },
        parallax: {
          enable: hoverMode === 'parallax',
          force: 5 * chaosLevel,
          smooth: 10,
        },
        grab: { distance: 150 + chaosLevel * 10 },
        slow: { factor: 3, radius: 200 },
        connect: { radius: 150 },
        remove: { quantity: chaosLevel },
        trail: { delay: 0.05, quantity: 1 },
        absorb: { speed: 2 + chaosLevel },
        attract: {
          distance: 200,
          speed: chaosLevel / 2,
        },
      },
    };

    // Store original modes unless explicitly skipped (for pure testing)
    if (!skipStateUpdate) {
      AppState.particleState.originalInteractionModes = {
        click: clickMode,
        hover: hoverMode,
      };
    }

    return interaction;
  },

  /**
   * Generates special effects configuration (collisions, wobble, rotate, links, etc.)
   * @param {Object} [currentFx] - Existing FX config to preserve certain properties
   * @param {Object} [options] - Optional parameters for pure function behavior
   * @param {number} [options.chaosLevel] - Chaos level (1-10), defaults to AppState
   * @param {boolean} [options.isDarkMode] - Theme mode, defaults to AppState
   * @returns {Object} Special effects configuration
   */
  generateSpecialFX: (currentFx = {}, options = {}) => {
    const chaosLevel = options.chaosLevel ?? AppState.particleState.chaosLevel;
    const isDarkMode = options.isDarkMode ?? AppState.ui.isDarkMode;

    return {
      life: { enable: false },
      collisions: {
        enable: getRandomBool(getChaosProbability(0.6, chaosLevel)),
        mode: getRandomBool(0.5) ? 'bounce' : 'destroy',
      },
      wobble: {
        enable: getRandomBool(getChaosProbability(0.5, chaosLevel)),
        distance: 1 + chaosLevel / 2,
        speed: 3 + chaosLevel / 2,
      },
      rotate: {
        animation: {
          enable: getRandomBool(getChaosProbability(0.7, chaosLevel)),
          speed: 5 * chaosLevel,
          sync: false,
        },
        direction: getRandomItem(['clockwise', 'counter-clockwise']),
      },
      links: {
        enable: getRandomBool(0.6),
        distance: 150,
        color: { value: isDarkMode ? '#ffffff' : '#333333' },
        opacity: 0.4,
        width: 1,
        triangles: {
          enable: getRandomBool(getChaosProbability(0.3, chaosLevel)),
        },
      },
      destroy: currentFx.destroy || { mode: 'none' },
      emitters: currentFx.emitters || [],
      twinkle: {
        particles: {
          enable: getRandomBool(getChaosProbability(0.4, chaosLevel)),
          frequency: 0.05,
          opacity: 1,
        },
      },
    };
  },
};
