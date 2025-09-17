import { state, setOriginalInteractionModes } from './state.js';
import { getRandomInRange, getRandomBool, getRandomItem, getChaosProbability } from './utils.js';

// --- Data Arrays for Generation ---
const DATA = {
    darkColorPalette: ["#ff007b", "#33ff57", "#3357ff", "#ffc300", "#ffffff", "#ad55ff", "#00f5d4", "#f15bb5"],
    lightColorPalette: ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0", "#f94144", "#f3722c", "#f9c74f"],
    shapeOptions: ["circle", "square", "triangle", "star", "polygon", "line", "heart", "rounded-rectangle", "character"],
    directionOptions: ["none", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left"],
    hoverModeOptions: ["repulse", "grab", "bubble", "slow", "connect", "parallax", "attract"],
    safeClickModes: ["push", "bubble", "remove", "trail", "absorb"],
    emojiOptions: [
        '🐎', '🐴', '🦄', '🦓', '🕳️', '🌀', '😵‍💫', '🥴', '🫠', '🤯',
        '😴', '🛸', '👽', '👾', '🤖', '😶‍🌫️', '🌫️', '👨‍🚀', '👩‍🚀', '🛰️',
        '⏳', '🕰️', '❓', '⁉️', '🧱', '📺', '🌬️', '🎶', '🎵', '🔊',
        '🔉', '🔈', '🎧', '🎤', '🕺', '💃', '🥳', '🎉', '🎊', '✨',
        '🌟', '💫', '🎆', '🎇', '🎪', '🏕️', '⛺', '🪩', '😎', '🤘',
        '🙌', '🔥', '🎟️', '🎡', '🎢', '🍻', '🥂', '🌙', '🌕', '🌃',
        '🌈', '🌌', '🪐', '☄️', '🍄', '🌵', '🦋', '🐛', '🐌', '🐸',
        '💎', '🔮', '🧿', '🧬', '⚗️', '🧪', '👁️', '🎨', '🌺', '🌸',
        '🌼', '🌷', '🌲', '🌳', '🐉', '🐲', '🐙', '🦑', '🕸️', '🌊',
        '🧠', '👁️‍🗨️', '💭', '💤', '⚡', '💥', '💧', '〰️', '➰', '➿',
        '🧩', '🗝️', '🚪', '♾️', '📉', '📈', '👻', '🤡', '🎭', '🤩',
        '🤪', '🤤', '😇', '🤠', '🥱', '😵', '🗿', '😮', '😲'
    ]
};
export const emojiOptions = DATA.emojiOptions;

// --- Config Generation Functions ---

const generateAppearance = () => {
    const shapeType = getRandomItem(DATA.shapeOptions);
    const chaos = state.chaosLevel;
    const appearance = {
        color: { value: getRandomBool(0.2) ? "random" : getRandomItem(state.isDarkMode ? DATA.darkColorPalette : DATA.lightColorPalette) },
        shape: { type: shapeType, options: {} },
        opacity: { value: { min: 0.3, max: 1 } },
        size: { value: { min: 1, max: 1 + chaos * 1.5 } },
        stroke: { width: getRandomBool(getChaosProbability(0.5, chaos)) ? getRandomInRange(1, 4) : 0, color: { value: "random" } },
    };

    if (shapeType === 'polygon') {
        appearance.shape.options.polygon = { sides: Math.floor(getRandomInRange(3, 13)) };
    }
    if (shapeType === 'character') {
        appearance.shape.options.character = { value: getRandomItem(DATA.emojiOptions), fill: true };
    }
    if (Object.keys(appearance.shape.options).length === 0) {
        delete appearance.shape.options;
    }
    return appearance;
};

const generateMovement = () => {
    const chaos = state.chaosLevel;
    const movement = {
        enable: true,
        speed: getRandomInRange(chaos * 0.5, chaos * 2),
        direction: getRandomItem(DATA.directionOptions),
        random: true,
        straight: false,
        outModes: { default: "out" },
        trail: { enable: getRandomBool(getChaosProbability(0.4, chaos)), length: getRandomInRange(3, 15), fill: { color: { value: state.isDarkMode ? "#111" : "#f0f0f0" } } }
    };

    if (getRandomBool(getChaosProbability(0.4, chaos))) {
        movement.attract = {
            enable: true,
            rotate: { x: getRandomInRange(600, 1500), y: getRandomInRange(600, 1500) }
        };
    }
    return movement;
};

const generateInteraction = () => {
    const chaos = state.chaosLevel;
    const clickMode = getRandomItem(DATA.safeClickModes);
    const hoverMode = getRandomItem(DATA.hoverModeOptions);

    const interaction = {
        events: { onHover: { enable: true, mode: hoverMode }, onClick: { enable: true, mode: clickMode } },
        modes: {
            repulse: { distance: 50 + chaos * 10 },
            push: { quantity: chaos },
            bubble: { distance: 100 + chaos * 15, size: 10 + chaos * 2, duration: 2 },
            parallax: { enable: true, force: 5 * chaos, smooth: 10 },
            grab: { distance: 150 + chaos * 10 },
            slow: { factor: 3, radius: 200 },
            connect: { radius: 150 },
            remove: { quantity: chaos },
            trail: { delay: 0.05, quantity: 1 },
            absorb: { speed: 2 + chaos },
            attract: { distance: 200, speed: chaos / 2 }
        }
    };
    setOriginalInteractionModes({ click: interaction.events.onClick.mode, hover: interaction.events.onHover.mode });
    return interaction;
};

const generateSpecialFX = (currentFx = {}) => {
    const chaos = state.chaosLevel;
    return {
        life: { enable: false },
        collisions: { enable: getRandomBool(getChaosProbability(0.6, chaos)), mode: getRandomBool(0.5) ? "bounce" : "destroy" },
        wobble: { enable: getRandomBool(getChaosProbability(0.5, chaos)), distance: 1 + chaos / 2, speed: 3 + chaos / 2 },
        rotate: { animation: { enable: getRandomBool(getChaosProbability(0.7, chaos)), speed: 5 * chaos, sync: false }, direction: getRandomItem(["clockwise", "counter-clockwise"]) },
        links: { enable: getRandomBool(0.6), distance: 150, color: { value: state.isDarkMode ? "#ffffff" : "#333333" }, opacity: 0.4, width: 1, triangles: { enable: getRandomBool(getChaosProbability(0.3, chaos)) } },
        destroy: currentFx.destroy || { mode: "none" },
        emitters: currentFx.emitters || [],
        twinkle: { particles: { enable: getRandomBool(getChaosProbability(0.4, chaos)), frequency: 0.05, opacity: 1 } }
    };
};

/**
 * Builds a new tsParticles configuration object based on shuffle options.
 * @param {object} shuffleOptions - An object indicating which parts to shuffle.
 * @returns {object} A complete tsParticles configuration object.
 */
export const buildConfig = (shuffleOptions) => {
    const isNew = !state.currentConfig || Object.keys(state.currentConfig).length === 0;
    let newConfig = isNew ? {} : JSON.parse(JSON.stringify(state.currentConfig));
    let baseParticles = newConfig.particles || {};
    let baseInteractivity = newConfig.interactivity || {};

    if (shuffleOptions.all || isNew) {
        Object.assign(baseParticles, generateAppearance(), { move: generateMovement() }, generateSpecialFX());
        baseInteractivity = generateInteraction();
    } else {
        if (shuffleOptions.appearance) Object.assign(baseParticles, generateAppearance());
        if (shuffleOptions.movement) baseParticles.move = { ...baseParticles.move, ...generateMovement() };
        if (shuffleOptions.interaction) baseInteractivity = generateInteraction();
        if (shuffleOptions.fx) {
            Object.assign(baseParticles, generateSpecialFX(baseParticles));
            baseInteractivity = generateInteraction(); // FX can affect interaction
        }
    }
    
    delete baseParticles.emitters; // emitters are top-level

    newConfig = {
        ...newConfig,
        particles: baseParticles,
        interactivity: baseInteractivity,
        background: { color: { value: state.isDarkMode ? "#111" : "#f0f0f0" } },
        fpsLimit: 120,
        detectRetina: true,
    };

    if (!newConfig.particles.move.gravity) newConfig.particles.move.gravity = {};
    newConfig.particles.move.gravity.enable = state.isGravityOn;
    newConfig.particles.move.gravity.acceleration = state.isGravityOn ? 20 : 0;
    newConfig.particles.number = { value: 20 + state.chaosLevel * 20 };

    return newConfig;
};
