import { AppState } from './state.js';
import { CommandManager } from './commandManager.js';

const infoModal = document.getElementById('info-modal');
const toastNotification = document.getElementById('toast-notification');
const announcer = document.getElementById('announcer');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const iconEnter = document.getElementById('icon-fullscreen-enter');
const iconExit = document.getElementById('icon-fullscreen-exit');
const iconSun = document.getElementById('theme-icon-sun');
const iconMoon = document.getElementById('theme-icon-moon');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnPause = document.getElementById('btn-pause');
const iconPause = document.getElementById('icon-pause');
const iconPlay = document.getElementById('icon-play');
const chaosSlider = document.getElementById('chaos-slider');
const chaosDisplay = document.getElementById('chaos-display');

/**
 * @description Manages all direct DOM manipulation, UI feedback, and accessibility concerns.
 * This object keeps view-layer logic separate from core application logic.
 */
export const UIManager = {
    /** Announces a message to screen readers using an ARIA live region. */
    announce: (message) => {
        announcer.textContent = message;
    },

    /** Shows a short-lived toast notification at the bottom of the screen. */
    showToast: (message) => {
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    },
    
    /** Updates the fullscreen button icons based on the document's fullscreen state. */
    updateFullscreenIcons: () => {
      const isFullscreen = !!document.fullscreenElement;
      fullscreenBtn.setAttribute('aria-pressed', isFullscreen);
      iconEnter.style.display = isFullscreen ? "none" : "block";
      iconExit.style.display = isFullscreen ? "block" : "none";
    },

    /** Dynamically builds the content of the "How It Works" info modal. */
    populateInfoModal: () => {
        const infoList = infoModal.querySelector('.info-list');
        infoList.innerHTML = '';
        const controls = document.querySelectorAll('.sub-menu .menu-button, .sub-menu .slider-container');
        
        controls.forEach(control => {
            const title = control.getAttribute('data-title') || control.title;
            if (!title) return;

            const icon = control.querySelector('svg')?.cloneNode(true);
            
            const shortcutMatch = title.match(/\(([^)]+)\)/);
            const cleanTitle = title.replace(/\s*\(([^)]+)\)/, '');
            const [name, description] = cleanTitle.split(': ');
            
            const li = document.createElement('li');
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';
            if (icon) {
                iconWrapper.appendChild(icon);
            } else if (control.classList.contains('slider-container')) {
                iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5h20M7 4.5v15"/></svg>`;
            }
            
            const textWrapper = document.createElement('div');
            textWrapper.className = 'info-text';
            textWrapper.innerHTML = `<strong>${name} ${shortcutMatch ? `<code>${shortcutMatch[1]}</code>` : ''}</strong><span>${description || ''}</span>`;
            
            li.appendChild(iconWrapper);
            li.appendChild(textWrapper);
            infoList.appendChild(li);
        });
    },

    /** Opens a modal and manages focus for accessibility. */
    openModal: (modal, opener) => {
        AppState.ui.lastFocusedElement = opener || document.activeElement;
        modal.classList.add('visible');
        const firstFocusableElement = modal.querySelector('button, [href]');
        if(firstFocusableElement) firstFocusableElement.focus();
    },

    /** Closes a modal and returns focus to the element that opened it. */
    closeModal: (modal) => {
        modal.classList.remove('visible');
        if(AppState.ui.lastFocusedElement) AppState.ui.lastFocusedElement.focus();
    },
    
    /**
     * @description Centralized function to synchronize the entire UI with the current AppState.
     * Ensures the UI is always a perfect reflection of the application state.
     */
    syncUI: () => {
        // Theme
        const themeBtn = document.getElementById('btn-theme');
        document.body.classList.toggle("light-mode", !AppState.ui.isDarkMode);
        themeBtn.setAttribute('aria-pressed', !AppState.ui.isDarkMode);
        iconSun.style.display = AppState.ui.isDarkMode ? "block" : "none";
        iconMoon.style.display = AppState.ui.isDarkMode ? "none" : "block";
        
        // Toggle Buttons
        document.getElementById('btn-gravity').classList.toggle('active', AppState.ui.isGravityOn);
        document.getElementById('btn-gravity').setAttribute('aria-pressed', AppState.ui.isGravityOn);
        document.getElementById('btn-walls').classList.toggle('active', AppState.ui.areWallsOn);
        document.getElementById('btn-walls').setAttribute('aria-pressed', AppState.ui.areWallsOn);
        document.getElementById('btn-cursor').classList.toggle("active", AppState.ui.isCursorParticle);
        document.getElementById('btn-cursor').setAttribute('aria-pressed', AppState.ui.isCursorParticle);
        btnPause.classList.toggle("active", AppState.ui.isPaused);
        btnPause.setAttribute('aria-pressed', AppState.ui.isPaused);
        iconPause.style.display = AppState.ui.isPaused ? "none" : "block";
        iconPlay.style.display = AppState.ui.isPaused ? "block" : "none";

        // Slider
        chaosSlider.value = AppState.particleState.chaosLevel;
        chaosSlider.setAttribute('aria-valuenow', AppState.particleState.chaosLevel);
        chaosDisplay.textContent = AppState.particleState.chaosLevel;

        // History Buttons
        btnBack.classList.toggle('disabled', CommandManager.undoStack.length === 0);
        btnForward.classList.toggle('disabled', CommandManager.redoStack.length === 0);
    }
};
