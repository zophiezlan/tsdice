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
  'rounded-rect',
  'rounded-polygon',
];

/**
 * Busier shapes that can overwhelm a scene. Kept out of the main pool and
 * only mixed in at chaos 6+ (see PARTICLE_CONFIG.INTENSE_SHAPE_*).
 */
export const intenseShapeOptions = ['spiral', 'infinity'];

/**
 * Path generators from @tsparticles/all. Names match the `addPathGenerator`
 * registration in each plugin's index.js, not the package name.
 */
export const pathGeneratorOptions = [
  'perlinNoise',
  'simplexNoise',
  'curlNoise',
  'zigZagPathGenerator',
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
 * Click interaction modes (safe for production). 'attract' replaces the old
 * 'absorb', which matched no tsParticles mode, so that click did nothing.
 * Real absorbers are permanent and pile up with every click; a click-attract
 * pulls particles in briefly and lets them go.
 */
export const safeClickModes = ['push', 'bubble', 'remove', 'trail', 'attract'];

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
  BATTERY_SAVER_FPS_LIMIT: 60,
  BATTERY_SAVER_PARTICLE_CAP: 160,
  BATTERY_SAVER_MAX_SPEED: 12,
  /**
   * Particle size range, the same at every chaos level. Chaos means more
   * and busier, not bigger: big particles just make the screen feel small.
   */
  PARTICLE_SIZE: Object.freeze({ min: 1, max: 8.5 }),
  /** How big the hover "bubble" swells particles, at every chaos level */
  BUBBLE_SIZE: 20,
  /** Chance a linked scene fills its link triangles at low chaos… */
  TRIANGLE_MAX_PROB: 0.3,
  /** …held up to this chaos level… */
  TRIANGLE_FADE_START: 4,
  /** …then fading out, off from this level up */
  TRIANGLE_OFF_AT: 8,
  /** Chaos level at which spiral/infinity can appear */
  INTENSE_SHAPE_MIN_CHAOS: 6,
  /** Chance a shuffle features spiral/infinity at the min chaos level… */
  INTENSE_SHAPE_MIN_PROB: 0.05,
  /** …rising linearly to this at chaos 10 */
  INTENSE_SHAPE_MAX_PROB: 0.3,
};
