import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { Telemetry } from './telemetry.js';
import { THEME_BACKGROUNDS } from './constants/colors.js';

const PROBE_DELAY_MS = 500;
// Denser grid so small/sparse particle scenes are actually hit. At 25 samples
// a healthy render often returned uniqueColorCount: 1 by chance, making that
// signal unusable. At 100 samples a scene with ≥60 particles almost always
// produces 2+ unique colours unless truly blank.
const PIXEL_SAMPLE_COUNT = 100;
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

// Sample at known particle positions. tsParticles paints on a transparent
// canvas with small particles — a blind grid missed them by chance on healthy
// renders, making uniqueColorCount=1 indistinguishable from a true blank
// screen. Sampling where particles claim to be gives a deterministic signal:
// if any of these points is non-transparent, rendering is alive.
const particleSamplePoints = (container, w, h) => {
  const arr = getParticlesArray(container);
  if (!arr.length) return [];
  const pixelRatio = container?.retina?.pixelRatio || 1;
  const points = [];
  const step = Math.max(1, Math.floor(arr.length / 40)); // up to ~40 probes
  for (let idx = 0; idx < arr.length; idx += step) {
    const p = arr[idx];
    const pos = p?.position || p?.getPosition?.();
    if (!pos) continue;
    const x = Math.round(pos.x * pixelRatio);
    const y = Math.round(pos.y * pixelRatio);
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    // Search radius must cover the particle's drawn extent (size) plus any
    // per-frame displacement (velocity magnitude), because position updates
    // each frame and our read may straddle a frame boundary. A tiny fast
    // particle at a claimed (x,y) can have actually been painted several
    // pixels away. Add a small constant for AA/stroke bleed.
    const size = p?.size?.value ?? p?.getRadius?.() ?? 2;
    const vx = p?.velocity?.x ?? 0;
    const vy = p?.velocity?.y ?? 0;
    const speed = Math.hypot(vx, vy);
    const radius = Math.max(3, Math.ceil((size + speed) * pixelRatio) + 2);
    points.push({ x, y, radius, particleIndex: idx });
  }
  return points;
};

const getCanvasInfo = () => {
  // Always prefer the live DOM canvas. AppState.ui.particlesContainer can
  // lag behind tsParticles.load() — after a shuffle destroys+recreates the
  // container, the old container's canvas.element is a detached DOM node
  // that reads back blank. Querying the DOM gives us whatever is actually
  // mounted at #tsparticles right now.
  const container = AppState.ui.particlesContainer;
  const liveEl = document.querySelector('#tsparticles canvas');
  const containerEl = container?.canvas?.element;
  const canvasEl =
    liveEl || (containerEl && containerEl.isConnected ? containerEl : null);

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

const samplePixels = (canvasEl, container) => {
  try {
    const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { ok: false, reason: 'no-2d-context' };

    const w = canvasEl.width;
    const h = canvasEl.height;
    if (!w || !h) return { ok: false, reason: 'zero-sized-canvas', w, h };

    const imageData = ctx.getImageData(0, 0, w, h);
    const buf = imageData.data;

    const readAt = (x, y) => {
      const i = (y * w + x) * 4;
      return { x, y, r: buf[i], g: buf[i + 1], b: buf[i + 2], a: buf[i + 3] };
    };

    const gridSamples = samplePoints(w, h).map((p) => readAt(p.x, p.y));

    // Sample a small neighborhood around each particle's claimed position.
    // If the particle is actually rendered, at least one nearby pixel should
    // be non-transparent. This removes the luck factor of a blind grid
    // missing all particles on sparse/small-particle renders.
    const particlePoints = particleSamplePoints(container, w, h);
    const particleSamples = particlePoints.map((p) => {
      const { radius } = p;
      const x0 = Math.max(0, p.x - radius);
      const x1 = Math.min(w - 1, p.x + radius);
      const y0 = Math.max(0, p.y - radius);
      const y1 = Math.min(h - 1, p.y + radius);
      let hit = readAt(p.x, p.y);
      // Scan outward in a box; break on first non-transparent pixel. Bounded
      // by radius so big particles don't scan the whole canvas.
      scan: for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = (y * w + x) * 4;
          if (buf[i + 3] !== 0) {
            hit = {
              x,
              y,
              r: buf[i],
              g: buf[i + 1],
              b: buf[i + 2],
              a: buf[i + 3],
            };
            break scan;
          }
        }
      }
      return { ...hit, particleIndex: p.particleIndex, searchRadius: radius };
    });

    return {
      ok: true,
      samples: gridSamples,
      particleSamples,
      probedParticles: particlePoints.length,
    };
  } catch (err) {
    return { ok: false, reason: 'getImageData-failed', error: String(err) };
  }
};

