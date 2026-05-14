// js/turnstile.js
// Owns the Turnstile widget lifecycle: load → render → token → reset.

import { Telemetry } from './telemetry.js';

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY;

let widgetId = null;
let pendingToken = null;
let waiters = [];

function resolveWaiters(token) {
  pendingToken = token;
  const queued = waiters;
  waiters = [];
  queued.forEach((fn) => fn(token));
}

// Called by Turnstile when the script finishes loading.
window.onTurnstileLoad = () => {
  if (!SITEKEY) {
    Telemetry.log('turnstile:misconfigured');
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
};

/**
 * Resolve to a single-use Turnstile token, or null if Turnstile is unavailable.
 * After a successful share, call resetToken() so the next share gets a fresh one.
 */
export function getToken({ timeoutMs = 8000 } = {}) {
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
