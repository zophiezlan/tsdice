import { describe, it, expect } from 'vitest';
import { generatePalette } from '../js/palette.js';

describe('generatePalette', () => {
  it('returns the requested number of colours', () => {
    const palette = generatePalette(5, true);
    expect(palette).toHaveLength(5);
  });

  it('clamps size to at least 1', () => {
    const palette = generatePalette(0, true);
    expect(palette).toHaveLength(1);
  });

  it('emits valid #rrggbb hex strings', () => {
    const palette = generatePalette(6, true);
    const hexRegex = /^#[0-9a-f]{6}$/;
    palette.forEach((c) => expect(c).toMatch(hexRegex));
  });

  it('keeps colours brighter in dark mode than in light mode', () => {
    // Relative luminance from hex — brighter palette should score higher.
    const luminance = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const darkAvg = avg(generatePalette(60, true).map(luminance));
    const lightAvg = avg(generatePalette(60, false).map(luminance));
    expect(darkAvg).toBeGreaterThan(lightAvg);
  });

  it('produces varied palettes across calls', () => {
    const p1 = generatePalette(4, true).join(',');
    const p2 = generatePalette(4, true).join(',');
    // Extremely unlikely to match: different base hue, L, C on every call.
    expect(p1).not.toBe(p2);
  });
});
