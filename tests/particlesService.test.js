import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm', () => ({
  tsParticles: { load: vi.fn() },
}));

vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    showLoadingIndicator: vi.fn(),
    hideLoadingIndicator: vi.fn(),
    showToast: vi.fn(),
    announce: vi.fn(),
    syncUI: vi.fn(),
  },
}));

vi.mock('../js/telemetry.js', () => ({
  Telemetry: {
    log: vi.fn(),
    logError: vi.fn(),
  },
}));

vi.mock('../js/storage.js', () => ({
  SafeStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import {
  applyAdvancedPreferences,
  reapplyToggleStates,
  buildConfig,
  applyCursorMode,
  applyWallsMode,
  applyGravityMode,
  updateThemeAndReload,
  loadParticles,
} from '../js/particlesService.js';
import { AppState } from '../js/state.js';
import { PARTICLE_CONFIG } from '../js/constants/particles.js';
import { THEME_BACKGROUNDS } from '../js/constants/colors.js';
import { ConfigGenerator } from '../js/configGenerator.js';
import { tsParticles } from 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm';
import { UIManager } from '../js/uiManager.js';
import { Telemetry } from '../js/telemetry.js';
import { Diagnostics } from '../js/diagnostics.js';
import { SafeStorage } from '../js/storage.js';

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
  vi.restoreAllMocks();
  vi.clearAllMocks();
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

  document.body.innerHTML = '<div id="tsparticles"></div>';
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

  it('clears stale originalOutModes when walls are off and out mode is not bounce', () => {
    const config = {
      particles: { move: { outModes: { default: 'out' } } },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };
    AppState.particleState.originalOutModes = { default: 'destroy' };
    AppState.ui.areWallsOn = false;

    reapplyToggleStates(config);

    expect(AppState.particleState.originalOutModes).toEqual({});
  });

  it('does not overwrite saved hover mode when already present', () => {
    const config = {
      particles: { move: {} },
      interactivity: {
        events: { onHover: { mode: 'grab' }, onClick: { enable: true } },
        modes: {},
      },
    };
    AppState.ui.isCursorParticle = true;
    AppState.particleState.originalInteractionModes.hover = 'repulse';

    reapplyToggleStates(config);

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

  it('merges movement shuffle into existing config', () => {
    AppState.particleState.currentConfig = {
      particles: {
        move: { speed: 1, direction: 'none', outModes: { default: 'out' } },
      },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };

    vi.spyOn(ConfigGenerator, 'generateMovement').mockReturnValue({
      speed: 7,
      random: false,
    });

    const config = buildConfig({ movement: true });

    expect(config.particles.move.speed).toBe(7);
    expect(config.particles.move.random).toBe(false);
    expect(config.particles.move.outModes).toEqual({ default: 'out' });
  });

  it('replaces interactivity when interaction shuffle is requested', () => {
    const replacement = {
      events: { onHover: { mode: 'grab' }, onClick: { mode: 'push' } },
      modes: { grab: { distance: 99 } },
    };
    AppState.particleState.currentConfig = {
      particles: { move: { outModes: { default: 'out' } } },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };

    vi.spyOn(ConfigGenerator, 'generateInteraction').mockReturnValue(
      replacement
    );

    const config = buildConfig({ interaction: true });

    expect(config.interactivity).toEqual(replacement);
  });

  it('applies FX shuffle and refreshes interactivity', () => {
    AppState.particleState.currentConfig = {
      particles: {
        move: { outModes: { default: 'out' } },
        links: { enable: true },
      },
      interactivity: { events: { onHover: {}, onClick: {} }, modes: {} },
    };

    vi.spyOn(ConfigGenerator, 'generateSpecialFX').mockReturnValue({
      links: { enable: false },
      rotate: { value: 2 },
    });
    vi.spyOn(ConfigGenerator, 'generateInteraction').mockReturnValue({
      events: { onHover: { mode: 'trail' }, onClick: { mode: 'push' } },
      modes: { trail: { quantity: 1 } },
    });

    const config = buildConfig({ fx: true });

    expect(config.particles.links.enable).toBe(false);
    expect(config.particles.rotate.value).toBe(2);
    expect(config.interactivity.events.onHover.mode).toBe('trail');
  });
});

describe('apply mode helpers', () => {
  it('applyCursorMode enables and then disables trail cursor mode', () => {
    AppState.particleState.currentConfig = {
      particles: { move: {} },
      interactivity: {
        events: { onHover: { mode: 'repulse' }, onClick: { enable: true } },
        modes: {},
      },
    };

    AppState.ui.isCursorParticle = true;
    applyCursorMode();
    expect(
      AppState.particleState.currentConfig.interactivity.events.onHover.mode
    ).toBe('trail');
    expect(
      AppState.particleState.currentConfig.interactivity.events.onClick.enable
    ).toBe(false);

    AppState.ui.isCursorParticle = false;
    applyCursorMode();
    expect(
      AppState.particleState.currentConfig.interactivity.events.onHover.mode
    ).toBe('repulse');
    expect(
      AppState.particleState.currentConfig.interactivity.events.onClick.enable
    ).toBe(true);
  });

  it('applyWallsMode handles missing particles and restore behavior', () => {
    AppState.particleState.currentConfig = {};
    expect(() => applyWallsMode()).not.toThrow();

    AppState.particleState.currentConfig = {
      particles: { move: { outModes: { default: 'out' } } },
    };
    AppState.ui.areWallsOn = true;
    applyWallsMode();
    expect(
      AppState.particleState.currentConfig.particles.move.outModes
    ).toEqual({ default: 'bounce' });

    AppState.ui.areWallsOn = false;
    applyWallsMode();
    expect(
      AppState.particleState.currentConfig.particles.move.outModes
    ).toEqual({ default: 'out' });
  });

  it('applyGravityMode syncs gravity state and acceleration', () => {
    AppState.particleState.currentConfig = {
      particles: { move: {} },
    };

    AppState.ui.isGravityOn = true;
    applyGravityMode();
    expect(
      AppState.particleState.currentConfig.particles.move.gravity.enable
    ).toBe(true);
    expect(
      AppState.particleState.currentConfig.particles.move.gravity.acceleration
    ).toBe(PARTICLE_CONFIG.GRAVITY_ACCELERATION);

    AppState.ui.isGravityOn = false;
    applyGravityMode();
    expect(
      AppState.particleState.currentConfig.particles.move.gravity.acceleration
    ).toBe(0);
  });
});

describe('load and theme reload flows', () => {
  it('loadParticles stores config, applies advanced prefs, and logs success', async () => {
    const markLoadStartSpy = vi
      .spyOn(Diagnostics, 'markLoadStart')
      .mockImplementation(() => {});
    const markLoadResolvedSpy = vi
      .spyOn(Diagnostics, 'markLoadResolved')
      .mockImplementation(() => {});
    const scheduleProbeSpy = vi
      .spyOn(Diagnostics, 'scheduleProbe')
      .mockImplementation(() => {});

    const loadedContainer = { retina: {} };
    tsParticles.load.mockResolvedValue(loadedContainer);

    AppState.ui.particlesContainer = {};
    AppState.advanced.autoPauseHidden = true;
    AppState.advanced.batterySaverMode = true;

    const config = {
      particles: {
        number: { value: 400 },
        move: { speed: 10, outModes: { default: 'out' } },
        links: { opacity: 0.9, enable: true, color: { value: '#ffffff' } },
      },
      interactivity: {
        events: {
          onHover: { mode: 'repulse', enable: true },
          onClick: { enable: true },
        },
        modes: {},
      },
      background: { color: { value: THEME_BACKGROUNDS.DARK } },
      fpsLimit: 120,
    };

    await loadParticles(config);

    expect(SafeStorage.setItem).toHaveBeenCalledWith(
      'tsDiceLastConfig',
      JSON.stringify(config)
    );
    expect(tsParticles.load).toHaveBeenCalledTimes(1);
    const firstCall = tsParticles.load.mock.calls[0][0];
    expect(firstCall.id).toBe('tsparticles');
    expect(firstCall.options.pauseOnBlur).toBe(true);
    expect(firstCall.options.particles.number.value).toBeLessThanOrEqual(
      PARTICLE_CONFIG.BATTERY_SAVER_PARTICLE_CAP
    );
    expect(loadedContainer.retina.reduceFactor).toBe(1);
    expect(UIManager.hideLoadingIndicator).toHaveBeenCalled();
    expect(UIManager.syncUI).toHaveBeenCalled();
    expect(markLoadStartSpy).toHaveBeenCalled();
    expect(markLoadResolvedSpy).toHaveBeenCalled();
    expect(scheduleProbeSpy).toHaveBeenCalledWith(config);
    expect(Telemetry.log).toHaveBeenCalledWith(
      'particles:load:success',
      expect.objectContaining({ batterySaver: true })
    );
  });

  it('loadParticles restores previous config if new load fails', async () => {
    vi.spyOn(Diagnostics, 'markLoadStart').mockImplementation(() => {});
    vi.spyOn(Diagnostics, 'markLoadResolved').mockImplementation(() => {});
    vi.spyOn(Diagnostics, 'scheduleProbe').mockImplementation(() => {});

    const previous = {
      particles: {
        number: { value: 12 },
        move: { outModes: { default: 'out' } },
      },
      interactivity: {
        events: { onHover: { mode: 'repulse' }, onClick: { enable: true } },
        modes: {},
      },
      background: { color: { value: THEME_BACKGROUNDS.DARK } },
    };
    const incoming = {
      particles: {
        number: { value: 20 },
        move: { outModes: { default: 'out' } },
      },
      interactivity: {
        events: { onHover: { mode: 'trail' }, onClick: { enable: false } },
        modes: {},
      },
      background: { color: { value: THEME_BACKGROUNDS.DARK } },
    };

    AppState.particleState.currentConfig = previous;
    tsParticles.load
      .mockRejectedValueOnce(new Error('load failed'))
      .mockResolvedValueOnce({ retina: {} });

    await loadParticles(incoming);

    expect(tsParticles.load).toHaveBeenCalledTimes(2);
    expect(tsParticles.load.mock.calls[1][0].options).toEqual(previous);
    expect(AppState.particleState.currentConfig).toEqual(previous);
    expect(UIManager.showToast).toHaveBeenCalledWith(
      'Config error - restored previous state'
    );
    expect(Telemetry.log).toHaveBeenCalledWith('particles:load:recovered');
  });

  it('updateThemeAndReload syncs UI when there is no config', async () => {
    AppState.particleState.currentConfig = {};

    await updateThemeAndReload();

    expect(UIManager.syncUI).toHaveBeenCalledTimes(1);
    expect(tsParticles.load).not.toHaveBeenCalled();
  });

  it('updateThemeAndReload updates theme-sensitive colors and reloads', async () => {
    vi.spyOn(Diagnostics, 'markLoadStart').mockImplementation(() => {});
    vi.spyOn(Diagnostics, 'markLoadResolved').mockImplementation(() => {});
    vi.spyOn(Diagnostics, 'scheduleProbe').mockImplementation(() => {});

    tsParticles.load.mockResolvedValue({ retina: {} });
    AppState.ui.isDarkMode = false;
    AppState.particleState.currentConfig = {
      background: { color: { value: THEME_BACKGROUNDS.DARK } },
      particles: {
        number: { value: 100 },
        color: { value: ['#fff', '#aaa'] },
        links: { enable: true, color: { value: '#ffffff' }, opacity: 0.4 },
        move: { outModes: { default: 'out' }, speed: 2 },
      },
      interactivity: {
        events: { onHover: { mode: 'repulse' }, onClick: { enable: true } },
        modes: {},
      },
      fpsLimit: 120,
    };

    await updateThemeAndReload();

    expect(AppState.particleState.currentConfig.background.color.value).toBe(
      THEME_BACKGROUNDS.LIGHT
    );
    expect(
      AppState.particleState.currentConfig.particles.links.color.value
    ).toBe('#333333');
    expect(tsParticles.load).toHaveBeenCalledTimes(1);
  });
});
