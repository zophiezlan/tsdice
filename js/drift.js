/**
 * @fileoverview Gentle drift: when switched on, the scene slowly evolves by
 * itself, one aspect at a time, through the normal cross-fade.
 *
 * Drift only moves while nobody is playing: any pointer, key or touch
 * activity restarts the wait, so it never changes a scene out from under
 * someone. Each change is a normal shuffle command, so the back arrow can
 * return to anything drift moved past.
 */

/** Time between drift steps once the person stops interacting */
export const DRIFT_INTERVAL_MS = 90_000;

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel'];

/**
 * @param {Object} deps
 * @param {() => boolean} deps.isEnabled - Whether the drift setting is on
 * @param {() => boolean} deps.canDrift - False while paused, hidden, a
 *   modal is open, etc.
 * @param {() => void} deps.step - Performs one drift step
 * @param {number} [deps.intervalMs]
 * @param {EventTarget} [deps.target] - Where to listen for activity
 * @returns {{ restart: () => void, stop: () => void }}
 */
export const createDrift = ({
  isEnabled,
  canDrift,
  step,
  intervalMs = DRIFT_INTERVAL_MS,
  target = window,
}) => {
  let timer = null;

  const schedule = () => {
    clearTimeout(timer);
    timer = null;
    if (!isEnabled()) return;
    timer = setTimeout(() => {
      if (isEnabled() && canDrift()) step();
      schedule();
    }, intervalMs);
  };

  const onActivity = () => {
    if (timer !== null) schedule();
  };
  ACTIVITY_EVENTS.forEach((type) =>
    target.addEventListener(type, onActivity, { passive: true })
  );

  schedule();

  return {
    /** Call when the setting changes */
    restart: schedule,
    stop() {
      clearTimeout(timer);
      timer = null;
      ACTIVITY_EVENTS.forEach((type) =>
        target.removeEventListener(type, onActivity)
      );
    },
  };
};
