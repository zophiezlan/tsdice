/**
 * @fileoverview Comfort layer: limits every scene must stay within before it
 * is drawn, wherever it came from — a shuffle, undo/redo, a saved scene, or
 * a share link someone hand-crafted.
 *
 * tsDice is curated for people in altered states, so the limits encode that
 * curation in one place: no strobing, no scenes that drain to nothing, no
 * runaway particle counts, and only the interactions tsDice chooses.
 *
 * The limits sit at or above anything the generator (and Party Mode)
 * produces, so today's scenes are untouched; they only bite on configs that
 * would otherwise go further. tests/comfort.test.js holds that guarantee.
 */

import { hoverModeOptions, safeClickModes } from './constants.js';

export const COMFORT_LIMITS = Object.freeze({
  /** Party Mode's 300 is the most tsDice ever draws */
  MAX_PARTICLES: 300,
  /** Generator tops out at chaos 10 × 2 */
  MAX_SPEED: 20,
  /**
   * Largest particle radius tsDice draws, the generator's fixed maximum.
   * Older share links (made when size grew with chaos) are brought down to it.
   */
  MAX_SIZE: 8.5,
  /**
   * Per-frame chance a particle is drawn at full twinkle opacity. 0.05 is
   * a sparse sparkle on small particles, never a whole-screen flash.
   */
  MAX_TWINKLE_FREQUENCY: 0.05,
  /**
   * Opacity animation speed S cycles roughly 0.3 × S times a second; WCAG
   * 2.3.1 allows at most 3 flashes a second. 3 keeps fades slow (~1/s).
   */
  MAX_OPACITY_ANIMATION_SPEED: 3,
  /** Colour animation: slow drifts only, no rapid lightness cycling */
  MAX_COLOR_ANIMATION_SPEED: 30,
  /** Fallbacks for interaction modes tsDice doesn't curate */
  FALLBACK_HOVER_MODE: 'repulse',
  FALLBACK_CLICK_MODE: 'push',
});

/** The cursor-particle toggle swaps the hover mode to 'trail'. */
const ALLOWED_HOVER_MODES = new Set([...hoverModeOptions, 'trail']);
const ALLOWED_CLICK_MODES = new Set(safeClickModes);

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Clamps a tsParticles range value (number or { min, max }) to `max`.
 * Returns true when it had to change anything.
 */
const clampRange = (holder, key, max) => {
  const value = holder?.[key];
  if (typeof value === 'number') {
    if (value <= max) return false;
    holder[key] = max;
    return true;
  }
  if (isObject(value)) {
    let changed = false;
    for (const end of ['min', 'max']) {
      if (typeof value[end] === 'number' && value[end] > max) {
        value[end] = max;
        changed = true;
      }
    }
    return changed;
  }
  return false;
};

/** Caps an animation's speed, including HSL per-channel animations. */
const clampColorAnimation = (color, max) => {
  if (!isObject(color?.animation)) return false;
  const anim = color.animation;
  let changed = clampRange(anim, 'speed', max);
  for (const channel of ['h', 's', 'l']) {
    if (isObject(anim[channel])) {
      changed = clampRange(anim[channel], 'speed', max) || changed;
    }
  }
  return changed;
};

/** Keeps only curated modes; falls back when none survive. */
const filterModes = (event, allowed, fallback) => {
  if (!isObject(event) || event.mode === undefined) return false;
  const modes = Array.isArray(event.mode) ? event.mode : [event.mode];
  const kept = modes.filter((m) => allowed.has(m));
  if (kept.length === modes.length) return false;
  event.mode =
    kept.length === 0 ? fallback : kept.length === 1 ? kept[0] : kept;
  return true;
};

/**
 * Applies the comfort limits to a render-options object, in place.
 * Call it on the copy handed to tsParticles, not the stored config, so share
 * links keep what their author made and every viewer gets the safe version.
 *
 * @param {Object} options - tsParticles options about to be loaded
 * @returns {string[]} Names of the rules that changed something
 */
export const applyComfortLimits = (options) => {
  const applied = [];
  if (!isObject(options)) return applied;
  const note = (rule, changed) => {
    if (changed) applied.push(rule);
  };
  const L = COMFORT_LIMITS;
  const particles = isObject(options.particles) ? options.particles : null;

  if (particles) {
    // Count: cap the scene, and stop push-clicks growing it past the cap.
    if (!isObject(particles.number)) particles.number = {};
    note(
      'particleCount',
      clampRange(particles.number, 'value', L.MAX_PARTICLES)
    );
    particles.number.limit = { mode: 'wait', value: L.MAX_PARTICLES };

    note('speed', clampRange(particles.move, 'speed', L.MAX_SPEED));
    note('size', clampRange(particles.size, 'value', L.MAX_SIZE));

    // Flash safety
    const twinkleParticles = clampRange(
      particles.twinkle?.particles,
      'frequency',
      L.MAX_TWINKLE_FREQUENCY
    );
    const twinkleLinks = clampRange(
      particles.twinkle?.links,
      'frequency',
      L.MAX_TWINKLE_FREQUENCY
    );
    note('twinkle', twinkleParticles || twinkleLinks);
    note(
      'opacityAnimation',
      clampRange(
        particles.opacity?.animation,
        'speed',
        L.MAX_OPACITY_ANIMATION_SPEED
      )
    );
    const paints = Array.isArray(particles.paint)
      ? particles.paint
      : [particles.paint];
    let colorChanged = false;
    for (const paint of paints) {
      if (!isObject(paint)) continue;
      for (const color of [
        paint.color,
        paint.fill?.color,
        paint.stroke?.color,
      ]) {
        colorChanged =
          clampColorAnimation(color, L.MAX_COLOR_ANIMATION_SPEED) ||
          colorChanged;
      }
    }
    note('colorAnimation', colorChanged);

    // No draining: collisions bounce, nothing self-destructs.
    if (
      isObject(particles.collisions) &&
      particles.collisions.mode !== undefined &&
      particles.collisions.mode !== 'bounce'
    ) {
      particles.collisions.mode = 'bounce';
      note('collisions', true);
    }
    if (
      isObject(particles.destroy) &&
      particles.destroy.mode !== undefined &&
      particles.destroy.mode !== 'none'
    ) {
      particles.destroy.mode = 'none';
      note('destroy', true);
    }
  }

  // Only the interactions tsDice curates
  const events = options.interactivity?.events;
  if (isObject(events)) {
    note(
      'hoverMode',
      filterModes(events.onHover, ALLOWED_HOVER_MODES, L.FALLBACK_HOVER_MODE)
    );
    note(
      'clickMode',
      filterModes(events.onClick, ALLOWED_CLICK_MODES, L.FALLBACK_CLICK_MODE)
    );
  }

  return applied;
};
