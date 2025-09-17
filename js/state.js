// Holds the application's state. Exported so other modules can read from it.
export const state = {
    particlesContainer: null,
    chaosLevel: 5,
    isDarkMode: true,
    isCursorParticle: false,
    isGravityOn: false,
    areWallsOn: false,
    isPaused: false,
    currentConfig: {},
    originalInteractionModes: {},
    originalOutModes: {},
    configHistory: [],
    configForwardHistory: [],
    lastFocusedElement: null
};

// Functions to modify the state

export function setParticlesContainer(container) {
    state.particlesContainer = container;
}

export function setChaosLevel(level) {
    state.chaosLevel = level;
    localStorage.setItem('tsDiceChaos', level);
}

export function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    localStorage.setItem('tsDiceTheme', state.isDarkMode ? 'dark' : 'light');
    return state.isDarkMode;
}

export function toggleCursorParticle() {
    state.isCursorParticle = !state.isCursorParticle;
    return state.isCursorParticle;
}

export function toggleGravity() {
    state.isGravityOn = !state.isGravityOn;
    return state.isGravityOn;
}

export function toggleWalls() {
    state.areWallsOn = !state.areWallsOn;
    return state.areWallsOn;
}

export function togglePaused() {
    state.isPaused = !state.isPaused;
    return state.isPaused;
}

export function setCurrentConfig(config) {
    state.currentConfig = config;
    try {
        localStorage.setItem('tsDiceLastConfig', JSON.stringify(config));
    } catch (e) {
        console.warn("Could not save config to localStorage, it might be too large.");
    }
}

export function setOriginalInteractionModes(modes) {
    state.originalInteractionModes = modes;
}

export function setOriginalOutModes(modes) {
    state.originalOutModes = modes;
}

export function saveHistory() {
    if (Object.keys(state.currentConfig).length > 0) {
        state.configHistory.push(JSON.parse(JSON.stringify(state.currentConfig)));
        if (state.configHistory.length > 20) {
            state.configHistory.shift();
        }
    }
}

export function clearForwardHistory() {
    state.configForwardHistory = [];
}

export function popHistory() {
    if (state.configHistory.length > 0) {
        state.configForwardHistory.push(JSON.parse(JSON.stringify(state.currentConfig)));
        return state.configHistory.pop();
    }
    return null;
}

export function popForwardHistory() {
    if (state.configForwardHistory.length > 0) {
        saveHistory(); // Save current state before moving forward
        return state.configForwardHistory.pop();
    }
    return null;
}

export function setLastFocused(element) {
    state.lastFocusedElement = element;
}
