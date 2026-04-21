/**
 * @fileoverview Centralized error handling with user-friendly messages
 */

import { UIManager } from './uiManager.js';
import { Telemetry } from './telemetry.js';

/**
 * Error types for categorization
 */
export const ErrorType = {
  LIBRARY_LOAD: 'LIBRARY_LOAD',
  CONFIG_INVALID: 'CONFIG_INVALID',
  PARTICLES_LOAD: 'PARTICLES_LOAD',
  SHARE_FAILED: 'SHARE_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ErrorType.LIBRARY_LOAD]: {
    title: 'Failed to Load Particle Engine',
    message:
      'Unable to initialize tsParticles. Please check your internet connection and refresh the page.',
    recoverable: false,
  },
  [ErrorType.CONFIG_INVALID]: {
    title: 'Invalid Configuration',
    message: 'The particle configuration is invalid. Restoring previous state.',
    recoverable: true,
  },
  [ErrorType.PARTICLES_LOAD]: {
    title: 'Failed to Load Particles',
    message: 'Unable to load particle configuration. Please try again.',
    recoverable: true,
  },
  [ErrorType.SHARE_FAILED]: {
    title: 'Share Link Failed',
    message: 'Unable to create share link. Copying current URL instead.',
    recoverable: true,
  },
  [ErrorType.STORAGE_ERROR]: {
    title: 'Storage Error',
    message: 'Unable to save settings. Your preferences may not persist.',
    recoverable: true,
  },
  [ErrorType.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Network request failed. Please check your connection.',
    recoverable: true,
  },
  [ErrorType.UNKNOWN]: {
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again.',
    recoverable: true,
  },
};

/**
 * Centralized error handler for the application
 */
export const ErrorHandler = {
  /**
   * Handle an error with appropriate user feedback
   * @param {Error} error - The error object
   * @param {string} type - Error type from ErrorType enum
   * @param {Object} context - Additional context for logging
   * @returns {boolean} - Whether the error is recoverable
   */
  handle(error, type = ErrorType.UNKNOWN, context = {}) {
    // Log to console for debugging
    console.error(`[${type}]`, error, context);
    Telemetry.logError(type, error, context);

    // Get user-friendly message
    const errorInfo = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN];

    // Show user feedback
    UIManager.showToast(`❌ ${errorInfo.message}`);
    UIManager.announce(`Error: ${errorInfo.message}`);

    // In production, you could also send to an error tracking service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { errorType: type },
    //     extra: context,
    //   });
    // }

    return errorInfo.recoverable;
  },

  /**
   * Create a fatal error UI (for non-recoverable errors)
   * @param {string} type - Error type
   * @param {Error} error - The error object
   */
  createFatalErrorUI(type, error) {
    const errorInfo = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN];

    const isDev =
      (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
      (typeof process !== 'undefined' &&
        process.env?.NODE_ENV === 'development');

    // Replace body contents by building DOM nodes — avoids innerHTML with
    // stack traces or error messages that could contain markup.
    const outer = document.createElement('div');
    outer.style.cssText =
      'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;text-align:center;padding:20px;';

    const inner = document.createElement('div');

    const h1 = document.createElement('h1');
    h1.style.cssText = 'color:#ff6b6b;margin-bottom:16px;';
    h1.textContent = `⚠️ ${errorInfo.title}`;

    const p = document.createElement('p');
    p.style.cssText = 'color:#666;margin-bottom:20px;';
    p.textContent = errorInfo.message;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Reload Page';
    btn.style.cssText =
      'padding:12px 24px;background:#4ecdc4;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;';
    btn.addEventListener('click', () => window.location.reload());

    inner.append(h1, p, btn);

    if (isDev && error && error.stack) {
      const details = document.createElement('details');
      details.style.cssText =
        'margin-top:20px;text-align:left;max-width:600px;margin-left:auto;margin-right:auto;';
      const summary = document.createElement('summary');
      summary.style.cssText = 'cursor:pointer;color:#999;';
      summary.textContent = 'Developer Info';
      const pre = document.createElement('pre');
      pre.style.cssText =
        'background:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto;font-size:12px;';
      pre.textContent = error.stack;
      details.append(summary, pre);
      inner.append(details);
    }

    outer.append(inner);
    document.body.replaceChildren(outer);
  },

  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} errorType - Error type for this operation
   * @returns {Function} - Wrapped function
   */
  wrap(fn, errorType = ErrorType.UNKNOWN) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        const isRecoverable = this.handle(error, errorType, {
          function: fn.name,
          args: args.length,
        });

        if (!isRecoverable) {
          throw error; // Re-throw non-recoverable errors
        }

        return null;
      }
    };
  },

  /**
   * Validate a particle configuration
   * @param {Object} config - Configuration to validate
   * @returns {boolean} - Whether config is valid
   */
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const requiredProps = ['particles', 'interactivity'];
    return requiredProps.every((prop) =>
      Object.prototype.hasOwnProperty.call(config, prop)
    );
  },
};
