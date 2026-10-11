/**
 * @fileoverview Connects the sound engine to the live app: creates audio
 * only once someone turns sound on, follows scene changes, pauses and tab
 * visibility, and turns taps on the scene into notes.
 */

import { createSoundEngine } from './soundEngine.js';
import { sceneToMusic } from './music.js';

/** How far ahead (seconds) ambient chimes are scheduled */
const LOOKAHEAD = 0.6;
const TICK_MS = 200;

/**
 * @param {Object} deps
 * @param {() => {config: Object, chaosLevel: number, isDarkMode: boolean}}
 *   deps.getScene - The scene currently on screen
 * @param {() => boolean} deps.isPaused
 * @param {() => AudioContext} [deps.createContext]
 */
export const createSoundController = ({
  getScene,
  isPaused,
  createContext = () =>
    new (window.AudioContext || window.webkitAudioContext)(),
}) => {
  let ctx = null;
  let engine = null;
  let enabled = false;
  let ticker = null;

  const audible = () => enabled && !isPaused() && !document.hidden;

  const tick = () => {
    if (engine && ctx.state === 'running') {
      engine.scheduleUntil(ctx.currentTime + LOOKAHEAD);
    }
  };

  const refreshLevel = () => {
    if (!engine) return;
    if (audible()) {
      ctx.resume?.();
      engine.fadeIn();
    } else {
      engine.fadeOut();
    }
  };

  const onVisibility = () => refreshLevel();

  // Browsers keep audio locked until a gesture; if sound was left on from a
  // previous visit, the first tap or key press unlocks it.
  const unlock = () => {
    if (enabled && ctx && ctx.state !== 'running') refreshLevel();
  };

  return {
    /** Turns sound on or off. Call from a user gesture when turning on. */
    setEnabled(on) {
      enabled = on;
      if (on && !engine) {
        ctx = createContext();
        engine = createSoundEngine(ctx);
        engine.setScene(sceneToMusic(getScene()));
        ticker = setInterval(tick, TICK_MS);
        document.addEventListener('visibilitychange', onVisibility);
        document.addEventListener('pointerdown', unlock);
        document.addEventListener('keydown', unlock);
      }
      refreshLevel();
    },

    get enabled() {
      return enabled;
    },

    /** Call after a new scene has loaded */
    onSceneChange() {
      if (engine) engine.setScene(sceneToMusic(getScene()));
    },

    /** Call when pause is toggled */
    onPauseChange() {
      refreshLevel();
    },

    /**
     * A tap on the scene, in viewport pixels.
     * @returns {boolean} Whether a note played
     */
    onTap(clientX, clientY) {
      if (!audible() || !engine) return false;
      return engine.tap({
        x: clientX / Math.max(1, window.innerWidth),
        y: clientY / Math.max(1, window.innerHeight),
      });
    },

    dispose() {
      clearInterval(ticker);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      ctx?.close?.();
      ctx = null;
      engine = null;
    },
  };
};
