import { BUTTON_IDS } from './constants.js';
import { ModalManager } from './modalManager.js';

/** Alt+key shortcuts, keyed by `KeyboardEvent.code` (physical key). */
const ALT_SHORTCUTS = {
  KeyM: BUTTON_IDS.MAIN_MENU,
  KeyA: BUTTON_IDS.SHUFFLE_ALL,
  KeyP: BUTTON_IDS.SHUFFLE_APPEARANCE,
  KeyV: BUTTON_IDS.SHUFFLE_MOVEMENT,
  KeyI: BUTTON_IDS.SHUFFLE_INTERACTION,
  KeyF: BUTTON_IDS.SHUFFLE_FX,
  KeyG: BUTTON_IDS.GRAVITY,
  KeyW: BUTTON_IDS.WALLS,
  KeyT: BUTTON_IDS.THEME,
  KeyC: BUTTON_IDS.CURSOR,
  KeyS: BUTTON_IDS.SHARE,
  Slash: BUTTON_IDS.INFO,
  KeyR: BUTTON_IDS.REFRESH,
  KeyZ: BUTTON_IDS.BACK,
  KeyY: BUTTON_IDS.FORWARD,
};

/**
 * Buttons are disabled with a `disabled` class (CSS `pointer-events: none`),
 * which blocks the mouse but not programmatic `.click()`.
 */
export const isButtonDisabled = (button) =>
  button.disabled ||
  button.classList.contains('disabled') ||
  button.getAttribute('aria-disabled') === 'true';

/**
 * Initialise global keyboard shortcuts.
 * Space toggles pause when menu is closed, Esc closes modals,
 * Alt+key triggers matching buttons by id.
 *
 * @param {HTMLElement} menuContainer - the menu container to check open/closed state
 */
export function initKeyboardShortcuts(menuContainer) {
  document.addEventListener('keydown', (e) => {
    // Always allow Escape to close modals
    if (e.key === 'Escape') {
      ModalManager.closeAll();
      return;
    }

    // Check if user is typing in an input field
    const activeEl = document.activeElement;
    const isTyping =
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable;

    // Spacebar to pause/play (only when not typing and menu is closed)
    if (
      e.key === ' ' &&
      !isTyping &&
      !menuContainer.classList.contains('active')
    ) {
      e.preventDefault();
      document.getElementById(BUTTON_IDS.PAUSE)?.click();
      return;
    }

    // Alt+key shortcuts (only when not typing). Match on the physical key
    // (`e.code`) rather than `e.key`: on macOS, Option+A produces "å", so
    // `e.key` never matches a letter.
    if (e.altKey && !e.ctrlKey && !e.metaKey && !isTyping) {
      const btnId = ALT_SHORTCUTS[e.code];
      if (!btnId) return; // leave browser/OS Alt shortcuts alone

      e.preventDefault();
      const button = document.getElementById(btnId);
      if (button && !isButtonDisabled(button)) {
        button.classList.add('keyboard-press');
        setTimeout(() => button.classList.remove('keyboard-press'), 150);
        button.click();
      }
    }
  });
}
