import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { Telemetry } from './telemetry.js';
import { THEME_BACKGROUNDS } from './constants/colors.js';

const PROBE_DELAY_MS = 500;
const PIXEL_SAMPLE_COUNT = 25;
const BG_MATCH_TOLERANCE = 8;
const MAX_CAPTURES = 20;
const HANG_TIMEOUT_MS = 4000;

const captures = [];
const hangCaptures = [];
let lastCapture = null;
let pendingLoad = null;

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const samplePoints = (w, h) => {
  const points = [];
  const grid = Math.ceil(Math.sqrt(PIXEL_SAMPLE_COUNT));
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const x = Math.floor(((i + 0.5) / grid) * w);
      const y = Math.floor(((j + 0.5) / grid) * h);
      points.push({ x, y });
    }
  }
  return points.slice(0, PIXEL_SAMPLE_COUNT);
};

const getCanvasInfo = () => {
  const container = AppState.ui.particlesContainer;
  const canvasEl =
    container?.canvas?.element || document.querySelector('#tsparticles canvas');

  if (!canvasEl) return { ok: false, reason: 'no-canvas-element' };

  const rect = canvasEl.getBoundingClientRect();
  const style = window.getComputedStyle(canvasEl);
  const wrapperEl = document.getElementById('tsparticles');
  const wrapperStyle = wrapperEl ? window.getComputedStyle(wrapperEl) : null;

  return {
    ok: true,
    canvasEl,
    width: canvasEl.width,
    height: canvasEl.height,
    rectWidth: rect.width,
    rectHeight: rect.height,
    computed: {
      opacity: style.opacity,
      display: style.display,
      visibility: style.visibility,
      zIndex: style.zIndex,
    },
    wrapperComputed: wrapperStyle
      ? {
          opacity: wrapperStyle.opacity,
          display: wrapperStyle.display,
          visibility: wrapperStyle.visibility,
          zIndex: wrapperStyle.zIndex,
          width: wrapperStyle.width,
          height: wrapperStyle.height,
        }
      : null,
  };
};

const samplePixels = (canvasEl) => {
  try {
    const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { ok: false, reason: 'no-2d-context' };

    const w = canvasEl.width;
    const h = canvasEl.height;
    if (!w || !h) return { ok: false, reason: 'zero-sized-canvas', w, h };

    const points = samplePoints(w, h);
    const samples = [];
    for (const p of points) {
      const data = ctx.getImageData(p.x, p.y, 1, 1).data;
      samples.push({
        x: p.x,
        y: p.y,
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3],
      });
    }
    return { ok: true, samples };
  } catch (err) {
    return { ok: false, reason: 'getImageData-failed', error: String(err) };
  }
};

const analyzeSamples = (samples, bgHex) => {
  const bg = hexToRgb(bgHex);
  let bgMatches = 0;
  let pureBlack = 0;
  let transparent = 0;
  const uniqueColors = new Set();

  for (const s of samples) {
    if (s.a === 0) transparent++;
    if (s.r === 0 && s.g === 0 && s.b === 0) pureBlack++;
    if (
      Math.abs(s.r - bg.r) <= BG_MATCH_TOLERANCE &&
      Math.abs(s.g - bg.g) <= BG_MATCH_TOLERANCE &&
      Math.abs(s.b - bg.b) <= BG_MATCH_TOLERANCE
    ) {
      bgMatches++;
    }
    uniqueColors.add(`${s.r},${s.g},${s.b}`);
  }

  const n = samples.length;
  return {
    sampleCount: n,
    bgMatchRatio: bgMatches / n,
    pureBlackRatio: pureBlack / n,
    transparentRatio: transparent / n,
    uniqueColorCount: uniqueColors.size,
  };
};

const getParticlesArray = (c) => {
  const pm = c?.particles;
  if (!pm) return [];
  if (Array.isArray(pm._array)) return pm._array;
  if (Array.isArray(pm.array)) return pm.array;
  if (typeof pm.filter === 'function') {
    try {
      return pm.filter(() => true);
    } catch {
      return [];
    }
  }
  return [];
};

