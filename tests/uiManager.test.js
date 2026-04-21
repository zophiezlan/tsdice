import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BUTTON_IDS } from '../js/constants.js';

function seedDOM() {
  document.body.innerHTML = `
    <div id="info-modal"><ul class="info-list"></ul></div>
    <div id="toast-notification"></div>
    <div id="announcer"></div>
    <button id="fullscreen-btn"></button>
    <span id="icon-fullscreen-enter"></span>
    <span id="icon-fullscreen-exit"></span>
    <span id="theme-icon-sun"></span>
    <span id="theme-icon-moon"></span>
    <button id="${BUTTON_IDS.BACK}"></button>
    <button id="${BUTTON_IDS.FORWARD}"></button>
    <button id="${BUTTON_IDS.PAUSE}"></button>
    <span id="icon-pause"></span>
    <span id="icon-play"></span>
    <input type="range" id="chaos-slider" min="1" max="10" value="5" />
    <span id="chaos-display"></span>
    <button id="${BUTTON_IDS.THEME}"></button>
    <button id="${BUTTON_IDS.GRAVITY}"></button>
    <button id="${BUTTON_IDS.WALLS}"></button>
    <button id="${BUTTON_IDS.CURSOR}"></button>
    <div id="tsparticles"></div>
  `;
}

let UIManager, AppState;

beforeEach(async () => {
  seedDOM();
  vi.useFakeTimers();
  vi.resetModules();
  ({ UIManager } = await import('../js/uiManager.js'));
  ({ AppState } = await import('../js/state.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('UIManager.announce', () => {
  it('writes to #announcer', () => {
    UIManager.announce('hello');
    expect(document.getElementById('announcer').textContent).toBe('hello');
  });
});

describe('UIManager.showToast', () => {
  it('shows a toast with text and auto-hides', () => {
    const toast = document.getElementById('toast-notification');
    UIManager.showToast('Saved');
    expect(toast.textContent).toBe('Saved');
    expect(toast.classList.contains('show')).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(toast.classList.contains('show')).toBe(false);
  });
});

describe('UIManager.showLoadingIndicator / hideLoadingIndicator', () => {
  it('sets and clears wait cursor on #tsparticles', () => {
    const container = document.getElementById('tsparticles');
    UIManager.showLoadingIndicator();
    expect(container.style.cursor).toBe('wait');
    UIManager.hideLoadingIndicator();
    expect(container.style.cursor).toBe('');
  });
});

describe('UIManager.openModal / closeModal', () => {
  it('openModal stores lastFocusedElement and focuses content (not close btn)', () => {
    const modal = document.createElement('div');
    modal.innerHTML = `<button class="modal-close-btn">X</button><button id="main">OK</button>`;
    document.body.appendChild(modal);
    const opener = document.createElement('button');
    document.body.appendChild(opener);

    UIManager.openModal(modal, opener);
    expect(modal.classList.contains('visible')).toBe(true);
    expect(document.activeElement.id).toBe('main');
    expect(AppState.ui.lastFocusedElement).toBe(opener);
  });

  it('closeModal restores focus to lastFocusedElement', () => {
    const modal = document.createElement('div');
    modal.innerHTML = `<button>X</button>`;
    document.body.appendChild(modal);
    const opener = document.createElement('button');
    document.body.appendChild(opener);

    UIManager.openModal(modal, opener);
    UIManager.closeModal(modal);
    expect(modal.classList.contains('visible')).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
});

describe('UIManager.syncUI', () => {
  it('reflects chaos level on slider aria attributes', () => {
    AppState.particleState.chaosLevel = 7;
    UIManager.syncUI();
    const slider = document.getElementById('chaos-slider');
    expect(slider.getAttribute('aria-valuenow')).toBe('7');
    expect(slider.getAttribute('aria-valuetext')).toBe('Chaos level 7 of 10');
    expect(document.getElementById('chaos-display').textContent).toBe('7');
  });

  it('toggles light-mode class on body based on theme', () => {
    AppState.ui.isDarkMode = false;
    UIManager.syncUI();
    expect(document.body.classList.contains('light-mode')).toBe(true);

    AppState.ui.isDarkMode = true;
    UIManager.syncUI();
    expect(document.body.classList.contains('light-mode')).toBe(false);
  });

  it('sets aria-pressed on toggle buttons', () => {
    AppState.ui.isGravityOn = true;
    AppState.ui.areWallsOn = false;
    AppState.ui.isCursorParticle = true;
    UIManager.syncUI();

    expect(
      document.getElementById(BUTTON_IDS.GRAVITY).getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      document.getElementById(BUTTON_IDS.WALLS).getAttribute('aria-pressed')
    ).toBe('false');
    expect(
      document.getElementById(BUTTON_IDS.CURSOR).getAttribute('aria-pressed')
    ).toBe('true');
  });
});
