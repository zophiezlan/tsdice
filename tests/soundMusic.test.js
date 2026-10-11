import { describe, it, expect } from 'vitest';
import {
  SCALES,
  hexToHue,
  hueToRootMidi,
  midiToHz,
  sceneHue,
  sceneToMusic,
  noteAt,
} from '../js/sound/music.js';

const scene = (value) => ({
  particles: { paint: { fill: { enable: true, color: { value } } } },
});

describe('music mapping', () => {
  it('reads hue from hex colours', () => {
    expect(hexToHue('#ff0000')).toBe(0);
    expect(hexToHue('#00ff00')).toBe(120);
    expect(hexToHue('#00f')).toBe(240);
    expect(hexToHue('random')).toBe(null);
    expect(hexToHue(undefined)).toBe(null);
  });

  it('gives each 30° of hue its own semitone, in a low-mid register', () => {
    expect(hueToRootMidi(0)).toBe(45);
    expect(hueToRootMidi(29)).toBe(45);
    expect(hueToRootMidi(30)).toBe(46);
    expect(hueToRootMidi(359)).toBe(56);
    expect(hueToRootMidi(-30)).toBe(56);
  });

  it('tunes A4 to 440Hz', () => {
    expect(midiToHz(69)).toBeCloseTo(440);
    expect(midiToHz(57)).toBeCloseTo(220);
  });

  it("uses the scene's first palette colour", () => {
    expect(sceneHue(scene(['#00ff00', '#ff0000']))).toBe(120);
    expect(sceneHue(scene('#0000ff'))).toBe(240);
    expect(
      sceneHue({
        particles: { paint: [{ fill: { color: { value: '#f00' } } }] },
      })
    ).toBe(0);
    expect(sceneHue(scene('random'))).toBe(null);
  });

  it('dark scenes are minor, light scenes major', () => {
    const dark = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 5,
      isDarkMode: true,
    });
    const light = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 5,
      isDarkMode: false,
    });
    expect(dark.scale).toBe(SCALES.minorPentatonic);
    expect(light.scale).toBe(SCALES.majorPentatonic);
  });

  it('chaos speeds up chimes and brightens the pad', () => {
    const calm = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 1,
      isDarkMode: true,
    });
    const wild = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 10,
      isDarkMode: true,
    });
    expect(calm.chimeInterval).toBeCloseTo(7);
    expect(wild.chimeInterval).toBeCloseTo(1.6);
    expect(wild.padCutoff).toBeGreaterThan(calm.padCutoff);
    expect(wild.chimeDecay).toBeLessThan(calm.chimeDecay);
  });

  it('falls back to a key for random-colour scenes', () => {
    const music = sceneToMusic({
      config: scene('random'),
      chaosLevel: 5,
      isDarkMode: true,
    });
    expect(music.rootMidi).toBe(hueToRootMidi(200));
  });

  it('only ever picks notes from the scale', () => {
    const music = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 5,
      isDarkMode: false,
    });
    for (let p = 0; p <= 1; p += 0.01) {
      const midi = noteAt(music, p, 1, 2);
      const degree = (((midi - music.rootMidi) % 12) + 12) % 12;
      expect(music.scale).toContain(degree);
      expect(midi).toBeGreaterThanOrEqual(music.rootMidi + 12);
      expect(midi).toBeLessThan(music.rootMidi + 36);
    }
  });

  it('higher positions give higher notes', () => {
    const music = sceneToMusic({
      config: scene('#f00'),
      chaosLevel: 5,
      isDarkMode: false,
    });
    expect(noteAt(music, 0.9)).toBeGreaterThan(noteAt(music, 0.1));
  });
});
