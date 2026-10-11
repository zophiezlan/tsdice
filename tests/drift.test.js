import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createDrift, DRIFT_INTERVAL_MS } from '../js/drift.js';

describe('createDrift', () => {
  let enabled;
  let allowed;
  let step;
  let target;
  let drift;

  const start = () => {
    drift = createDrift({
      isEnabled: () => enabled,
      canDrift: () => allowed,
      step,
      target,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    enabled = true;
    allowed = true;
    step = vi.fn();
    target = document.createElement('div');
  });

  afterEach(() => {
    drift?.stop();
    vi.useRealTimers();
  });

  it('steps once per interval while left alone', () => {
    start();
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS - 1);
    expect(step).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(step).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS);
    expect(step).toHaveBeenCalledTimes(2);
  });

  it('waits for a full quiet interval after any activity', () => {
    start();
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS - 1000);
    target.dispatchEvent(new Event('pointermove'));
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS - 1);
    expect(step).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(step).toHaveBeenCalledTimes(1);
  });

  it('does nothing while the setting is off', () => {
    enabled = false;
    start();
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS * 3);
    expect(step).not.toHaveBeenCalled();
  });

  it('starts when the setting is switched on', () => {
    enabled = false;
    start();
    enabled = true;
    drift.restart();
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS);
    expect(step).toHaveBeenCalledTimes(1);
  });

  it('skips steps while paused or hidden, then carries on', () => {
    start();
    allowed = false;
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS);
    expect(step).not.toHaveBeenCalled();
    allowed = true;
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS);
    expect(step).toHaveBeenCalledTimes(1);
  });

  it('stops for good when stopped', () => {
    start();
    drift.stop();
    target.dispatchEvent(new Event('keydown'));
    vi.advanceTimersByTime(DRIFT_INTERVAL_MS * 3);
    expect(step).not.toHaveBeenCalled();
  });
});
