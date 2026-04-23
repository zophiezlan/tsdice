import { AppState } from './state.js';
import {
  getRandomBool,
  getRandomItem,
  getRandomInRange,
  getRandomSubset,
  getChaosProbability,
} from './utils.js';
import {
  shapeOptions,
  directionOptions,
  hoverModeOptions,
  safeClickModes,
  pathGeneratorOptions,
} from './constants.js';
import { PARTICLE_CONFIG } from './constants/particles.js';
import { generatePalette } from './palette.js';

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

    // Per-particle variety is gated by a chaos-scaled probability so the
    // slider actually changes the scene. 0% at chaos 0, 50% at chaos 10 —
    // most low-chaos shuffles stay single-shape / single-colour and feel
    // coherent, while high-chaos shuffles roll into the full array mix.
    // Shape variety is deliberately gated harder than colour (visually louder).
    const shapeVarietyProb = chaosLevel / 20;
    const colorVarietyProb = chaosLevel / 15;
    const useShapeArray = getRandomBool(shapeVarietyProb);
    const useColorArray = getRandomBool(colorVarietyProb);

    const paletteSize = useColorArray
      ? Math.max(2, Math.round(2 + chaosLevel * 0.5))
      : 1;
    const shapeSubsetSize = useShapeArray
      ? Math.max(2, Math.round(2 + chaosLevel * 0.7))
      : 1;

    const palette = generatePalette(paletteSize, isDarkMode);
    const shapeSubset = getRandomSubset(shapeOptions, shapeSubsetSize);

    const shapeOpts = {};
    if (shapeSubset.includes('polygon')) {
      shapeOpts.polygon = {
        sides: Math.floor(
          getRandomInRange(MIN_POLYGON_SIDES, MAX_POLYGON_SIDES + 1)
        ),
      };
    }
    // Cap rounded-polygon at 3-6 sides. Above ~7, the arcTo border radius on
    // adjacent corners overlaps and the shape renders as an irregular splat
    // of spikes — unrecognizable at particle sizes. Small borderRadius too,
    // for the same reason.
    if (shapeSubset.includes('rounded-polygon')) {
      shapeOpts['rounded-polygon'] = {
        sides: Math.floor(getRandomInRange(3, 7)),
        radius: getRandomInRange(2, 5),
      };
    }
    if (shapeSubset.includes('spiral')) {
      shapeOpts.spiral = {
        innerRadius: getRandomInRange(1, 3),
        lineSpacing: getRandomInRange(1, 2 + chaosLevel / 4),
        widthFactor: getRandomInRange(6, 12),
      };
    }

    // Unwrap single-element arrays so tsParticles sees a plain value — avoids
    // the reduceDuplicates machinery churning for nothing at low chaos.
    const appearance = {
      color: { value: palette.length === 1 ? palette[0] : palette },
      shape: { type: shapeSubset.length === 1 ? shapeSubset[0] : shapeSubset },
      opacity: { value: { min: 0.3, max: 1 } },
      size: {
        value: { min: 1, max: 1 + chaosLevel * 1.5 },
      },
      stroke: {
        width: getRandomBool(getChaosProbability(0.5, chaosLevel))
          ? getRandomInRange(1, 4)
          : 0,
        color: { value: 'random' },
      },
      reduceDuplicates: useShapeArray || useColorArray,
    };

    if (Object.keys(shapeOpts).length > 0) {
      appearance.shape.options = shapeOpts;
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
    // Organic flow fields from @tsparticles/all. Paths (especially zig-zag)
    // dominate the scene — only turn them on at chaos 6+, scaling ~1% → ~8%
    // from chaos 6 to 10. Outside that range plain random movement wins.
    if (chaosLevel >= 6) {
      const pathProbability = 0.01 + (chaosLevel - 6) * 0.0175;
      if (getRandomBool(pathProbability)) {
        movement.path = {
          enable: true,
          delay: { value: 0 },
          generator: getRandomItem(pathGeneratorOptions),
          options: {},
        };
      }
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
        // Always bounce. 'destroy' permanently removes particles on contact
        // and tsParticles doesn't replace them, so repeated shuffles with
        // destroy-mode collisions deplete the scene to nothing.
        enable: getRandomBool(getChaosProbability(0.6, chaosLevel)),
        mode: 'bounce',
        // Allow overlapping spawns. Without this, tsParticles recursively
        // retries placement until every particle is non-overlapping; at high
        // density (chaos 7+) that loop never terminates and tsParticles.load
        // hangs. See @tsparticles/engine Particle._checkOverlap.
        overlap: { enable: true, retries: 0 },
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
      tilt: {
        enable: getRandomBool(getChaosProbability(0.12, chaosLevel)),
        value: { min: 0, max: 360 },
        direction: getRandomItem(['clockwise', 'counter-clockwise']),
        animation: {
          enable: true,
          speed: 10 + chaosLevel * 3,
          sync: false,
        },
      },
      roll: {
        enable: getRandomBool(getChaosProbability(0.1, chaosLevel)),
        speed: 5 + chaosLevel * 2,
        mode: getRandomItem(['vertical', 'horizontal']),
      },
    };
  },
};
