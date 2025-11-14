/**
 * @fileoverview UI-related constants including button IDs and timing values
 */

/**
 * Button element IDs used throughout the application
 */
export const BUTTON_IDS = {
  SHUFFLE_ALL: 'btn-shuffle-all',
  SHUFFLE_APPEARANCE: 'btn-shuffle-appearance',
  SHUFFLE_MOVEMENT: 'btn-shuffle-movement',
  SHUFFLE_INTERACTION: 'btn-shuffle-interaction',
  SHUFFLE_FX: 'btn-shuffle-fx',
  BACK: 'btn-back',
  FORWARD: 'btn-forward',
  THEME: 'btn-theme',
  GRAVITY: 'btn-gravity',
  WALLS: 'btn-walls',
  CURSOR: 'btn-cursor',
  REFRESH: 'btn-refresh',
  PAUSE: 'btn-pause',
  SHARE: 'btn-share',
  INFO: 'btn-info',
  MAIN_MENU: 'main-menu-btn',
};

/**
 * Timing constants for UI interactions (in milliseconds)
 */
export const TIMING = {
  AUTO_HIDE_DELAY: 10000, // Menu auto-hide delay
  TOOLTIP_DELAY: 500, // Delay before showing tooltip
  TOOLTIP_AUTO_HIDE: 3000, // Tooltip auto-hide duration
  TOAST_DURATION: 3000, // Toast notification duration
  BURST_EFFECT: 150, // Particle burst animation duration
  FADE_TRANSITION: 200, // Opacity fade duration
  LOADING_DELAY: 300, // Delay before showing loading indicator
};

/**
 * UI opacity and visual effect values
 */
export const UI_VALUES = {
  OPACITY_LOADING: 0.3, // Container opacity during loading
  OPACITY_FULL: 1, // Full opacity
  TOOLTIP_PADDING: 15, // Tooltip positioning padding
  BURST_BRIGHTNESS: 1.3, // Brightness multiplier for burst effect
};

// Backward compatibility exports
export const AUTO_HIDE_DELAY = TIMING.AUTO_HIDE_DELAY;
export const TOOLTIP_DELAY = TIMING.TOOLTIP_DELAY;
export const TOOLTIP_AUTO_HIDE = TIMING.TOOLTIP_AUTO_HIDE;
