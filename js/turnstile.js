// js/turnstile.js
// Owns the Turnstile widget lifecycle: load → render → token → reset.

import { Telemetry } from './telemetry.js';

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY;
const TURNSTILE_API_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
const DEFAULT_ALLOWED_HOSTS = ['ket.horse', 'www.ket.horse'];
const configuredHosts = import.meta.env.VITE_TURNSTILE_ALLOWED_HOSTS;
const ALLOWED_HOSTS = (
  configuredHosts ? configuredHosts.split(',') : DEFAULT_ALLOWED_HOSTS
)
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

let widgetId = null;
let pendingToken = null;
let waiters = [];
let initialized = false;
let scriptInjected = false;

function isAllowedHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

const isTurnstileEnabled = Boolean(SITEKEY) && isAllowedHost();

function resolveWaiters(token) {
  pendingToken = token;
  const queued = waiters;
  waiters = [];
  queued.forEach((fn) => fn(token));
}

function renderWidget() {
  if (!SITEKEY || !window.turnstile) {
    Telemetry.log('turnstile:misconfigured');
    resolveWaiters(null);
    return;
  }

  const container = document.getElementById('turnstile-widget');
  if (!container) {
    Telemetry.log('turnstile:missing_container');
    resolveWaiters(null);
    return;
  }

  widgetId = window.turnstile.render('#turnstile-widget', {
    sitekey: SITEKEY,
    size: 'invisible',
    callback: (token) => resolveWaiters(token),
    'error-callback': () => {
      Telemetry.log('turnstile:error');
      resolveWaiters(null);
    },
    'expired-callback': () => {
      pendingToken = null;
    },
  });
}

function injectScript() {
  if (scriptInjected || typeof document === 'undefined') return;
  scriptInjected = true;

  const script = document.createElement('script');
  script.src = TURNSTILE_API_SRC;
  script.defer = true;
  script.dataset.tsdiceTurnstile = 'true';
  script.onerror = () => {
    Telemetry.log('turnstile:script_error');
    resolveWaiters(null);
  };
  document.head.appendChild(script);
}

function initializeTurnstile() {
  if (!isTurnstileEnabled || initialized || typeof window === 'undefined') {
    return;
  }

  initialized = true;
  window.onTurnstileLoad = () => {
    renderWidget();
  };

  if (window.turnstile) {
    renderWidget();
    return;
  }

  injectScript();
}

initializeTurnstile();

/**
 * Resolve to a single-use Turnstile token, or null if Turnstile is unavailable.
 * After a successful share, call resetToken() so the next share gets a fresh one.
 */
export function getToken({ timeoutMs = 8000 } = {}) {
  if (!isTurnstileEnabled) return Promise.resolve(null);

  initializeTurnstile();

  if (pendingToken) return Promise.resolve(pendingToken);
  if (!window.turnstile || widgetId === null) {
    // Script hasn't loaded yet — wait for it.
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      waiters.push((token) => {
        clearTimeout(timer);
        resolve(token);
      });
    });
  }
  // Widget exists but no token yet — trigger an execute.
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    waiters.push((token) => {
      clearTimeout(timer);
      resolve(token);
    });
    try {
      window.turnstile.execute(widgetId);
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

/** Discard the current token (which is now spent) and prep the next one. */
export function resetToken() {
  pendingToken = null;
  if (widgetId !== null && window.turnstile) {
    try {
      window.turnstile.reset(widgetId);
    } catch {
      /* ignore */
    }
  }
}