const analyzeSamples = (pixelResult, bgHex) => {
  const samples = pixelResult.samples || [];
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

  const pSamples = pixelResult.particleSamples || [];
  let particleHits = 0;
  for (const s of pSamples) {
    if (s.a !== 0) particleHits++;
  }

  const n = samples.length;
  return {
    sampleCount: n,
    bgMatchRatio: n ? bgMatches / n : 0,
    pureBlackRatio: n ? pureBlack / n : 0,
    transparentRatio: n ? transparent / n : 0,
    uniqueColorCount: uniqueColors.size,
    probedParticles: pSamples.length,
    particleHits,
    particleHitRatio: pSamples.length ? particleHits / pSamples.length : null,
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
  const analysis = pixelResult.ok ? analyzeSamples(pixelResult, bgHex) : null;
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

  // Authoritative signal: sample at each particle's claimed position. If
  // particles exist but none of their positions paint a pixel, rendering is
  // genuinely dead. A blind grid missed small particles by chance and
  // produced constant false positives on healthy renders.
  const particleCount = container?.count ?? container?.countGetter ?? 0;
  if (
    particleCount > 0 &&
    analysis.probedParticles > 0 &&
    analysis.particleHits === 0
  ) {
    return true;
  }

  // Legacy paths for when tsParticles paints a solid background colour.
  if (analysis.bgMatchRatio >= 0.98) return true;
  if (analysis.pureBlackRatio >= 0.98 && analysis.uniqueColorCount <= 1) {
    return true;
  }
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
        const container = AppState.ui.particlesContainer;
        const pixelResult = canvasInfo.ok
          ? samplePixels(canvasInfo.canvasEl, container)
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
            probedParticles: capture.analysis?.probedParticles,
            particleHits: capture.analysis?.particleHits,
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
          // No user-facing toast: ~1% of real detections are genuine and the
          // false positives disrupt the fun. Captures still land in console
          // and telemetry for debugging via tsDiceDiagnostics.
        } else {
          Telemetry.log('blackScreen:probeOk', {
            particleCount: capture.container?.count,
            countGetter: capture.container?.countGetter,
            bgMatchRatio: capture.analysis?.bgMatchRatio,
            uniqueColorCount: capture.analysis?.uniqueColorCount,
            probedParticles: capture.analysis?.probedParticles,
            particleHits: capture.analysis?.particleHits,
          });
        }
      } catch (err) {
        console.error('[BlackScreenProbe] Probe failed:', err);
        Telemetry.logError('blackScreen:probe', err);
      }
    };

    // Run in the task queue, NOT inside an RAF callback. Reading from inside
    // an RAF races with tsParticles' own RAF — if ours runs first in the
    // frame, we read the backing store right after clearRect and before
    // draw, producing a fully-transparent snapshot on a healthy scene.
    // Between frames, the backing store holds the last fully-drawn state.
    setTimeout(run, PROBE_DELAY_MS);
  },
};

if (typeof window !== 'undefined') {
  window.tsDiceDiagnostics = Diagnostics;
}
