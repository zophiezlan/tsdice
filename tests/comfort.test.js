import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@tsparticles/engine', () => ({
  tsParticles: { load: vi.fn() },
}));

vi.mock('../js/storage.js', () => ({
  SafeStorage: { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() },
}));

import { applyComfortLimits, COMFORT_LIMITS } from '../js/comfort.js';
import { buildConfig } from '../js/particlesService.js';
import { AppState } from '../js/state.js';

const withoutLimit = (config) => {
  const copy = structuredClone(config);
  delete copy.particles.number.limit;
  return copy;
};

/** Party Mode's overrides, as applied in main.js */
const partyMode = (config) => {
  config.particles.number.value = 300;
  config.particles.paint.fill.color = { value: 'random' };
  config.particles.move.speed = 10;
  config.particles.shape.type = ['star', 'circle', 'triangle'];
  config.particles.size.value = { min: 2, max: 8 };
  config.particles.move.outModes = { default: 'bounce' };
  return config;
};

const hostileScene = () => ({
  particles: {
    number: { value: 5000 },
    move: { speed: { min: 5, max: 90 } },
    size: { value: 120 },
    opacity: { value: 1, animation: { enable: true, speed: 40 } },
    twinkle: {
      particles: { enable: true, frequency: 0.9 },
      links: { enable: true, frequency: 0.5 },
    },
    paint: [
      {
        fill: {
          enable: true,
          color: {
            value: '#ff0000',
            animation: {
              h: { enable: true, speed: 400 },
              l: { enable: true, speed: 300 },
            },
          },
        },
      },
      { stroke: { width: 2, color: { animation: { speed: 200 } } } },
    ],
    collisions: { enable: true, mode: 'destroy' },
    destroy: { mode: 'split' },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: ['grab', 'light'] },
      onClick: { enable: true, mode: 'cannon' },
    },
  },
});

describe('applyComfortLimits', () => {
  beforeEach(() => {
    AppState.ui.isDarkMode = true;
    AppState.ui.isGravityOn = false;
    AppState.ui.areWallsOn = false;
    AppState.ui.isCursorParticle = false;
    AppState.particleState.currentConfig = {};
    AppState.particleState.originalOutModes = {};
    AppState.particleState.originalInteractionModes = {};
  });

  it('leaves every scene tsDice generates untouched (bar the count limit)', () => {
    const toggleSets = [
      [false, false, false],
      [true, true, true],
    ];
    for (let chaos = 1; chaos <= 10; chaos++) {
      AppState.particleState.chaosLevel = chaos;
      for (const [gravity, walls, cursor] of toggleSets) {
        AppState.ui.isGravityOn = gravity;
        AppState.ui.areWallsOn = walls;
        AppState.ui.isCursorParticle = cursor;
        for (let i = 0; i < 150; i++) {
          const config = buildConfig({ all: true });
          const before = JSON.stringify(config);
          const applied = applyComfortLimits(config);

          expect(applied).toEqual([]);
          expect(JSON.stringify(withoutLimit(config))).toBe(before);
        }
      }
    }
  });

  it('leaves Party Mode untouched', () => {
    AppState.particleState.chaosLevel = 10;
    for (let i = 0; i < 50; i++) {
      const config = partyMode(buildConfig({ all: true }));
      const before = JSON.stringify(config);
      expect(applyComfortLimits(config)).toEqual([]);
      expect(JSON.stringify(withoutLimit(config))).toBe(before);
    }
  });

  it('stops push-clicks growing the scene past the cap', () => {
    const config = buildConfig({ all: true });
    applyComfortLimits(config);
    expect(config.particles.number.limit).toEqual({
      mode: 'wait',
      value: COMFORT_LIMITS.MAX_PARTICLES,
    });
  });

  it('reins in a hand-crafted harsh scene', () => {
    const config = hostileScene();
    const applied = applyComfortLimits(config);
    const p = config.particles;

    expect(applied.sort()).toEqual(
      [
        'clickMode',
        'collisions',
        'colorAnimation',
        'destroy',
        'hoverMode',
        'opacityAnimation',
        'particleCount',
        'size',
        'speed',
        'twinkle',
      ].sort()
    );
    expect(p.number.value).toBe(COMFORT_LIMITS.MAX_PARTICLES);
    expect(p.move.speed).toEqual({ min: 5, max: COMFORT_LIMITS.MAX_SPEED });
    expect(p.size.value).toBe(COMFORT_LIMITS.MAX_SIZE);
    expect(p.twinkle.particles.frequency).toBe(0.05);
    expect(p.twinkle.links.frequency).toBe(0.05);
    expect(p.opacity.animation.speed).toBe(3);
    expect(p.paint[0].fill.color.animation.h.speed).toBe(30);
    expect(p.paint[0].fill.color.animation.l.speed).toBe(30);
    expect(p.paint[1].stroke.color.animation.speed).toBe(30);
    expect(p.collisions.mode).toBe('bounce');
    expect(p.destroy.mode).toBe('none');
    expect(config.interactivity.events.onHover.mode).toBe('grab');
    expect(config.interactivity.events.onClick.mode).toBe('push');
  });

  it('keeps flashing under WCAG 2.3.1 (3 per second)', () => {
    // Opacity animation speed S cycles ~0.3 × S times a second
    expect(0.3 * COMFORT_LIMITS.MAX_OPACITY_ANIMATION_SPEED).toBeLessThan(3);
  });

  it('allows the cursor trail hover mode', () => {
    const config = hostileScene();
    config.interactivity.events.onHover.mode = 'trail';
    applyComfortLimits(config);
    expect(config.interactivity.events.onHover.mode).toBe('trail');
  });

  it('is idempotent', () => {
    const once = hostileScene();
    applyComfortLimits(once);
    const twice = structuredClone(once);
    expect(applyComfortLimits(twice)).toEqual([]);
    expect(twice).toEqual(once);
  });

  it('ignores non-object input', () => {
    expect(applyComfortLimits(null)).toEqual([]);
    expect(applyComfortLimits('x')).toEqual([]);
  });
});