const introspectContainer = () => {
  const c = AppState.ui.particlesContainer;
  if (!c) return { ok: false, reason: 'no-container' };

  const arr = getParticlesArray(c);
  const countGetter =
    typeof c.particles?.count === 'number' ? c.particles.count : null;
  const firstFive = arr.slice(0, 5).map((p) => {
    const pos = p.position || p.getPosition?.() || {};
    const vel = p.velocity || {};
    return {
      x: pos.x,
      y: pos.y,
      vx: vel.x,
      vy: vel.y,
      size: p.size?.value ?? p.getRadius?.(),
      opacity: p.opacity?.value,
      color: p.color?.value ?? p.getFillColor?.(),
      shape: p.shape,
    };
  });

  return {
    ok: true,
    count: arr.length,
    countGetter,
    firstFive,
    retinaReduceFactor: c.retina?.reduceFactor,
    retinaPixelRatio: c.retina?.pixelRatio,
    canvasSize: c.canvas?.size,
    paused: c.paused ?? c._paused,
    destroyed: c.destroyed,
    lastFrameTime: c.lastFrameTime,
  };
};

const buildCapture = (
  pixelResult,
  canvasInfo,
  containerInfo,
  bgHex,
  config
) => {
  const analysis = pixelResult.ok
    ? analyzeSamples(pixelResult.samples, bgHex)
    : null;
  return {
    timestamp: new Date().toISOString(),
    bgHex,
    isDarkMode: AppState.ui.isDarkMode,
    chaosLevel: AppState.particleState.chaosLevel,
    canvas: canvasInfo.ok
      ? {
          width: canvasInfo.width,
          height: canvasInfo.height,
          rectWidth: canvasInfo.rectWidth,
          rectHeight: canvasInfo.rectHeight,
          computed: canvasInfo.computed,
          wrapperComputed: canvasInfo.wrapperComputed,
        }
      : canvasInfo,
    pixels: pixelResult,
    analysis,
    container: containerInfo,
    config,
  };
};

const isBlackScreen = (capture) => {
  const { canvas, analysis, container } = capture;
  if (canvas && canvas.ok === false) return true;
  if (canvas && (canvas.width === 0 || canvas.height === 0)) return true;
  if (container?.ok === false) return true;
  if (container && container.count === 0 && container.countGetter === 0) {
    return true;
  }
  if (!analysis) return false;
  if (analysis.transparentRatio >= 0.95) return false;
  if (analysis.bgMatchRatio >= 0.98) return true;
  return false;
};

