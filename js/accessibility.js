import { elements } from './ui.js';
import * as app from './main.js'; // Import main app logic for handlers

export const announcer = document.getElementById('announcer');

export function announce(message) {
    announcer.textContent = message;
    // Clear after a delay to allow re-announcing the same message
    setTimeout(() => { announcer.textContent = ''; }, 500);
}

export function trapFocus(e, modal) {
    if (e.key !== 'Tab') return;
    const focusableElements = modal.querySelectorAll('button, [href]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
    }
}

export function initializeShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + Key shortcuts
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const keyMap = {
                'a': () => app.handleShuffle({ all: true }),
                'p': () => app.handleShuffle({ appearance: true }),
                'v': () => app.handleShuffle({ movement: true }),
                'i': () => app.handleShuffle({ interaction: true }),
                'f': () => app.handleShuffle({ fx: true }),
                'z': app.handleHistoryBack,
                'y': app.handleHistoryForward,
                'r': app.handleRefresh,
                'g': app.handleGravityToggle,
                'w': app.handleWallsToggle,
                't': app.handleThemeToggle,
                'c': app.handleCursorToggle,
                's': app.handleShare,
                '?': () => document.getElementById('btn-info').click(), // Simplest way to trigger modal
            };
            keyMap[e.key.toLowerCase()]?.();
        }

        // Spacebar for Pause/Play
        if (e.key === ' ' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            if (!elements.menuContainer.classList.contains('active')) {
                e.preventDefault();
                app.handlePauseToggle();
            }
        }
    });
}
