/**
 * @fileoverview Turns a scene into music: which key, which notes, how often.
 * Pure functions only, so the mapping can be tested without audio.
 *
 * Pentatonic scales have no semitone clashes, so any notes played together
 * (pad, ambient chimes, taps) stay consonant whatever the scene.
 */

/** Scale steps in semitones above the root */
export const SCALES = Object.freeze({
  // Light theme: open, bright
  majorPentatonic: [0, 2, 4, 7, 9],
  // Dark theme: mellow, a little wistful
  minorPentatonic: [0, 3, 5, 7, 10],
});

/** Root notes stay in a warm, low-mid register (MIDI 45 = A2) */
const ROOT_BASE_MIDI = 45;

/** Parses #rgb / #rrggbb to a hue in degrees, or null. */
export const hexToHue = (hex) => {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let hue;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return (hue * 60 + 360) % 360;
};

/** Each 30° of hue is one semitone, so related colours sound related. */
export const hueToRootMidi = (hue) =>
  ROOT_BASE_MIDI + (Math.floor((((hue % 360) + 360) % 360) / 30) % 12);

export const midiToHz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** The scene's main colour, whatever shape the paint config is in. */
export const sceneHue = (config) => {
  const paint = config?.particles?.paint;
  const fill = Array.isArray(paint) ? paint[0]?.fill : paint?.fill;
  const value = fill?.color?.value;
  const first = Array.isArray(value) ? value[0] : value;
  return hexToHue(first);
};

/**
 * @param {Object} params
 * @param {Object} params.config - The scene's particle config
 * @param {number} params.chaosLevel - 1-10
 * @param {boolean} params.isDarkMode
 * @returns {Object} Musical parameters for the sound engine
 */
export const sceneToMusic = ({ config, chaosLevel, isDarkMode }) => {
  const chaos = Math.min(10, Math.max(1, Number(chaosLevel) || 5));
  const t = (chaos - 1) / 9; // 0 at chaos 1, 1 at chaos 10
  const hue = sceneHue(config);
  return {
    rootMidi: hueToRootMidi(hue ?? 200),
    scale: isDarkMode ? SCALES.minorPentatonic : SCALES.majorPentatonic,
    /** Seconds between ambient chimes: 7s when calm, 1.6s at chaos 10 */
    chimeInterval: 7 - t * 5.4,
    /** Pad brightness: low-pass cutoff in Hz */
    padCutoff: 500 + t * 1500,
    /** How long chimes ring, in seconds: longer when calm */
    chimeDecay: 4 - t * 1.5,
  };
};

/**
 * Picks a scale note `octavesUp` above the root.
 * @param {Object} music - From sceneToMusic
 * @param {number} position - 0..1, e.g. a random number or tap height
 * @param {number} [octavesUp=1]
 * @param {number} [span=2] - Octaves the position spreads across
 */
export const noteAt = (music, position, octavesUp = 1, span = 2) => {
  const steps = music.scale.length * span;
  const index = Math.min(steps - 1, Math.max(0, Math.floor(position * steps)));
  const octave = Math.floor(index / music.scale.length);
  const degree = music.scale[index % music.scale.length];
  return music.rootMidi + 12 * (octavesUp + octave) + degree;
};
