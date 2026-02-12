import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getShuffleTypeName,
  captureUIState,
  restoreUIState,
  createShuffleCommand,
  createToggleCommand,
  createThemeCommand,
} from '../js/commandFactory.js';

describe('commandFactory', () => {
  describe('getShuffleTypeName', () => {
    it('should return "All" for all shuffle', () => {
      expect(getShuffleTypeName({ all: true })).toBe('All');
    });

    it('should return "Appearance" for appearance shuffle', () => {
      expect(getShuffleTypeName({ appearance: true })).toBe('Appearance');
    });

    it('should return "Movement" for movement shuffle', () => {
      expect(getShuffleTypeName({ movement: true })).toBe('Movement');
    });

    it('should return "Interaction" for interaction shuffle', () => {
      expect(getShuffleTypeName({ interaction: true })).toBe('Interaction');
    });

    it('should return "Special FX" for fx shuffle', () => {
      expect(getShuffleTypeName({ fx: true })).toBe('Special FX');
    });

    it('should return "Configuration" for unknown shuffle', () => {
      expect(getShuffleTypeName({})).toBe('Configuration');
    });

    it('should prioritize "all" over other options', () => {
      expect(getShuffleTypeName({ all: true, appearance: true })).toBe('All');
    });
  });

  describe('captureUIState', () => {
    it('should capture all UI state properties', () => {
      const appState = {
        ui: {
          isGravityOn: true,
          areWallsOn: false,
          isCursorParticle: true,
        },
        particleState: {
          originalOutModes: { default: 'bounce' },
          originalInteractionModes: { hover: 'repulse' },
        },
      };

      const captured = captureUIState(appState);

      expect(captured.isGravityOn).toBe(true);
      expect(captured.areWallsOn).toBe(false);
      expect(captured.isCursorParticle).toBe(true);
      expect(captured.originalOutModes).toEqual({ default: 'bounce' });
      expect(captured.originalInteractionModes).toEqual({ hover: 'repulse' });
    });

    it('should handle null originalOutModes', () => {
      const appState = {
        ui: {
          isGravityOn: false,
          areWallsOn: false,
          isCursorParticle: false,
        },
        particleState: {
          originalOutModes: null,
          originalInteractionModes: {},
        },
      };

      const captured = captureUIState(appState);
      expect(captured.originalOutModes).toBe(null);
    });

    it('should create deep copies to prevent mutation', () => {
      const appState = {
        ui: {
          isGravityOn: false,
          areWallsOn: false,
          isCursorParticle: false,
        },
        particleState: {
          originalOutModes: { default: 'out' },
          originalInteractionModes: { hover: 'attract' },
        },
      };

      const captured = captureUIState(appState);
      appState.particleState.originalOutModes.default = 'changed';

      expect(captured.originalOutModes.default).toBe('out');
    });
  });

  describe('restoreUIState', () => {
    it('should restore all UI state properties', () => {
      const appState = {
        ui: {
          isGravityOn: false,
          areWallsOn: true,
          isCursorParticle: false,
        },
        particleState: {
          originalOutModes: {},
          originalInteractionModes: {},
        },
      };

      const uiState = {
        isGravityOn: true,
        areWallsOn: false,
        isCursorParticle: true,
        originalOutModes: { default: 'bounce' },
        originalInteractionModes: { hover: 'repulse' },
      };

      restoreUIState(appState, uiState);

      expect(appState.ui.isGravityOn).toBe(true);
      expect(appState.ui.areWallsOn).toBe(false);
      expect(appState.ui.isCursorParticle).toBe(true);
      expect(appState.particleState.originalOutModes).toEqual({
        default: 'bounce',
      });
      expect(appState.particleState.originalInteractionModes).toEqual({
        hover: 'repulse',
      });
    });

    it('should handle null originalOutModes by converting to empty object', () => {
      const appState = {
        ui: {},
        particleState: {
          originalOutModes: { existing: 'value' },
          originalInteractionModes: {},
        },
      };

      const uiState = {
        isGravityOn: false,
        areWallsOn: false,
        isCursorParticle: false,
        originalOutModes: null,
        originalInteractionModes: {},
      };

      restoreUIState(appState, uiState);

      expect(appState.particleState.originalOutModes).toEqual({});
    });
  });

  describe('createShuffleCommand', () => {
    let mockAppState;
    let mockUiManager;
    let mockBuildConfig;
    let mockLoadParticles;

    beforeEach(() => {
      mockAppState = {
        ui: {
          isGravityOn: false,
          areWallsOn: false,
          isCursorParticle: false,
        },
        particleState: {
          currentConfig: { particles: { number: { value: 50 } } },
          originalOutModes: null,
          originalInteractionModes: {},
        },
      };
      mockUiManager = {
        showToast: vi.fn(),
        announce: vi.fn(),
      };
      mockBuildConfig = vi
        .fn()
        .mockReturnValue({ particles: { number: { value: 100 } } });
      mockLoadParticles = vi.fn().mockResolvedValue(undefined);
    });

    it('should create a command with execute and undo methods', () => {
      const command = createShuffleCommand({
        shuffleOptions: { all: true },
        appState: mockAppState,
        uiManager: mockUiManager,
        buildConfig: mockBuildConfig,
        loadParticles: mockLoadParticles,
      });

      expect(command).toHaveProperty('execute');
      expect(command).toHaveProperty('undo');
      expect(typeof command.execute).toBe('function');
      expect(typeof command.undo).toBe('function');
    });

    it('should call buildConfig on first execute', async () => {
      const command = createShuffleCommand({
        shuffleOptions: { appearance: true },
        appState: mockAppState,
        uiManager: mockUiManager,
        buildConfig: mockBuildConfig,
        loadParticles: mockLoadParticles,
      });

      await command.execute();

      expect(mockBuildConfig).toHaveBeenCalledWith({ appearance: true });
      expect(mockLoadParticles).toHaveBeenCalled();
      expect(mockUiManager.announce).toHaveBeenCalledWith(
        'New scene generated.'
      );
    });

    it('should restore old state on undo', async () => {
      mockAppState.particleState.currentConfig = {
        particles: { number: { value: 25 } },
      };

      const command = createShuffleCommand({
        shuffleOptions: { all: true },
        appState: mockAppState,
        uiManager: mockUiManager,
        buildConfig: mockBuildConfig,
        loadParticles: mockLoadParticles,
      });

      await command.execute();
      mockLoadParticles.mockClear();
      await command.undo();

      expect(mockLoadParticles).toHaveBeenCalledWith({
        particles: { number: { value: 25 } },
      });
      expect(mockUiManager.showToast).toHaveBeenCalledWith('Undid All shuffle');
    });

    it('should show redo message on second execute', async () => {
      const command = createShuffleCommand({
        shuffleOptions: { movement: true },
        appState: mockAppState,
        uiManager: mockUiManager,
        buildConfig: mockBuildConfig,
        loadParticles: mockLoadParticles,
      });

      await command.execute();
      await command.undo();
      mockUiManager.showToast.mockClear();
      await command.execute();

      expect(mockUiManager.showToast).toHaveBeenCalledWith(
        'Redid Movement shuffle'
      );
    });
  });

  describe('createToggleCommand', () => {
    let mockAppState;
    let mockUiManager;
    let mockApplyFn;

    beforeEach(() => {
      mockAppState = {
        ui: {
          isGravityOn: false,
        },
      };
      mockUiManager = {
        announce: vi.fn(),
      };
      mockApplyFn = vi.fn().mockResolvedValue(undefined);
    });

    it('should toggle the state key on execute', async () => {
      const command = createToggleCommand({
        stateKey: 'isGravityOn',
        appState: mockAppState,
        uiManager: mockUiManager,
        applyFn: mockApplyFn,
      });

      await command.execute();

      expect(mockAppState.ui.isGravityOn).toBe(true);
      expect(mockApplyFn).toHaveBeenCalled();
    });

    it('should toggle back on undo (self-inverse)', async () => {
      const command = createToggleCommand({
        stateKey: 'isGravityOn',
        appState: mockAppState,
        uiManager: mockUiManager,
        applyFn: mockApplyFn,
      });

      await command.execute();
      expect(mockAppState.ui.isGravityOn).toBe(true);

      await command.undo();
      expect(mockAppState.ui.isGravityOn).toBe(false);
    });

    it('should announce the toggle state', async () => {
      const command = createToggleCommand({
        stateKey: 'isGravityOn',
        appState: mockAppState,
        uiManager: mockUiManager,
        applyFn: mockApplyFn,
      });

      await command.execute();

      expect(mockUiManager.announce).toHaveBeenCalledWith('Gravity enabled');
    });

    it('should format state key name for announcement', async () => {
      mockAppState.ui.isCursorParticle = false;
      const command = createToggleCommand({
        stateKey: 'isCursorParticle',
        appState: mockAppState,
        uiManager: mockUiManager,
        applyFn: mockApplyFn,
      });

      await command.execute();

      expect(mockUiManager.announce).toHaveBeenCalledWith('Cursor enabled');
    });
  });

  describe('createThemeCommand', () => {
    it('should call updateTheme on execute', async () => {
      const mockUpdateTheme = vi.fn().mockResolvedValue(undefined);
      const command = createThemeCommand({ updateTheme: mockUpdateTheme });

      await command.execute();

      expect(mockUpdateTheme).toHaveBeenCalled();
    });

    it('should call updateTheme on undo (theme toggle is self-inverse)', async () => {
      const mockUpdateTheme = vi.fn().mockResolvedValue(undefined);
      const command = createThemeCommand({ updateTheme: mockUpdateTheme });

      await command.undo();

      expect(mockUpdateTheme).toHaveBeenCalled();
    });
  });
});
