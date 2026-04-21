import { SafeStorage } from './storage.js';
import { STORAGE_KEYS } from './constants.js';

/**
 * Wires tab switching, restoration, and arrow-key navigation for the
 * Help & Information modal. Returns a cleanup function.
 *
 * @param {HTMLElement} infoModal
 * @param {HTMLElement} btnInfo — the button that opens the modal
 * @returns {() => void} cleanup
 */
export function setupInfoModalTabs(infoModal, btnInfo) {
  const tabButtons = infoModal.querySelectorAll('.modal-tab');
  const tabContents = infoModal.querySelectorAll('.modal-tab-content');
  const tabButtonsArray = Array.from(tabButtons);

  const activateTab = (button) => {
    const targetTab = button.dataset.tab;
    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach((content) => content.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    document.getElementById(`tab-${targetTab}`)?.classList.add('active');

    SafeStorage.setItem(STORAGE_KEYS.LAST_INFO_TAB, targetTab);
  };

  const clickHandlers = new Map();
  const keydownHandlers = new Map();

  tabButtons.forEach((button, index) => {
    const onClick = () => activateTab(button);
    const onKeydown = (e) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (index + 1) % tabButtonsArray.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex =
          (index - 1 + tabButtonsArray.length) % tabButtonsArray.length;
      }
      if (targetIndex !== -1) {
        tabButtonsArray[targetIndex].click();
        tabButtonsArray[targetIndex].focus();
      }
    };
    button.addEventListener('click', onClick);
    button.addEventListener('keydown', onKeydown);
    clickHandlers.set(button, onClick);
    keydownHandlers.set(button, onKeydown);
  });

  const restoreLastTab = () => {
    const lastTab =
      SafeStorage.getItem(STORAGE_KEYS.LAST_INFO_TAB) || 'controls';
    const target = tabButtonsArray.find((btn) => btn.dataset.tab === lastTab);
    if (target) target.click();
  };

  const onInfoClick = () => setTimeout(restoreLastTab, 0);
  btnInfo.addEventListener('click', onInfoClick);

  return () => {
    tabButtons.forEach((button) => {
      button.removeEventListener('click', clickHandlers.get(button));
      button.removeEventListener('keydown', keydownHandlers.get(button));
    });
    btnInfo.removeEventListener('click', onInfoClick);
  };
}
