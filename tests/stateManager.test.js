import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager, Actions, ActionType } from '../js/stateManager.js';
import { AppState } from '../js/state.js';

// Mock UIManager
vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    syncUI: vi.fn(),
    showToast: vi.fn(),
    announce: vi.fn(),
  },
}));

// Mock ErrorHandler
vi.mock('../js/errorHandler.js', () => ({
  ErrorHandler: {
    handle: vi.fn(),
    validateConfig: vi.fn((config) => {
      return config && config.particles && config.interactivity;
    }),
  },
  ErrorType: {
    UNKNOWN: 'UNKNOWN',
    STORAGE_ERROR: 'STORAGE_ERROR',
  },
}));

describe('StateManager', () => {
  beforeEach(() => {
    // Reset AppState
    AppState.ui.isDarkMode = true;
    AppState.ui.isCursorParticle = false;
    AppState.ui.isGravityOn = false;
    AppState.ui.areWallsOn = false;
    AppState.ui.isPaused = false;
    AppState.particleState.chaosLevel = 5;
    AppState.particleState.currentConfig = {};
    AppState.particleState.originalInteractionModes = {};
    AppState.particleState.originalOutModes = {};

    // Clear mocks
    vi.clearAllMocks();

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  describe('dispatch', () => {
    it('should dispatch SET_THEME action', () => {
      const action = Actions.setTheme(false);
      const result = StateManager.dispatch(action);

      expect(result).toBe(true);
      expect(AppState.ui.isDarkMode).toBe(false);
    });

    it('should dispatch SET_CHAOS_LEVEL action', () => {
      const action = Actions.setChaosLevel(8);
      const result = StateManager.dispatch(action);

      expect(result).toBe(true);
      expect(AppState.particleState.chaosLevel).toBe(8);
    });

    it('should clamp chaos level to valid range', () => {
      StateManager.dispatch(Actions.setChaosLevel(15));
      expect(AppState.particleState.chaosLevel).toBe(10);

      StateManager.dispatch(Actions.setChaosLevel(-5));
      expect(AppState.particleState.chaosLevel).toBe(1);
    });

    it('should dispatch TOGGLE_GRAVITY action', () => {
      const initialState = AppState.ui.isGravityOn;
      StateManager.dispatch(Actions.toggleGravity());

      expect(AppState.ui.isGravityOn).toBe(!initialState);
    });

    it('should dispatch TOGGLE_WALLS action', () => {
      const initialState = AppState.ui.areWallsOn;
      StateManager.dispatch(Actions.toggleWalls());

      expect(AppState.ui.areWallsOn).toBe(!initialState);
    });

    it('should dispatch TOGGLE_CURSOR action', () => {
      const initialState = AppState.ui.isCursorParticle;
      StateManager.dispatch(Actions.toggleCursor());

      expect(AppState.ui.isCursorParticle).toBe(!initialState);
    });

    it('should dispatch TOGGLE_PAUSE action', () => {
      const initialState = AppState.ui.isPaused;
      StateManager.dispatch(Actions.togglePause());

      expect(AppState.ui.isPaused).toBe(!initialState);
    });

    it('should dispatch SET_CONFIG action', () => {
      const config = {
        particles: { number: { value: 50 } },
        interactivity: { events: {} },
      };
      const action = Actions.setConfig(config);
      const result = StateManager.dispatch(action);

      expect(result).toBe(true);
      expect(AppState.particleState.currentConfig).toEqual(config);
    });

    it('should handle unknown action type', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = StateManager.dispatch({ type: 'UNKNOWN_ACTION' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unknown action type: UNKNOWN_ACTION'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getState', () => {
    it('should return a copy of the state', () => {
      const state = StateManager.getState();

      expect(state).toEqual(AppState);
      expect(state).not.toBe(AppState); // Not the same reference
    });

    it('should return deep copy (not shallow)', () => {
      const state = StateManager.getState();
      state.ui.isDarkMode = !state.ui.isDarkMode;

      expect(state.ui.isDarkMode).not.toBe(AppState.ui.isDarkMode);
    });
  });

  describe('persist', () => {
    it('should persist theme to localStorage', () => {
      AppState.ui.isDarkMode = false;
      StateManager.persist();

      expect(localStorage.setItem).toHaveBeenCalledWith('tsDiceTheme', 'light');
    });

    it('should persist chaos level to localStorage', () => {
      AppState.particleState.chaosLevel = 7;
      StateManager.persist();

      expect(localStorage.setItem).toHaveBeenCalledWith('tsDiceChaos', '7');
    });

    it('should persist config to localStorage', () => {
      AppState.particleState.currentConfig = {
        particles: { number: { value: 50 } },
        interactivity: { events: {} },
      };
      StateManager.persist();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tsDiceLastConfig',
        expect.any(String)
      );
    });

    it('should not persist empty config', () => {
      AppState.particleState.currentConfig = {};
      StateManager.persist();

      const configCalls = vi
        .mocked(localStorage.setItem)
        .mock.calls.filter((call) => call[0] === 'tsDiceLastConfig');

      expect(configCalls.length).toBe(0);
    });
  });

  describe('validate', () => {
    it('should return true for valid state', () => {
      expect(StateManager.validate()).toBe(true);
    });

    it('should return false for invalid boolean values', () => {
      AppState.ui.isDarkMode = 'true'; // Should be boolean
      expect(StateManager.validate()).toBe(false);
    });

    it('should return false for invalid chaos level type', () => {
      AppState.particleState.chaosLevel = '5'; // Should be number
      expect(StateManager.validate()).toBe(false);
    });

    it('should return false for out-of-range chaos level', () => {
      AppState.particleState.chaosLevel = 15;
      expect(StateManager.validate()).toBe(false);

      AppState.particleState.chaosLevel = 0;
      expect(StateManager.validate()).toBe(false);
    });
  });

  describe('Action creators', () => {
    it('should create SET_THEME action', () => {
      const action = Actions.setTheme(false);
      expect(action).toEqual({
        type: ActionType.SET_THEME,
        payload: false,
      });
    });

    it('should create SET_CHAOS_LEVEL action', () => {
      const action = Actions.setChaosLevel(7);
      expect(action).toEqual({
        type: ActionType.SET_CHAOS_LEVEL,
        payload: 7,
      });
    });

    it('should create TOGGLE_GRAVITY action', () => {
      const action = Actions.toggleGravity();
      expect(action).toEqual({
        type: ActionType.TOGGLE_GRAVITY,
      });
    });

    it('should create SET_CONFIG action', () => {
      const config = { particles: {}, interactivity: {} };
      const action = Actions.setConfig(config);
      expect(action).toEqual({
        type: ActionType.SET_CONFIG,
        payload: config,
      });
    });
  });
});
