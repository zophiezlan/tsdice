/**
 * @fileoverview Upgrades tsParticles v3 configs to the v4 option layout.
 *
 * Share links (my.ket.horse short links included) and saved localStorage
 * scenes created before the v4 upgrade still hold v3 configs. v4 silently
 * ignores the old keys — a `#ff007b` v3 scene renders white — so every
 * config read from outside the running session goes through here first.
 */

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Converts v3 option keys to their v4 equivalents, in place:
 * - `particles.color`  → `particles.paint.fill` ({ enable, color })
 * - `particles.stroke` → `particles.paint.stroke`
 * - `interactivity.events.resize` → `resize`
 * Already-converted configs pass through unchanged.
 *
 * @param {Object} config - A tsParticles options object
 * @returns {Object} The same object, now in v4 layout
 */
export const migrateV3Config = (config) => {
  if (!isObject(config)) return config;

  const particles = config.particles;
  if (isObject(particles)) {
    const { color, stroke } = particles;
    if (!particles.paint && (color !== undefined || stroke !== undefined)) {
      const paint = {};
      if (color !== undefined) paint.fill = { enable: true, color };
      if (isObject(stroke)) paint.stroke = { width: 0, ...stroke };
      particles.paint = paint;
    }
    delete particles.color;
    delete particles.stroke;
  }

  const events = config.interactivity?.events;
  if (isObject(events) && events.resize !== undefined) {
    if (config.resize === undefined) {
      config.resize = isObject(events.resize)
        ? events.resize
        : { enable: Boolean(events.resize) };
    }
    delete events.resize;
  }

  return config;
};
