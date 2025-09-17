import { tsParticles } from "https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.4.0/+esm";
import { loadAll } from "https://cdn.jsdelivr.net/npm/@tsparticles/all@3.4.0/+esm";
import * as stateManager from './state.js';
import * as ui from './ui.js';
import { announce } from './accessibility.js';
import { buildConfig, emojiOptions } from './config.js';
import { initializeEventListeners } from './events.js';
import { createShortUrl, copyToClipboard } from './utils.js';

// --- Core Application Logic ---

/**
 * Loads a configuration into the tsParticles instance, effectively updating the animation.
 * @param {object} config - The tsParticles configuration object to load.
 */
async function loadParticles(config) {
    stateManager.setCurrentConfig(config);
    const container = await tsParticles.load({ id: "tsparticles", options: JSON.parse(JSON.stringify(config)) });
    stateManager.setParticlesContainer(container);

    // Reset pause state on new load
    stateManager.state.isPaused = false;
    ui.elements.btnPause.classList.remove("active");
    ui.elements.btnPause.setAttribute('aria-pressed', 'false');
    ui.elements.iconPause.style.display = "block";
    ui.elements.iconPlay.style.display = "none";
}

/**
 * Handles all shuffle actions.
 * @param {object} options - Shuffle options (e.g., { all: true }).
 */
export async function handleShuffle(options) {
    stateManager.saveHistory();
    stateManager.clearForwardHistory();
    const newConfig = buildConfig(options);

    if (stateManager.state.areWallsOn) {
        stateManager.setOriginalOutModes(JSON.parse(JSON.stringify(newConfig.particles.move.outModes)));
        newConfig.particles.move.outModes = { default: "bounce" };
    }

    await loadParticles(newConfig);
    ui.updateHistoryButtons();
}

/**
 * Handles theme toggling.
 */
export function handleThemeToggle() {
    stateManager.toggleDarkMode();
    ui.updateThemeUI();
    if (!stateManager.state.currentConfig.particles) return;

    // Adjust current config colors and reload
    const newPalette = stateManager.state.isDarkMode ? stateManager.darkColorPalette : stateManager.lightColorPalette;
    const config = stateManager.state.currentConfig;
    config.background.color.value = stateManager.state.isDarkMode ? "#111" : "#f0f0f0";
    if (config.particles.color.value !== "random") {
        config.particles.color.value = newPalette[Math.floor(Math.random() * newPalette.length)];
    }
    if (config.particles.links.enable) config.particles.links.color.value = stateManager.state.isDarkMode ? "#ffffff" : "#333333";
    if (config.particles.move.trail.enable) config.particles.move.trail.fill.color.value = stateManager.state.isDarkMode ? "#111" : "#f0f0f0";

    loadParticles(config);
}

export async function handleHistoryBack() {
    const lastConfig = stateManager.popHistory();
    if (lastConfig) {
        // State flags must be updated from the historical config before loading
        stateManager.state.areWallsOn = lastConfig.particles.move.outModes?.default === 'bounce';
        ui.elements.btnWalls.classList.toggle('active', stateManager.state.areWallsOn);
        ui.elements.btnWalls.setAttribute('aria-pressed', stateManager.state.areWallsOn);
        await loadParticles(lastConfig);
        ui.updateHistoryButtons();
    }
}

export async function handleHistoryForward() {
    const nextConfig = stateManager.popForwardHistory();
    if (nextConfig) {
        stateManager.state.areWallsOn = nextConfig.particles.move.outModes?.default === 'bounce';
        ui.elements.btnWalls.classList.toggle('active', stateManager.state.areWallsOn);
        ui.elements.btnWalls.setAttribute('aria-pressed', stateManager.state.areWallsOn);
        await loadParticles(nextConfig);
        ui.updateHistoryButtons();
    }
}

export async function handleRefresh() {
    if (stateManager.state.currentConfig && Object.keys(stateManager.state.currentConfig).length > 0) {
        await loadParticles(stateManager.state.currentConfig);
        ui.showToast('Scene refreshed!');
        announce("Scene refreshed");
    }
}

export function handlePauseToggle() {
    if (!stateManager.state.particlesContainer) return;
    const isPaused = stateManager.togglePaused();
    isPaused ? stateManager.state.particlesContainer.pause() : stateManager.state.particlesContainer.play();
    ui.elements.btnPause.classList.toggle("active", isPaused);
    ui.elements.btnPause.setAttribute('aria-pressed', isPaused);
    ui.elements.iconPause.style.display = isPaused ? "none" : "block";
    ui.elements.iconPlay.style.display = isPaused ? "block" : "none";
    announce(isPaused ? "Animation paused" : "Animation resumed");
}

export async function handleGravityToggle() {
    const isGravityOn = stateManager.toggleGravity();
    ui.elements.btnGravity.classList.toggle('active', isGravityOn);
    ui.elements.btnGravity.setAttribute('aria-pressed', isGravityOn);
    stateManager.state.currentConfig.particles.move.gravity.enable = isGravityOn;
    stateManager.state.currentConfig.particles.move.gravity.acceleration = isGravityOn ? 20 : 0;
    await loadParticles(stateManager.state.currentConfig);
    announce(isGravityOn ? "Gravity enabled" : "Gravity disabled");
}

export async function handleWallsToggle() {
    if (!stateManager.state.currentConfig.particles) return;
    const areWallsOn = stateManager.toggleWalls();
    ui.elements.btnWalls.classList.toggle('active', areWallsOn);
    ui.elements.btnWalls.setAttribute('aria-pressed', areWallsOn);

    if (areWallsOn) {
        stateManager.setOriginalOutModes(JSON.parse(JSON.stringify(stateManager.state.currentConfig.particles.move.outModes)));
        stateManager.state.currentConfig.particles.move.outModes = { default: "bounce" };
    } else {
        stateManager.state.currentConfig.particles.move.outModes = stateManager.state.originalOutModes;
    }
    await loadParticles(stateManager.state.currentConfig);
    announce(areWallsOn ? "Walls enabled" : "Walls disabled");
}

