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
  shapeOptions,
  directionOptions,
  hoverModeOptions,
  safeClickModes,
  emojiOptions,
} from './constants.js';
import { PARTICLE_CONFIG } from './constants/particles.js';

const { MIN_POLYGON_SIDES, MAX_POLYGON_SIDES } = PARTICLE_CONFIG;

/**
 * @description Encapsulates all logic for generating random particle configurations.
 */
export const ConfigGenerator = {
  generateAppearance: () => {
    const shapeType = getRandomItem(shapeOptions);
    const appearance = {
      color: {
        value: getRandomBool(0.2)
          ? 'random'
          : getRandomItem(
              AppState.ui.isDarkMode ? darkColorPalette : lightColorPalette
            ),
      },
      shape: { type: shapeType, options: {} },
      opacity: { value: { min: 0.3, max: 1 } },
      size: {
        value: { min: 1, max: 1 + AppState.particleState.chaosLevel * 1.5 },
      },
      stroke: {
        width: getRandomBool(
          getChaosProbability(0.5, AppState.particleState.chaosLevel)
        )
          ? getRandomInRange(1, 4)
          : 0,
        color: { value: 'random' },
      },
    };

    if (shapeType === 'polygon')
      appearance.shape.options.polygon = {
        sides: Math.floor(
          getRandomInRange(MIN_POLYGON_SIDES, MAX_POLYGON_SIDES + 1)
        ),
      };
    if (shapeType === 'character')
      appearance.shape.options.character = {
        value: getRandomItem(emojiOptions),
        fill: true,
      };
    if (Object.keys(appearance.shape.options).length === 0)
      delete appearance.shape.options;
    return appearance;
  },

  generateMovement: () => {
    const movement = {
      enable: true,
      speed: getRandomInRange(
        AppState.particleState.chaosLevel * 0.5,
        AppState.particleState.chaosLevel * 2
      ),
      direction: getRandomItem(directionOptions),
      random: true,
      straight: false,
      outModes: { default: 'out' },
      trail: {
        enable: getRandomBool(
          getChaosProbability(0.4, AppState.particleState.chaosLevel)
        ),
        length: getRandomInRange(3, 15),
        fill: { color: { value: AppState.ui.isDarkMode ? '#111' : '#f0f0f0' } },
      },
    };
    if (
      getRandomBool(getChaosProbability(0.4, AppState.particleState.chaosLevel))
    ) {
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

  generateInteraction: () => {
    const hoverMode = getRandomItem(hoverModeOptions);
    const interaction = {
      detectsOn: 'canvas',
      events: {
        onHover: { enable: true, mode: hoverMode },
        onClick: { enable: true, mode: getRandomItem(safeClickModes) },
      },
      modes: {
        repulse: { distance: 50 + AppState.particleState.chaosLevel * 10 },
        push: { quantity: AppState.particleState.chaosLevel },
        bubble: {
          distance: 100 + AppState.particleState.chaosLevel * 15,
          size: 10 + AppState.particleState.chaosLevel * 2,
          duration: 2,
        },
        parallax: {
          enable: hoverMode === 'parallax',
          force: 5 * AppState.particleState.chaosLevel,
          smooth: 10,
        },
        grab: { distance: 150 + AppState.particleState.chaosLevel * 10 },
        slow: { factor: 3, radius: 200 },
        connect: { radius: 150 },
        remove: { quantity: AppState.particleState.chaosLevel },
        trail: { delay: 0.05, quantity: 1 },
        absorb: { speed: 2 + AppState.particleState.chaosLevel },
        attract: {
          distance: 200,
          speed: AppState.particleState.chaosLevel / 2,
        },
      },
    };
    AppState.particleState.originalInteractionModes = {
      click: interaction.events.onClick.mode,
      hover: interaction.events.onHover.mode,
    };
    return interaction;
  },

  generateSpecialFX: (currentFx = {}) => ({
    life: { enable: false },
    collisions: {
      enable: getRandomBool(
        getChaosProbability(0.6, AppState.particleState.chaosLevel)
      ),
      mode: getRandomBool(0.5) ? 'bounce' : 'destroy',
    },
    wobble: {
      enable: getRandomBool(
        getChaosProbability(0.5, AppState.particleState.chaosLevel)
      ),
      distance: 1 + AppState.particleState.chaosLevel / 2,
      speed: 3 + AppState.particleState.chaosLevel / 2,
    },
    rotate: {
      animation: {
        enable: getRandomBool(
          getChaosProbability(0.7, AppState.particleState.chaosLevel)
        ),
        speed: 5 * AppState.particleState.chaosLevel,
        sync: false,
      },
      direction: getRandomItem(['clockwise', 'counter-clockwise']),
    },
    links: {
      enable: getRandomBool(0.6),
      distance: 150,
      color: { value: AppState.ui.isDarkMode ? '#ffffff' : '#333333' },
      opacity: 0.4,
      width: 1,
      triangles: {
        enable: getRandomBool(
          getChaosProbability(0.3, AppState.particleState.chaosLevel)
        ),
      },
    },
    destroy: currentFx.destroy || { mode: 'none' },
    emitters: currentFx.emitters || [],
    twinkle: {
      particles: {
        enable: getRandomBool(
          getChaosProbability(0.4, AppState.particleState.chaosLevel)
        ),
        frequency: 0.05,
        opacity: 1,
      },
    },
  }),
};
