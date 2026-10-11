import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    syncUI: vi.fn(),
    announce: vi.fn(),
    showToast: vi.fn(),
  },
}));

vi.mock('../js/turnstile.js', () => ({
  getToken: vi.fn().mockResolvedValue(null),
  resetToken: vi.fn(),
}));

vi.mock('../js/utils.js', async (importOriginal) => ({
  ...(await importOriginal()),
  copyToClipboard: vi.fn(),
}));

import { handleShareClick } from '../js/shareManager.js';
import { AppState } from '../js/state.js';
import { copyToClipboard } from '../js/utils.js';

describe('handleShareClick', () => {
  let button;

  beforeEach(() => {
    vi.clearAllMocks();
    button = document.createElement('button');
    AppState.particleState.currentConfig = {
      particles: { move: {} },
      interactivity: { events: { onHover: { mode: 'grab' } } },
    };
  });

  it('copies a #config= link and re-enables the button', async () => {
    await handleShareClick(button);

    expect(copyToClipboard).toHaveBeenCalledOnce();
    expect(copyToClipboard.mock.calls[0][0]).toContain('#config=');
    expect(button.classList.contains('disabled')).toBe(false);
  });

  it('ignores repeat clicks while a share is in flight', async () => {
    let finishCopy;
    copyToClipboard.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishCopy = resolve;
        })
    );

    const first = handleShareClick(button);
    expect(button.classList.contains('disabled')).toBe(true);
    await handleShareClick(button);
    await handleShareClick(button);

    await vi.waitFor(() => expect(finishCopy).toBeTypeOf('function'));
    finishCopy();
    await first;

    expect(copyToClipboard).toHaveBeenCalledOnce();
    expect(button.classList.contains('disabled')).toBe(false);

    // A new share is allowed once the first has finished
    await handleShareClick(button);
    expect(copyToClipboard).toHaveBeenCalledTimes(2);
  });
});
