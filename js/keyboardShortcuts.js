import { BUTTON_IDS } from './constants/ui.js';
import { ModalManager } from './modalManager.js';

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

    // Alt+key shortcuts (only when not typing)
    if (e.altKey && !e.ctrlKey && !e.metaKey && !isTyping) {
      e.preventDefault();
      const btnId = {
        m: BUTTON_IDS.MAIN_MENU,
        a: BUTTON_IDS.SHUFFLE_ALL,
        p: BUTTON_IDS.SHUFFLE_APPEARANCE,
        v: BUTTON_IDS.SHUFFLE_MOVEMENT,
        i: BUTTON_IDS.SHUFFLE_INTERACTION,
        f: BUTTON_IDS.SHUFFLE_FX,
        g: BUTTON_IDS.GRAVITY,
        w: BUTTON_IDS.WALLS,
        t: BUTTON_IDS.THEME,
        c: BUTTON_IDS.CURSOR,
        s: BUTTON_IDS.SHARE,
        '?': BUTTON_IDS.INFO,
        r: BUTTON_IDS.REFRESH,
        z: BUTTON_IDS.BACK,
        y: BUTTON_IDS.FORWARD,
      }[e.key.toLowerCase()];

      if (btnId) {
        const button = document.getElementById(btnId);
        if (button) {
          // Add visual feedback for keyboard activation
          button.style.transform = 'scale(0.95)';
          setTimeout(() => {
            button.style.transform = '';
          }, 150);
          button.click();
        }
      }
    }
  });
}
