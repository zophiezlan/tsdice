import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BUTTON_IDS } from '../js/constants.js';

let removers = [];

function patchDocumentAddEventListener() {
  const original = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (type, handler, opts) => {
      removers.push(() => document.removeEventListener(type, handler, opts));
      return original(type, handler, opts);
    }
  );
}

function setupDOM() {
  document.body.innerHTML = '';
  const menuContainer = document.createElement('nav');
  menuContainer.className = 'menu-container';
  document.body.appendChild(menuContainer);

  const button = document.createElement('button');
  button.id = BUTTON_IDS.SHUFFLE_ALL;
  document.body.appendChild(button);

  const pause = document.createElement('button');
  pause.id = BUTTON_IDS.PAUSE;
  document.body.appendChild(pause);

  return { menuContainer, button, pause };
}

function fireKey(key, init = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.useFakeTimers();
  patchDocumentAddEventListener();
});

afterEach(() => {
  removers.forEach((fn) => fn());
  removers = [];
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('initKeyboardShortcuts', () => {
  it('Escape closes all modals', async () => {
    setupDOM();
    const { ModalManager } = await import('../js/modalManager.js');
    const spy = vi.spyOn(ModalManager, 'closeAll');
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(document.querySelector('.menu-container'));

    fireKey('Escape');
    expect(spy).toHaveBeenCalled();
  });

  it('Space triggers pause click when menu is closed', async () => {
    const { menuContainer, pause } = setupDOM();
    const clickSpy = vi.fn();
    pause.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    const event = fireKey(' ');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('Space does nothing when menu is open (active class)', async () => {
    const { menuContainer, pause } = setupDOM();
    menuContainer.classList.add('active');
    const clickSpy = vi.fn();
    pause.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    fireKey(' ');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('Space is ignored while typing in an input', async () => {
    const { menuContainer, pause } = setupDOM();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const clickSpy = vi.fn();
    pause.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    fireKey(' ');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('Alt+A clicks the shuffle-all button and applies keyboard-press class', async () => {
    const { menuContainer, button } = setupDOM();
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    fireKey('a', { altKey: true });
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(button.classList.contains('keyboard-press')).toBe(true);

    vi.advanceTimersByTime(150);
    expect(button.classList.contains('keyboard-press')).toBe(false);
  });

  it('Alt+<unknown key> is a no-op', async () => {
    const { menuContainer, button } = setupDOM();
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    fireKey('q', { altKey: true });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('Ctrl+Alt+A does not trigger the shortcut', async () => {
    const { menuContainer, button } = setupDOM();
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);
    const { initKeyboardShortcuts } =
      await import('../js/keyboardShortcuts.js');
    initKeyboardShortcuts(menuContainer);

    fireKey('a', { altKey: true, ctrlKey: true });
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