const downloadBlob = (capture) => {
  try {
    const json = JSON.stringify(capture, null, 2);
    const BlobCtor = window.Blob;
    const blob = new BlobCtor([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `black-screen-diagnostic-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Failed to download diagnostic blob:', err);
  }
};

export const Diagnostics = {
  isEnabled() {
    try {
      return (
        localStorage.getItem('tsDiceBlackScreenProbe') !== 'off' &&
        !AppState.advanced?.disableDiagnostics
      );
    } catch {
      return true;
    }
  },

  enable() {
    try {
      localStorage.setItem('tsDiceBlackScreenProbe', 'on');
    } catch {
      // localStorage unavailable; probe still runs (default enabled)
    }
  },

  disable() {
    try {
      localStorage.setItem('tsDiceBlackScreenProbe', 'off');
    } catch {
      // localStorage unavailable
    }
  },

  getCaptures() {
    return [...captures];
  },

  getLastCapture() {
    return lastCapture;
  },

  getHangCaptures() {
    return [...hangCaptures];
  },

  downloadLast() {
    if (lastCapture) downloadBlob(lastCapture);
    else console.warn('No capture available yet');
  },

  downloadHangs() {
    if (!hangCaptures.length) {
      console.warn('No hang captures recorded');
      return;
    }
    downloadBlob({
      kind: 'load-hangs',
      count: hangCaptures.length,
      captures: hangCaptures,
    });
  },

  /**
   * Capture the config about to be loaded and start a hang watchdog.
   * Call markLoadResolved() once the tsParticles.load() promise settles.
   */
  markLoadStart(config) {
    if (!this.isEnabled()) return;

    const record = {
      timestamp: new Date().toISOString(),
      startedAt:
        typeof performance !== 'undefined' ? performance.now() : Date.now(),
      isDarkMode: AppState.ui.isDarkMode,
      chaosLevel: AppState.particleState.chaosLevel,
      shapeType: config?.particles?.shape?.type,
      hoverMode: config?.interactivity?.events?.onHover?.mode,
      clickMode: config?.interactivity?.events?.onClick?.mode,
      config,
    };

    const watchdog = setTimeout(() => {
      record.hungAfterMs = HANG_TIMEOUT_MS;
      hangCaptures.push(record);
      if (hangCaptures.length > MAX_CAPTURES) hangCaptures.shift();

      const summary = {
        shapeType: record.shapeType,
        hoverMode: record.hoverMode,
        clickMode: record.clickMode,
        chaosLevel: record.chaosLevel,
      };
      console.group('[BlackScreenProbe] Load hang');
      console.warn(
        `tsParticles.load did not resolve within ${HANG_TIMEOUT_MS}ms`,
        summary
      );
      console.log('Hung config:', record);
      console.log(
        'Run tsDiceDiagnostics.downloadHangs() to save all hang captures.'
      );
      console.groupEnd();

      Telemetry.log('blackScreen:loadHang', summary);
      try {
        UIManager.showToast('Load hang captured — see console');
      } catch {
        // Toast host may not be ready
      }
    }, HANG_TIMEOUT_MS);

    pendingLoad = { record, watchdog };
  },

  markLoadResolved() {
    if (!pendingLoad) return;
    clearTimeout(pendingLoad.watchdog);
    pendingLoad = null;
  },

  /**
   * Run the probe after a particle load. Non-blocking: schedules the check
   * and returns immediately so it never interferes with the render loop.
   * Samples inside a requestAnimationFrame so tsParticles has finished
   * drawing the current frame.
   */
  scheduleProbe(config) {
    if (!this.isEnabled()) return;

    const bgHex =
      config?.background?.color?.value ||
      (AppState.ui.isDarkMode
        ? THEME_BACKGROUNDS.DARK
        : THEME_BACKGROUNDS.LIGHT);

    const run = () => {
      try {
        const canvasInfo = getCanvasInfo();
        const pixelResult = canvasInfo.ok
          ? samplePixels(canvasInfo.canvasEl)
          : { ok: false, reason: 'no-canvas' };
        const containerInfo = introspectContainer();
        const capture = buildCapture(
          pixelResult,
          canvasInfo,
          containerInfo,
          bgHex,
          config
        );

        lastCapture = capture;

        if (isBlackScreen(capture)) {
          captures.push(capture);
          if (captures.length > MAX_CAPTURES) captures.shift();

          const summary = {
            particleCount: capture.container?.count,
            countGetter: capture.container?.countGetter,
            bgMatchRatio: capture.analysis?.bgMatchRatio,
            uniqueColorCount: capture.analysis?.uniqueColorCount,
            transparentRatio: capture.analysis?.transparentRatio,
            retinaReduceFactor: capture.container?.retinaReduceFactor,
            canvasWidth: capture.canvas?.width,
            canvasHeight: capture.canvas?.height,
            shapeType: capture.config?.particles?.shape?.type,
          };

          console.group('[BlackScreenProbe] Capture');
          console.warn('Detected black screen', summary);
          console.log('Full capture:', capture);
          console.log(
            'Run tsDiceDiagnostics.downloadLast() to save a JSON blob.'
          );
          console.groupEnd();

          Telemetry.log('blackScreen:detected', summary);
          try {
            UIManager.showToast(
              'Black screen captured — see console (tsDiceDiagnostics)'
            );
          } catch {
            // Toast host may not be ready in some test envs
          }
        } else {
          Telemetry.log('blackScreen:probeOk', {
            particleCount: capture.container?.count,
            countGetter: capture.container?.countGetter,
            bgMatchRatio: capture.analysis?.bgMatchRatio,
            uniqueColorCount: capture.analysis?.uniqueColorCount,
          });
        }
      } catch (err) {
        console.error('[BlackScreenProbe] Probe failed:', err);
        Telemetry.logError('blackScreen:probe', err);
      }
    };

    setTimeout(() => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(run));
      } else {
        run();
      }
    }, PROBE_DELAY_MS);
  },
};

if (typeof window !== 'undefined') {
  window.tsDiceDiagnostics = Diagnostics;
}
