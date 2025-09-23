/**
 * @description The single source of truth for the entire application.
 * Divided into namespaces for clarity and organization.
 */
export const AppState = {
    ui: {
        isDarkMode: true,
        isCursorParticle: false,
        isGravityOn: false,
        areWallsOn: false,
        isPaused: false,
        lastFocusedElement: null,
        particlesContainer: null,
    },
    particleState: {
        chaosLevel: 5,
        currentConfig: {},
        originalInteractionModes: {},
        originalOutModes: {},
        initialConfigFromUrl: null,
    }
};

let history = [];
let historyIndex = -1;

export function updateHistory(config) {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(config);
    historyIndex = history.length - 1;
    // Notify main process of unsaved changes
    if (window.electronAPI) {
        window.electronAPI.send('set-unsaved-changes', true);
    }
}

export function getCurrentConfig() {
    return history[historyIndex] || null;
}

export function loadParticles(config) {
    // Logic to load particles based on the config
}

export function navigateHistory(delta) {
    const newIndex = historyIndex + delta;
    if (newIndex >= 0 && newIndex < history.length) {
        historyIndex = newIndex;
        loadParticles(history[historyIndex]);
        // Still unsaved to disk, so keep the dirty flag
        if (window.electronAPI) {
            window.electronAPI.send('set-unsaved-changes', true);
        }
        return true;
    }
    return false;
}

export function loadConfig(config) {
    loadParticles(config);
    // Don't add to history here, as it might be a temporary load
    // The main shuffle functions will handle history updates.
    // After loading from a file, the state is no longer "dirty"
    if (window.electronAPI) {
        window.electronAPI.send('set-unsaved-changes', false);
    }
}

export function initializeState(initialConfig) {
    // Logic to initialize the state
}
