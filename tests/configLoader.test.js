import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compressToEncodedURIComponent } from 'lz-string';

vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    syncUI: vi.fn(),
    announce: vi.fn(),
    showToast: vi.fn(),
  },
}));

vi.mock('../js/storage.js', () => ({
  SafeStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import {
  loadConfigFromHash,
  restoreSavedToggleState,
} from '../js/configLoader.js';
import { AppState } from '../js/state.js';
import { SafeStorage } from '../js/storage.js';
import { StateManager } from '../js/stateManager.js';

const sceneConfig = () => ({
  particles: { move: { outModes: { default: 'bounce' } } },
  interactivity: { events: { onHover: { mode: 'trail' } } },
});

const setHash = (payload) => {
  window.history.replaceState(null, '', `/?x=1#config=${payload}`);
};

describe('configLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    StateManager.cancelPendingPersist();
    AppState.ui.isGravityOn = false;
    AppState.ui.areWallsOn = false;
    AppState.ui.isCursorParticle = false;
    AppState.particleState.originalOutModes = {};
    AppState.particleState.originalInteractionModes = {};
    AppState.particleState.initialConfigFromUrl = null;
  });

  describe('loadConfigFromHash', () => {
    it('applies uiState, including the hover mode the cursor replaced', () => {
      const config = sceneConfig();
      config.uiState = {
        chaosLevel: 7,
        isDarkMode: false,
        isCursorParticle: true,
        isGravityOn: true,
        areWallsOn: true,
        originalOutModes: { default: 'out' },
        originalHoverMode: 'grab',
      };
      setHash(compressToEncodedURIComponent(JSON.stringify(config)));

      expect(loadConfigFromHash()).toBe(true);
      expect(AppState.ui.isCursorParticle).toBe(true);
      expect(AppState.ui.isGravityOn).toBe(true);
      expect(AppState.ui.areWallsOn).toBe(true);
      expect(AppState.ui.isDarkMode).toBe(false);
      expect(AppState.particleState.chaosLevel).toBe(7);
      expect(AppState.particleState.originalOutModes).toEqual({
        default: 'out',
      });
      expect(AppState.particleState.originalInteractionModes.hover).toBe(
        'grab'
      );
      expect(AppState.particleState.initialConfigFromUrl.uiState).toBe(
        undefined
      );
      expect(window.location.hash).toBe('');
    });

    it('clears a bad link without leaving a stray "#"', () => {
      setHash('not-a-valid-payload');
      const replaceSpy = vi.spyOn(window.history, 'replaceState');

      expect(loadConfigFromHash()).toBe(false);
      // `location.hash = ''` would leave "…?x=1#" in the address bar
      expect(replaceSpy).toHaveBeenCalledWith(null, '', '/?x=1');
      expect(window.location.hash).toBe('');
      expect(window.location.search).toBe('?x=1');
    });
  });

  describe('restoreSavedToggleState', () => {
    it('restores toggles and the modes they replaced', () => {
      SafeStorage.getItem.mockReturnValue(
        JSON.stringify({
          isGravityOn: true,
          areWallsOn: true,
          isCursorParticle: true,
          originalOutModes: { default: 'out' },
          originalInteractionModes: { hover: 'bubble' },
        })
      );

      restoreSavedToggleState();

      expect(SafeStorage.getItem).toHaveBeenCalledWith('tsDiceToggleState');
      expect(AppState.ui.isGravityOn).toBe(true);
      expect(AppState.ui.areWallsOn).toBe(true);
      expect(AppState.ui.isCursorParticle).toBe(true);
      expect(AppState.particleState.originalOutModes).toEqual({
        default: 'out',
      });
      expect(AppState.particleState.originalInteractionModes).toEqual({
        hover: 'bubble',
      });
    });

    it('leaves defaults alone when nothing was saved', () => {
      SafeStorage.getItem.mockReturnValue(null);
      restoreSavedToggleState();
      expect(AppState.ui.isGravityOn).toBe(false);
      expect(AppState.ui.areWallsOn).toBe(false);
      expect(AppState.ui.isCursorParticle).toBe(false);
    });

    it('discards malformed saved toggles', () => {
      SafeStorage.getItem.mockReturnValue('{not json');
      restoreSavedToggleState();
      expect(SafeStorage.removeItem).toHaveBeenCalledWith('tsDiceToggleState');
      expect(AppState.ui.isGravityOn).toBe(false);
    });
  });
});
