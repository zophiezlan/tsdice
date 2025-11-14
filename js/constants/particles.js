/**
 * @fileoverview Particle configuration options for tsParticles
 */

/**
 * Available particle shapes
 */
export const shapeOptions = [
  'circle',
  'square',
  'triangle',
  'star',
  'polygon',
  'line',
  'heart',
  'rounded-rectangle',
  'character',
];

/**
 * Movement direction options
 */
export const directionOptions = [
  'none',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
  'top-left',
];

/**
 * Hover interaction modes
 */
export const hoverModeOptions = [
  'repulse',
  'grab',
  'bubble',
  'slow',
  'connect',
  'parallax',
  'attract',
];

/**
 * Click interaction modes (safe for production)
 */
export const safeClickModes = ['push', 'bubble', 'remove', 'trail', 'absorb'];

/**
 * Particle configuration constants
 */
export const PARTICLE_CONFIG = {
  MIN_POLYGON_SIDES: 3,
  MAX_POLYGON_SIDES: 12,
  FPS_LIMIT: 120,
  BASE_PARTICLE_COUNT: 20,
  CHAOS_PARTICLE_MULTIPLIER: 20,
  GRAVITY_ACCELERATION: 20,
};
