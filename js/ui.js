import { state, setLastFocused } from './state.js';
import { announce } from './accessibility.js';

// --- Element Selectors ---
export const
    elements = {
        mainMenuBtn: document.getElementById('main-menu-btn'),
        menuContainer: document.getElementById('menu-container'),
        subMenu: document.getElementById('sub-menu'),
        btnTheme: document.getElementById('btn-theme'),
        btnBack: document.getElementById('btn-back'),
        btnForward: document.getElementById('btn-forward'),
        btnPause: document.getElementById('btn-pause'),
        btnWalls: document.getElementById('btn-walls'),
        btnGravity: document.getElementById('btn-gravity'),
        btnCursor: document.getElementById('btn-cursor'),
        btnShare: document.getElementById('btn-share'),
        iconPause: document.getElementById('icon-pause'),
        iconPlay: document.getElementById('icon-play'),
        chaosSlider: document.getElementById('chaos-slider'),
        chaosDisplay: document.getElementById('chaos-display'),
        welcomeModal: document.getElementById('welcome-modal'),
        infoModal: document.getElementById('info-modal'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
        iconEnter: document.getElementById('icon-fullscreen-enter'),
        iconExit: document.getElementById('icon-fullscreen-exit'),
        toastNotification: document.getElementById('toast-notification'),
        iconSun: document.getElementById('theme-icon-sun'),
        iconMoon: document.getElementById('theme-icon-moon'),
        tooltip: document.createElement('div'),
    };

// Initialize Tooltip
elements.tooltip.id = 'custom-tooltip';
document.body.appendChild(elements.tooltip);


// --- UI Update Functions ---

export function updateChaosDisplay() {
    elements.chaosDisplay.textContent = state.chaosLevel;
    elements.chaosSlider.value = state.chaosLevel;
    elements.chaosSlider.setAttribute('aria-valuenow', state.chaosLevel);
}

export function updateHistoryButtons() {
    elements.btnBack.classList.toggle('disabled', state.configHistory.length === 0);
    elements.btnForward.classList.toggle('disabled', state.configForwardHistory.length === 0);
}

export function showToast(message) {
    elements.toastNotification.textContent = message;
    elements.toastNotification.classList.add('show');
    setTimeout(() => {
        elements.toastNotification.classList.remove('show');
    }, 3000);
}

export function updateThemeUI() {
    document.body.classList.toggle("light-mode", !state.isDarkMode);
    elements.btnTheme.setAttribute('aria-pressed', !state.isDarkMode);
    elements.iconSun.style.display = state.isDarkMode ? "block" : "none";
    elements.iconMoon.style.display = state.isDarkMode ? "none" : "block";
    announce(state.isDarkMode ? "Dark theme enabled" : "Light theme enabled");
}

export function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

export function updateFullscreenIcons() {
    const isFullscreen = !!document.fullscreenElement;
    elements.fullscreenBtn.setAttribute('aria-pressed', isFullscreen);
    elements.iconEnter.style.display = isFullscreen ? "none" : "block";
    elements.iconExit.style.display = isFullscreen ? "block" : "none";
}

export function populateInfoModal() {
    const infoList = elements.infoModal.querySelector('.info-list');
    infoList.innerHTML = '';
    const controls = document.querySelectorAll('.sub-menu .menu-button, .sub-menu .slider-container');

    controls.forEach(control => {
        const title = control.getAttribute('data-title') || control.title;
        if (!title) return;

        const [name, description] = title.split(': ');
        const icon = control.querySelector('svg')?.cloneNode(true);

        const li = document.createElement('li');
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'icon-wrapper';
        if (icon) iconWrapper.appendChild(icon);

        const textWrapper = document.createElement('div');
        textWrapper.className = 'info-text';
        textWrapper.innerHTML = `<strong>${name}</strong><span>${description || ''}</span>`;

        li.appendChild(iconWrapper);
        li.appendChild(textWrapper);
        infoList.appendChild(li);
    });
}

export function openModal(modal, opener) {
    setLastFocused(opener || document.activeElement);
    modal.classList.add('visible');
    const firstFocusableElement = modal.querySelector('button, [href]');
    if (firstFocusableElement) firstFocusableElement.focus();
}

export function closeModal(modal) {
    modal.classList.remove('visible');
    if (state.lastFocusedElement) state.lastFocusedElement.focus();
}

// --- Tooltip Logic ---
export function updateTooltipPosition(mouseX, mouseY) {
    const tooltipRect = elements.tooltip.getBoundingClientRect();
    const padding = 15;
    let top = mouseY - tooltipRect.height - padding;
    let left = mouseX - tooltipRect.width / 2;

    if (top < padding) top = mouseY + padding;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
    }
    elements.tooltip.style.left = `${left}px`;
    elements.tooltip.style.top = `${top}px`;
}

export function showTooltip(e) {
    const target = e.target.closest('.menu-button, .slider-container');
    if (!target || !target.title) return;

    target.setAttribute('data-title', target.title);
    target.removeAttribute('title');

    const titleText = target.getAttribute('data-title');
    const shortcutMatch = titleText.match(/\(([^)]+)\)/);
    const cleanTitle = titleText.replace(/\s*\(([^)]+)\)/, '');
    const [name, description] = cleanTitle.split(': ');

    elements.tooltip.innerHTML = `<strong>${name} ${shortcutMatch ? `<code>${shortcutMatch[1]}</code>` : ''}</strong><span>${description || ''}</span>`;
    elements.tooltip.classList.add('visible');
    updateTooltipPosition(e.clientX, e.clientY);
}

export function hideTooltip(e) {
    const target = e.target.closest('.menu-button, .slider-container');
    if (!target || !target.getAttribute('data-title')) return;

    elements.tooltip.classList.remove('visible');
    target.setAttribute('title', target.getAttribute('data-title'));
    target.removeAttribute('data-title');
}
