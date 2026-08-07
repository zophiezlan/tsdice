import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    showToast: vi.fn(),
  },
}));

vi.mock('../js/telemetry.js', () => ({
  Telemetry: {
    log: vi.fn(),
    logError: vi.fn(),
  },
}));

let Diagnostics;
let AppState;
let Telemetry;
let UIManager;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  vi.clearAllMocks();

  document.body.innerHTML = '<div id="tsparticles"></div>';

  localStorage.getItem.mockReset();
  localStorage.setItem.mockReset();
  localStorage.getItem.mockReturnValue('on');

  ({ AppState } = await import('../js/state.js'));
  ({ Diagnostics } = await import('../js/diagnostics.js'));
  ({ Telemetry } = await import('../js/telemetry.js'));
  ({ UIManager } = await import('../js/uiManager.js'));

  AppState.advanced.disableDiagnostics = false;
  AppState.ui.isDarkMode = true;
  AppState.particleState.chaosLevel = 5;
  AppState.ui.particlesContainer = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Diagnostics enablement and persistence', () => {
  it('isEnabled returns false when localStorage flag is off', () => {
    localStorage.getItem.mockReturnValue('off');

    expect(Diagnostics.isEnabled()).toBe(false);
  });

  it('isEnabled returns false when disableDiagnostics is set in state', () => {
    AppState.advanced.disableDiagnostics = true;

    expect(Diagnostics.isEnabled()).toBe(false);
  });

  it('enable and disable write expected localStorage values', () => {
    Diagnostics.enable();
    Diagnostics.disable();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tsDiceBlackScreenProbe',
      'on'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tsDiceBlackScreenProbe',
      'off'
    );
  });
});

describe('Diagnostics load watchdog', () => {
  it('does not start watchdog when diagnostics are disabled', () => {
    localStorage.getItem.mockReturnValue('off');

    Diagnostics.markLoadStart({ particles: {} });
    vi.advanceTimersByTime(5000);

    expect(Diagnostics.getHangCaptures()).toHaveLength(0);
    expect(Telemetry.log).not.toHaveBeenCalled();
  });

  it('captures load hangs and records telemetry after timeout', () => {
    Diagnostics.markLoadStart({
      particles: { shape: { type: 'circle' } },
      interactivity: {
        events: {
          onHover: { mode: 'repulse' },
          onClick: { mode: 'push' },
        },
      },
    });

    vi.advanceTimersByTime(3999);
    expect(Diagnostics.getHangCaptures()).toHaveLength(0);

    vi.advanceTimersByTime(1);
    const hangs = Diagnostics.getHangCaptures();
    expect(hangs).toHaveLength(1);
    expect(hangs[0].shapeType).toBe('circle');

    expect(Telemetry.log).toHaveBeenCalledWith(
      'blackScreen:loadHang',
      expect.objectContaining({
        shapeType: 'circle',
        hoverMode: 'repulse',
        clickMode: 'push',
      })
    );
    expect(UIManager.showToast).toHaveBeenCalledWith(
      'Load hang captured — see console'
    );
  });

  it('markLoadResolved clears pending watchdog before timeout', () => {
    Diagnostics.markLoadStart({ particles: {} });
    Diagnostics.markLoadResolved();

    vi.advanceTimersByTime(5000);

    expect(Diagnostics.getHangCaptures()).toHaveLength(0);
    expect(Telemetry.log).not.toHaveBeenCalledWith('blackScreen:loadHang');
  });
});

describe('Diagnostics probe scheduling', () => {
  it('scheduleProbe exits early when disabled', () => {
    localStorage.getItem.mockReturnValue('off');

    Diagnostics.scheduleProbe({ particles: {} });
    vi.advanceTimersByTime(600);

    expect(Telemetry.log).not.toHaveBeenCalled();
    expect(Diagnostics.getCaptures()).toHaveLength(0);
  });

  it('scheduleProbe captures black-screen when no canvas/container is present', () => {
    Diagnostics.scheduleProbe({
      particles: { shape: { type: 'square' } },
      background: { color: { value: '#111' } },
    });

    vi.advanceTimersByTime(600);

    const captures = Diagnostics.getCaptures();
    expect(captures).toHaveLength(1);
    expect(Diagnostics.getLastCapture()).toBeTruthy();
    expect(Telemetry.log).toHaveBeenCalledWith(
      'blackScreen:detected',
      expect.objectContaining({ shapeType: 'square' })
    );
  });

  it('scheduleProbe logs probe failures via telemetry', () => {
    const querySpy = vi
      .spyOn(document, 'querySelector')
      .mockImplementation(() => {
        throw new Error('query failed');
      });

    Diagnostics.scheduleProbe({ particles: {} });
    vi.advanceTimersByTime(600);

    expect(Telemetry.logError).toHaveBeenCalledWith(
      'blackScreen:probe',
      expect.any(Error)
    );

    querySpy.mockRestore();
  });
});

describe('Diagnostics download helpers', () => {
  it('downloadLast warns when no capture exists', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Diagnostics.downloadLast();

    expect(warnSpy).toHaveBeenCalledWith('No capture available yet');
    warnSpy.mockRestore();
  });

  it('downloadHangs warns when there are no hang captures', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Diagnostics.downloadHangs();

    expect(warnSpy).toHaveBeenCalledWith('No hang captures recorded');
    warnSpy.mockRestore();
  });
});
