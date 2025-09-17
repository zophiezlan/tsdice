import { elements, openModal, closeModal, populateInfoModal, toggleFullScreen, updateFullscreenIcons, showTooltip, hideTooltip, updateTooltipPosition } from './ui.js';
import { setChaosLevel } from './state.js';
import { trapFocus, initializeShortcuts } from './accessibility.js';
import * as app from './main.js'; // Import all exported functions from main.js

export function initializeEventListeners() {
    // --- Menu & Shuffle ---
    elements.mainMenuBtn.addEventListener("click", () => {
        const isActive = elements.menuContainer.classList.toggle("active");
        elements.mainMenuBtn.setAttribute('aria-pressed', isActive);
        elements.mainMenuBtn.setAttribute('aria-label', isActive ? 'Close Settings Menu' : 'Open Settings Menu');
    });

    document.getElementById('btn-shuffle-all').addEventListener("click", () => app.handleShuffle({ all: true }));
    document.getElementById('btn-shuffle-appearance').addEventListener("click", () => app.handleShuffle({ appearance: true }));
    document.getElementById('btn-shuffle-movement').addEventListener("click", () => app.handleShuffle({ movement: true }));
    document.getElementById('btn-shuffle-interaction').addEventListener("click", () => app.handleShuffle({ interaction: true }));
    document.getElementById('btn-shuffle-fx').addEventListener("click", () => app.handleShuffle({ fx: true }));
    
    // --- Controls ---
    elements.btnTheme.addEventListener("click", app.handleThemeToggle);
    elements.btnCursor.addEventListener("click", app.handleCursorToggle);
    elements.btnPause.addEventListener("click", app.handlePauseToggle);
    elements.btnBack.addEventListener("click", app.handleHistoryBack);
    elements.btnForward.addEventListener("click", app.handleHistoryForward);
    document.getElementById('btn-refresh').addEventListener("click", app.handleRefresh);
    elements.btnGravity.addEventListener('click', app.handleGravityToggle);
    elements.btnWalls.addEventListener('click', app.handleWallsToggle);
    elements.btnShare.addEventListener('click', app.handleShare);

    elements.chaosSlider.addEventListener('input', (e) => {
        const level = parseInt(e.target.value, 10);
        setChaosLevel(level);
        app.handleChaosChange(); // Notify main logic
    });

    // --- Modals & Fullscreen ---
    document.getElementById('btn-info').addEventListener('click', (e) => {
        populateInfoModal();
        openModal(elements.infoModal, e.currentTarget);
    });
    document.getElementById('close-info-modal').addEventListener('click', () => closeModal(elements.infoModal));
    elements.infoModal.addEventListener('keydown', (e) => trapFocus(e, elements.infoModal));
    elements.infoModal.addEventListener('click', (e) => {
        if (e.target === elements.infoModal) closeModal(elements.infoModal);
    });

    document.getElementById('close-welcome-modal').addEventListener("click", () => {
        closeModal(elements.welcomeModal);
        localStorage.setItem('tsDiceWelcomeSeen', 'true');
    });
    elements.welcomeModal.addEventListener('keydown', (e) => trapFocus(e, elements.welcomeModal));
    elements.welcomeModal.addEventListener('click', (e) => {
        if (e.target === elements.welcomeModal) {
            closeModal(elements.welcomeModal);
            localStorage.setItem('tsDiceWelcomeSeen', 'true');
        }
    });

    elements.fullscreenBtn.addEventListener("click", toggleFullScreen);
    document.addEventListener("fullscreenchange", updateFullscreenIcons);

    // --- Tooltip ---
    elements.subMenu.addEventListener('mouseover', showTooltip);
    elements.subMenu.addEventListener('mouseout', hideTooltip);
    elements.subMenu.addEventListener('mousemove', (e) => {
        if (elements.tooltip.classList.contains('visible')) {
            updateTooltipPosition(e.clientX, e.clientY);
        }
    });

    // --- Accessibility ---
    document.querySelectorAll('[role="button"]').forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    initializeShortcuts();
}
