import { AppState } from './state.js';
import { CommandManager } from './commandManager.js';
import { BUTTON_IDS } from './constants.js';
import { getCurrentConfig, getCurrentConfigString, loadConfig } from './state.js';
import { isValidParticlesConfig } from './utils.js';

const infoModal = document.getElementById('info-modal');
const toastNotification = document.getElementById('toast-notification');
const announcer = document.getElementById('announcer');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const iconEnter = document.getElementById('icon-fullscreen-enter');
const iconExit = document.getElementById('icon-fullscreen-exit');
const iconSun = document.getElementById('theme-icon-sun');
const iconMoon = document.getElementById('theme-icon-moon');
const btnBack = document.getElementById(BUTTON_IDS.BACK);
const btnForward = document.getElementById(BUTTON_IDS.FORWARD);
const btnPause = document.getElementById(BUTTON_IDS.PAUSE);
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
            
            const strong = document.createElement('strong');
            strong.textContent = name + ' ';
            
            if (shortcutMatch) {
                const code = document.createElement('code');
                code.textContent = shortcutMatch[1];
                strong.appendChild(code);
            }

            const span = document.createElement('span');
            span.textContent = description || '';

            textWrapper.appendChild(strong);
            textWrapper.appendChild(span);
            
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
        const themeBtn = document.getElementById(BUTTON_IDS.THEME);
        document.body.classList.toggle("light-mode", !AppState.ui.isDarkMode);
        themeBtn.setAttribute('aria-pressed', !AppState.ui.isDarkMode);
        iconSun.style.display = AppState.ui.isDarkMode ? "block" : "none";
        iconMoon.style.display = AppState.ui.isDarkMode ? "none" : "block";
        
        // Toggle Buttons
        document.getElementById(BUTTON_IDS.GRAVITY).classList.toggle('active', AppState.ui.isGravityOn);
        document.getElementById(BUTTON_IDS.GRAVITY).setAttribute('aria-pressed', AppState.ui.isGravityOn);
        document.getElementById(BUTTON_IDS.WALLS).classList.toggle('active', AppState.ui.areWallsOn);
        document.getElementById(BUTTON_IDS.WALLS).setAttribute('aria-pressed', AppState.ui.areWallsOn);
        document.getElementById(BUTTON_IDS.CURSOR).classList.toggle("active", AppState.ui.isCursorParticle);
        document.getElementById(BUTTON_IDS.CURSOR).setAttribute('aria-pressed', AppState.ui.isCursorParticle);
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

export function copyConfig() {
    const configString = getCurrentConfigString();
    navigator.clipboard.writeText(configString).then(() => {
        showToast('Configuration copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy config: ', err);
        showToast('Failed to copy configuration.', 'error');
    });
}

export async function saveScene() {
    try {
        const configString = getCurrentConfigString();
        // Access the exposed API from the preload script
        if (window.electronAPI) {
            const result = await window.electronAPI.invoke('save-file', configString);
            if (result.success) {
                showToast(`Scene saved to ${result.path}`);
            } else {
                // Handle cancellation or minor errors without showing a scary error message
                console.log(result.message);
            }
            return result; // Return the result for the command manager
        } else {
            // Fallback for browser environment
            console.log("Save functionality is only available in the desktop app.");
            copyConfig(); // Provide a useful fallback
            return { success: false, message: 'Not in desktop app.' };
        }
    } catch (error) {
        console.error('Error saving scene:', error);
        showToast('Failed to save scene.', 'error');
        return { success: false, message: error.message };
    }
}

export async function loadScene() {
    try {
        // Access the exposed API from the preload script
        if (window.electronAPI) {
            const result = await window.electronAPI.invoke('load-file');
            if (result.success) {
                const config = JSON.parse(result.content);

                if (!isValidParticlesConfig(config)) {
                    throw new Error('File is not a valid tsParticles configuration.');
                }

                loadConfig(config); // Load the new config into the app state and particles instance
                showToast(`Scene loaded from ${result.path}`);
            } else {
                console.log(result.message);
            }
        } else {
            // Fallback for browser environment
            showToast("Load functionality is only available in the desktop app.", "info");
        }
    } catch (error) {
        console.error('Error loading scene:', error);
        showToast('Failed to load scene. Check file format.', 'error');
    }
}

export function toggleHistory() {
    const historyPanel = document.getElementById('history-panel');
    const isVisible = historyPanel.classList.toggle('visible');
    document.getElementById(BUTTON_IDS.HISTORY).setAttribute('aria-pressed', isVisible);
    if (isVisible) {
        historyPanel.querySelector('button').focus();
    } else {
        document.getElementById(BUTTON_IDS.RESET).focus();
    }
}
