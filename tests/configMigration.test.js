import { describe, it, expect } from 'vitest';
import { migrateV3Config } from '../js/configMigration.js';

const v3Scene = () => ({
  particles: {
    color: { value: '#ff007b' },
    stroke: { width: 2, color: { value: 'random' } },
    shape: { type: 'circle' },
    move: { enable: true, speed: 3 },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      resize: { enable: true, delay: 0.5 },
    },
  },
});

describe('migrateV3Config', () => {
  it('moves particles.color to paint.fill and stroke to paint.stroke', () => {
    const config = migrateV3Config(v3Scene());

    expect(config.particles.paint).toEqual({
      fill: { enable: true, color: { value: '#ff007b' } },
      stroke: { width: 2, color: { value: 'random' } },
    });
    expect(config.particles).not.toHaveProperty('color');
    expect(config.particles).not.toHaveProperty('stroke');
    expect(config.particles.shape).toEqual({ type: 'circle' });
  });

  it('keeps palettes and colour animations intact', () => {
    const config = v3Scene();
    config.particles.color = {
      value: ['#111111', '#222222'],
      animation: { enable: true, speed: 20 },
    };

    migrateV3Config(config);

    expect(config.particles.paint.fill.color).toEqual({
      value: ['#111111', '#222222'],
      animation: { enable: true, speed: 20 },
    });
  });

  it('moves interactivity.events.resize to the top-level resize', () => {
    const config = migrateV3Config(v3Scene());

    expect(config.resize).toEqual({ enable: true, delay: 0.5 });
    expect(config.interactivity.events).not.toHaveProperty('resize');
    expect(config.interactivity.events.onHover.mode).toBe('grab');
  });

  it('converts a legacy boolean resize flag', () => {
    const config = v3Scene();
    config.interactivity.events.resize = false;

    migrateV3Config(config);

    expect(config.resize).toEqual({ enable: false });
  });

  it('leaves a v4 config unchanged', () => {
    const v4 = {
      particles: {
        paint: { fill: { enable: true, color: { value: '#00f5d4' } } },
      },
      interactivity: { events: {} },
      resize: { enable: true },
    };
    const snapshot = structuredClone(v4);

    expect(migrateV3Config(v4)).toEqual(snapshot);
  });

  it('is idempotent', () => {
    const once = migrateV3Config(v3Scene());
    const twice = migrateV3Config(structuredClone(once));
    expect(twice).toEqual(once);
  });

  it('defaults a stroke without width to no stroke', () => {
    const config = { particles: { stroke: { color: { value: '#fff' } } } };
    migrateV3Config(config);
    expect(config.particles.paint.stroke).toEqual({
      width: 0,
      color: { value: '#fff' },
    });
  });

  it('ignores non-object input', () => {
    expect(migrateV3Config(null)).toBe(null);
    expect(migrateV3Config('x')).toBe('x');
  });
});
