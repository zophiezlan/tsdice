/**
 * @fileoverview State management with dispatch pattern and validation
 */

import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { ErrorHandler, ErrorType } from './errorHandler.js';

/**
 * Action types for state mutations
 */
export const ActionType = {
  SET_THEME: 'SET_THEME',
  SET_CHAOS_LEVEL: 'SET_CHAOS_LEVEL',
  TOGGLE_GRAVITY: 'TOGGLE_GRAVITY',
  TOGGLE_WALLS: 'TOGGLE_WALLS',
  TOGGLE_CURSOR: 'TOGGLE_CURSOR',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  SET_CONFIG: 'SET_CONFIG',
  SET_ORIGINAL_MODES: 'SET_ORIGINAL_MODES',
  INIT_FROM_STORAGE: 'INIT_FROM_STORAGE',
};

/**
 * State manager with dispatch pattern
 */
export const StateManager = {
  /**
   * Dispatch an action to mutate state
   * @param {Object} action - Action object with type and payload
   * @returns {boolean} - Success status
   */
  dispatch(action) {
    try {
      const { type, payload } = action;

      switch (type) {
        case ActionType.SET_THEME:
          this._setTheme(payload);
          break;

        case ActionType.SET_CHAOS_LEVEL:
          this._setChaosLevel(payload);
          break;

        case ActionType.TOGGLE_GRAVITY:
          this._toggleGravity();
          break;

        case ActionType.TOGGLE_WALLS:
          this._toggleWalls();
          break;

        case ActionType.TOGGLE_CURSOR:
          this._toggleCursor();
          break;

        case ActionType.TOGGLE_PAUSE:
          this._togglePause();
          break;

        case ActionType.SET_CONFIG:
          this._setConfig(payload);
          break;

        case ActionType.SET_ORIGINAL_MODES:
          this._setOriginalModes(payload);
          break;

        case ActionType.INIT_FROM_STORAGE:
          this._initFromStorage();
          break;

        default:
          console.warn(`Unknown action type: ${type}`);
          return false;
      }

      // Sync UI after state change
      UIManager.syncUI();
      return true;
    } catch (error) {
      ErrorHandler.handle(error, ErrorType.UNKNOWN, { action });
      return false;
    }
  },

  /**
   * Get current state (read-only copy)
   * @returns {Object} - Deep copy of current state
   */
  getState() {
    return structuredClone(AppState);
  },

  /**
   * Persist state to localStorage
   */
  persist() {
    try {
      // Persist theme
      localStorage.setItem(
        'tsDiceTheme',
        AppState.ui.isDarkMode ? 'dark' : 'light'
      );

      // Persist chaos level
      localStorage.setItem(
        'tsDiceChaos',
        String(AppState.particleState.chaosLevel)
      );

      // Persist last config
      if (
        AppState.particleState.currentConfig &&
        Object.keys(AppState.particleState.currentConfig).length > 0
      ) {
        localStorage.setItem(
          'tsDiceLastConfig',
          JSON.stringify(AppState.particleState.currentConfig)
        );
      }
    } catch (error) {
      ErrorHandler.handle(error, ErrorType.STORAGE_ERROR);
    }
  },

  /**
   * Validate state integrity
   * @returns {boolean} - Whether state is valid
   */
  validate() {
    // Check UI state
    if (typeof AppState.ui.isDarkMode !== 'boolean') return false;
    if (typeof AppState.ui.isCursorParticle !== 'boolean') return false;
    if (typeof AppState.ui.isGravityOn !== 'boolean') return false;
    if (typeof AppState.ui.areWallsOn !== 'boolean') return false;
    if (typeof AppState.ui.isPaused !== 'boolean') return false;

    // Check particle state
    if (typeof AppState.particleState.chaosLevel !== 'number') return false;
    if (
      AppState.particleState.chaosLevel < 1 ||
      AppState.particleState.chaosLevel > 10
    )
      return false;

    return true;
  },

  // Private mutation methods
  _setTheme(isDark) {
    AppState.ui.isDarkMode = Boolean(isDark);
    this.persist();
  },

  _setChaosLevel(level) {
    const validLevel = Math.max(1, Math.min(10, Number(level)));
    AppState.particleState.chaosLevel = validLevel;
    this.persist();
  },

  _toggleGravity() {
    AppState.ui.isGravityOn = !AppState.ui.isGravityOn;
  },

  _toggleWalls() {
    AppState.ui.areWallsOn = !AppState.ui.areWallsOn;
  },

  _toggleCursor() {
    AppState.ui.isCursorParticle = !AppState.ui.isCursorParticle;
  },

  _togglePause() {
    AppState.ui.isPaused = !AppState.ui.isPaused;
  },

  _setConfig(config) {
    if (!ErrorHandler.validateConfig(config)) {
      throw new Error('Invalid particle configuration');
    }
    AppState.particleState.currentConfig = config;
    this.persist();
  },

  _setOriginalModes(modes) {
    if (modes.interaction) {
      AppState.particleState.originalInteractionModes = {
        ...modes.interaction,
      };
    }
    if (modes.outModes) {
      AppState.particleState.originalOutModes = { ...modes.outModes };
    }
  },

  _initFromStorage() {
    try {
      // Load theme
      const savedTheme = localStorage.getItem('tsDiceTheme');
      if (savedTheme) {
        AppState.ui.isDarkMode = savedTheme === 'dark';
      }

      // Load chaos level
      const savedChaos = localStorage.getItem('tsDiceChaos');
      if (savedChaos) {
        const chaos = parseInt(savedChaos, 10);
        if (!isNaN(chaos) && chaos >= 1 && chaos <= 10) {
          AppState.particleState.chaosLevel = chaos;
        }
      }

      // Load last config
      const savedConfig = localStorage.getItem('tsDiceLastConfig');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (ErrorHandler.validateConfig(config)) {
            AppState.particleState.currentConfig = config;
          }
        } catch (parseError) {
          console.warn('Could not parse saved config', parseError);
          localStorage.removeItem('tsDiceLastConfig');
        }
      }
    } catch (error) {
      ErrorHandler.handle(error, ErrorType.STORAGE_ERROR);
    }
  },
};

/**
 * Action creators for common state mutations
 */
export const Actions = {
  setTheme: (isDark) => ({ type: ActionType.SET_THEME, payload: isDark }),
  setChaosLevel: (level) => ({
    type: ActionType.SET_CHAOS_LEVEL,
    payload: level,
  }),
  toggleGravity: () => ({ type: ActionType.TOGGLE_GRAVITY }),
  toggleWalls: () => ({ type: ActionType.TOGGLE_WALLS }),
  toggleCursor: () => ({ type: ActionType.TOGGLE_CURSOR }),
  togglePause: () => ({ type: ActionType.TOGGLE_PAUSE }),
  setConfig: (config) => ({ type: ActionType.SET_CONFIG, payload: config }),
  setOriginalModes: (modes) => ({
    type: ActionType.SET_ORIGINAL_MODES,
    payload: modes,
  }),
  initFromStorage: () => ({ type: ActionType.INIT_FROM_STORAGE }),
};
