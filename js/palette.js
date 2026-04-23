/**
 * @fileoverview OKLCH-based palette generator for per-shuffle color variety.
 * Uses the OKLCH color space (perceptually uniform) so every palette is
 * intrinsically harmonised — no more random hex lists that occasionally clash.
 *
 * We convert OKLCH → sRGB hex ourselves rather than passing oklch() strings to
 * tsParticles. Reason: @tsparticles/plugin-named-color has an empty prefix and
 * runs first in the color resolver, logging "Color not found" for every input
 * it doesn't recognise. It floods the console (55K lines per session) with
 * oklch() strings even though the OklchColorManager eventually handles them.
 * Conversion math from CSS Color Module Level 4 §10.
 */

import { getRandomInRange, getRandomItem } from './utils.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));

const linearToSrgb = (x) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

const toHex = (n) => {
  const v = Math.round(clamp01(n) * 255);
  return v.toString(16).padStart(2, '0');
};

/**
 * Converts OKLCH (L 0-100%, C 0-0.4, H 0-360) to sRGB #rrggbb.
 * Out-of-gamut channels are clamped to 0/1 rather than gamut-mapped — we pick
 * L/C ranges that stay inside sRGB so clipping is rare in practice.
 */
const oklchToHex = (lPercent, c, h) => {
  const L = lPercent / 100;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  const rLin =
    4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const gLin =
    -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bLin =
    -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  return `#${toHex(linearToSrgb(rLin))}${toHex(linearToSrgb(gLin))}${toHex(
    linearToSrgb(bLin)
  )}`;
};

/**
 * Hue-spread schemes. Each returns an array of N hue offsets (degrees) around
 * a base hue. Mixing schemes per shuffle produces recognisably different
 * palettes — sometimes tight analogous, sometimes wide split-complementary.
 */
const HUE_SCHEMES = {
  // Neighbouring hues — coherent, monochromatic feel
  analogous: (n) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * 25),
  // Triad-style spread — three families of colour
  triadic: (n) => Array.from({ length: n }, (_, i) => (i * 360) / n),
  // Base + its opposite with variance — high-contrast duos
  complementary: (n) =>
    Array.from({ length: n }, (_, i) =>
      i % 2 === 0 ? (i / 2) * 15 : 180 + ((i - 1) / 2) * 15
    ),
  // Even spread across the wheel — maximum variety
  quadratic: (n) =>
    Array.from({ length: n }, (_, i) => (i * 360) / Math.max(n, 4)),
};

const SCHEME_NAMES = Object.keys(HUE_SCHEMES);

/**
 * Generates a palette of `size` OKLCH colour strings harmonised around a
 * random base hue. Lightness and chroma are tuned to the theme so palettes
 * stay visible against the background.
 *
 * @param {number} size - Number of colours (clamped to 1+)
 * @param {boolean} isDarkMode - Pick bright palette for dark bg, vice versa
 * @returns {string[]} Array of #rrggbb hex strings usable as color.value
 */
export const generatePalette = (size, isDarkMode) => {
  const count = Math.max(1, Math.floor(size));
  const baseHue = Math.floor(getRandomInRange(0, 360));
  const scheme = getRandomItem(SCHEME_NAMES);
  const offsets = HUE_SCHEMES[scheme](count);

  // Dark bg → brighter, saturated particles. Light bg → deeper, still saturated.
  const lRange = isDarkMode ? [62, 82] : [42, 62];
  const cRange = [0.14, 0.24];

  return offsets.map((offset) => {
    const h = (((baseHue + offset) % 360) + 360) % 360;
    const l = getRandomInRange(lRange[0], lRange[1]);
    const c = getRandomInRange(cRange[0], cRange[1]);
    return oklchToHex(l, c, h);
  });
};