export function handleCursorToggle() {
    const isCursorOn = stateManager.toggleCursorParticle();
    ui.elements.btnCursor.classList.toggle("active", isCursorOn);
    ui.elements.btnCursor.setAttribute('aria-pressed', isCursorOn);

    if (isCursorOn) {
        stateManager.state.currentConfig.interactivity.modes.trail = { delay: 0.05, quantity: 1, pauseOnStop: true };
        stateManager.state.currentConfig.interactivity.events.onHover.mode = "trail";
        stateManager.state.currentConfig.interactivity.events.onClick.enable = false;
    } else {
        stateManager.state.currentConfig.interactivity.events.onHover.mode = stateManager.state.originalInteractionModes.hover || "repulse";
        stateManager.state.currentConfig.interactivity.events.onClick.enable = true;
    }
    loadParticles(stateManager.state.currentConfig);
    announce(isCursorOn ? "Cursor particle enabled" : "Cursor particle disabled");
}

export function handleChaosChange() {
    ui.updateChaosDisplay();
    announce(`Chaos level ${stateManager.state.chaosLevel}`);
}

export async function handleShare() {
    const sharableConfig = JSON.parse(JSON.stringify(stateManager.state.currentConfig));
    sharableConfig.uiState = {
        chaosLevel: stateManager.state.chaosLevel,
        isDarkMode: stateManager.state.isDarkMode,
        isCursorParticle: stateManager.state.isCursorParticle,
        isGravityOn: stateManager.state.isGravityOn,
        areWallsOn: stateManager.state.areWallsOn,
    };
    if (stateManager.state.areWallsOn) {
        sharableConfig.uiState.originalOutModes = stateManager.state.originalOutModes;
    }

    try {
        const configString = JSON.stringify(sharableConfig);
        const compressedConfig = LZString.compressToEncodedURIComponent(configString);
        const fullUrl = `${window.location.href.split('#')[0]}#config=${compressedConfig}`;

        ui.elements.btnShare.classList.add('disabled');
        ui.showToast('Creating short link...');

        const shortUrl = await createShortUrl(fullUrl, emojiOptions);
        await copyToClipboard(shortUrl || fullUrl);

    } catch (e) {
        ui.showToast("Could not create share link.");
        console.error('Share error:', e);
    } finally {
        ui.elements.btnShare.classList.remove('disabled');
    }
}

// --- Initialisation ---

async function init() {
    await loadAll(tsParticles);

    // Load settings from localStorage
    const savedTheme = localStorage.getItem('tsDiceTheme');
    stateManager.state.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
    const savedChaos = localStorage.getItem('tsDiceChaos');
    if (savedChaos) stateManager.setChaosLevel(parseInt(savedChaos, 10));

    let initialConfig = null;

    // Check for a configuration in the URL hash
    if (window.location.hash && window.location.hash.startsWith('#config=')) {
        try {
            const encodedConfig = window.location.hash.substring(8);
            const decodedString = LZString.decompressFromEncodedURIComponent(encodedConfig);
            const parsedConfig = JSON.parse(decodedString);
            
            if (parsedConfig.uiState) {
                stateManager.setChaosLevel(parsedConfig.uiState.chaosLevel || 5);
                stateManager.state.isDarkMode = parsedConfig.uiState.isDarkMode !== false;
                stateManager.state.isCursorParticle = parsedConfig.uiState.isCursorParticle === true;
                stateManager.state.isGravityOn = parsedConfig.uiState.isGravityOn === true;
                stateManager.state.areWallsOn = parsedConfig.uiState.areWallsOn === true;
                if(stateManager.state.areWallsOn) stateManager.setOriginalOutModes(parsedConfig.uiState.originalOutModes);
                delete parsedConfig.uiState;
            }
            initialConfig = parsedConfig;

        } catch (e) {
            console.error("Failed to parse config from URL", e);
            window.location.hash = ''; // Clear broken hash
        }
    }

    // Fallback to localStorage if no URL config
    if (!initialConfig) {
        try {
            const savedConfigString = localStorage.getItem('tsDiceLastConfig');
            if (savedConfigString) initialConfig = JSON.parse(savedConfigString);
        } catch (e) {
            console.error("Could not parse saved config from localStorage.", e);
        }
    }

    // Set initial UI state from loaded settings
    ui.updateChaosDisplay();
    ui.updateThemeUI();
    ui.elements.btnWalls.classList.toggle('active', stateManager.state.areWallsOn);
    ui.elements.btnWalls.setAttribute('aria-pressed', stateManager.state.areWallsOn);
    
    // Determine which config to load: URL > localStorage > New Random
    const configToLoad = initialConfig || buildConfig({ all: true });
    await loadParticles(configToLoad);

    // Final UI updates and event listener setup
    initializeEventListeners();
    ui.updateHistoryButtons();

    // Show welcome modal if not seen
    if (!localStorage.getItem('tsDiceWelcomeSeen')) {
        setTimeout(() => ui.openModal(ui.elements.welcomeModal), 500);
    }

    // Reduced motion handling
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotion = () => {
        if (motionQuery.matches && stateManager.state.particlesContainer && !stateManager.state.isPaused) {
            handlePauseToggle();
            announce("Animation paused due to reduced motion preference.");
        }
    };
    handleReducedMotion();
    motionQuery.addEventListener('change', handleReducedMotion);
}

// Start the application
init();
