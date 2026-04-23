import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm', () => ({
  tsParticles: { load: vi.fn() },
}));

import {
  applyAdvancedPreferences,
  reapplyToggleStates,
  buildConfig,
} from '../js/particlesService.js';
import { AppState } from '../js/state.js';
import { PARTICLE_CONFIG } from '../js/constants/particles.js';

function baseConfig() {
  return {
    particles: {
      number: { value: 100 },
      move: {
        speed: 10,
        outModes: { default: 'out' },
      },
      links: { opacity: 0.8 },
    },
  };
}

beforeEach(() => {
  AppState.ui.isDarkMode = true;
  AppState.ui.isCursorParticle = false;
  AppState.ui.isGravityOn = false;
  AppState.ui.areWallsOn = false;
  AppState.particleState.chaosLevel = 5;
  AppState.particleState.currentConfig = {};
  AppState.particleState.originalInteractionModes = {};
  AppState.particleState.originalOutModes = {};
  AppState.advanced.autoPauseHidden = false;
  AppState.advanced.batterySaverMode = false;
});

describe('applyAdvancedPreferences', () => {
  it('returns early without throwing on null options', () => {
    expect(() => applyAdvancedPreferences(null)).not.toThrow();
  });

  it('sets pauseOnBlur/outsideViewport when autoPauseHidden is on', () => {
    const opts = baseConfig();
    AppState.advanced.autoPauseHidden = true;
    applyAdvancedPreferences(opts);
    expect(opts.pauseOnBlur).toBe(true);
    expect(opts.pauseOnOutsideViewport).toBe(true);
  });

  it('clears pauseOnBlur/outsideViewport when autoPauseHidden is off', () => {
    const opts = baseConfig();
    AppState.advanced.autoPauseHidden = false;
    applyAdvancedPreferences(opts);
    expect(opts.pauseOnBlur).toBe(false);
    expect(opts.pauseOnOutsideViewport).toBe(false);
  });

  it('applies default FPS limit when missing', () => {
    const opts = baseConfig();
    applyAdvancedPreferences(opts);
    expect(opts.fpsLimit).toBe(PARTICLE_CONFIG.FPS_LIMIT);
  });

  it('battery saver caps fps, particle count, speed, and disables trail', () => {
    const opts = baseConfig();
    opts.particles.number.value = 999;
    AppState.advanced.batterySaverMode = true;
    applyAdvancedPreferences(opts);

    expect(opts.fpsLimit).toBeLessThanOrEqual(
      PARTICLE_CONFIG.BATTERY_SAVER_FPS_LIMIT
    );
    expect(opts.particles.number.value).toBeLessThanOrEqual(
      PARTICLE_CONFIG.BATTERY_SAVER_PARTICLE_CAP
    );
    expect(opts.particles.move.speed).toBeLessThanOrEqual(
      PARTICLE_CONFIG.BATTERY_SAVER_MAX_SPEED
    );
    expect(opts.particles.links.opacity).toBeLessThanOrEqual(0.4);
  });

  it('battery saver uses max speed cap when move.speed is not numeric', () => {
    const opts = baseConfig();
    delete opts.particles.move.speed;
    AppState.advanced.batterySaverMode = true;
    applyAdvancedPreferences(opts);
    expect(opts.particles.move.speed).toBe(
      PARTICLE_CONFIG.BATTERY_SAVER_MAX_SPEED
    );
  });
});

describe('reapplyToggleStates', () => {
  it('enables gravity acceleration when gravity toggle is on', () => {
    const config = {
      particles: { move: {} },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };
    AppState.ui.isGravityOn = true;
    reapplyToggleStates(config);
    expect(config.particles.move.gravity.enable).toBe(true);
    expect(config.particles.move.gravity.acceleration).toBe(
      PARTICLE_CONFIG.GRAVITY_ACCELERATION
    );
  });

  it('zeros gravity acceleration when gravity toggle is off', () => {
    const config = {
      particles: { move: { gravity: { enable: true, acceleration: 9 } } },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };
    AppState.ui.isGravityOn = false;
    reapplyToggleStates(config);
    expect(config.particles.move.gravity.enable).toBe(false);
    expect(config.particles.move.gravity.acceleration).toBe(0);
  });

  it('applies walls by saving originalOutModes and switching to bounce', () => {
    const config = {
      particles: { move: { outModes: { default: 'out' } } },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };
    AppState.ui.areWallsOn = true;
    reapplyToggleStates(config);
    expect(config.particles.move.outModes).toEqual({ default: 'bounce' });
    expect(AppState.particleState.originalOutModes).toEqual({
      default: 'out',
    });
  });

  it('cursor particle mode installs trail handler and disables click', () => {
    const config = {
      particles: { move: {} },
      interactivity: {
        events: { onHover: { mode: 'repulse' }, onClick: { enable: true } },
        modes: {},
      },
    };
    AppState.ui.isCursorParticle = true;
    reapplyToggleStates(config);
    expect(config.interactivity.events.onHover.mode).toBe('trail');
    expect(config.interactivity.events.onClick.enable).toBe(false);
    expect(AppState.particleState.originalInteractionModes.hover).toBe(
      'repulse'
    );
  });
});

describe('buildConfig', () => {
  it('generates a full config when none exists', () => {
    AppState.particleState.currentConfig = {};
    const config = buildConfig({ all: true });
    expect(config.particles).toBeDefined();
    expect(config.interactivity).toBeDefined();
    expect(config.background.color.value).toBeTruthy();
    expect(config.fpsLimit).toBe(PARTICLE_CONFIG.FPS_LIMIT);
    expect(config.detectRetina).toBe(true);
  });

  it('scales particle count with chaos level', () => {
    AppState.particleState.chaosLevel = 3;
    const a = buildConfig({ all: true });
    AppState.particleState.currentConfig = {};
    AppState.particleState.chaosLevel = 10;
    const b = buildConfig({ all: true });
    expect(b.particles.number.value).toBeGreaterThan(a.particles.number.value);
  });

  it('picks theme-appropriate background color', () => {
    AppState.ui.isDarkMode = true;
    AppState.particleState.currentConfig = {};
    const dark = buildConfig({ all: true });
    AppState.ui.isDarkMode = false;
    AppState.particleState.currentConfig = {};
    const light = buildConfig({ all: true });
    expect(dark.background.color.value).not.toBe(light.background.color.value);
  });

  it('forces walls via reapplyToggleStates', () => {
    AppState.ui.areWallsOn = true;
    const config = buildConfig({ all: true });
    expect(config.particles.move.outModes).toEqual({ default: 'bounce' });
  });
});
