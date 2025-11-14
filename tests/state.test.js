import { describe, it, expect } from 'vitest';
import { AppState } from '../js/state.js';

describe('AppState', () => {
  describe('structure', () => {
    it('should have ui namespace', () => {
      expect(AppState).toHaveProperty('ui');
      expect(typeof AppState.ui).toBe('object');
    });

    it('should have particleState namespace', () => {
      expect(AppState).toHaveProperty('particleState');
      expect(typeof AppState.particleState).toBe('object');
    });
  });

  describe('ui namespace', () => {
    it('should have isDarkMode property with default true', () => {
      expect(AppState.ui).toHaveProperty('isDarkMode');
      expect(AppState.ui.isDarkMode).toBe(true);
    });

    it('should have isCursorParticle property with default false', () => {
      expect(AppState.ui).toHaveProperty('isCursorParticle');
      expect(AppState.ui.isCursorParticle).toBe(false);
    });

    it('should have isGravityOn property with default false', () => {
      expect(AppState.ui).toHaveProperty('isGravityOn');
      expect(AppState.ui.isGravityOn).toBe(false);
    });

    it('should have areWallsOn property with default false', () => {
      expect(AppState.ui).toHaveProperty('areWallsOn');
      expect(AppState.ui.areWallsOn).toBe(false);
    });

    it('should have isPaused property with default false', () => {
      expect(AppState.ui).toHaveProperty('isPaused');
      expect(AppState.ui.isPaused).toBe(false);
    });

    it('should have lastFocusedElement property with default null', () => {
      expect(AppState.ui).toHaveProperty('lastFocusedElement');
      expect(AppState.ui.lastFocusedElement).toBe(null);
    });

    it('should have particlesContainer property with default null', () => {
      expect(AppState.ui).toHaveProperty('particlesContainer');
      expect(AppState.ui.particlesContainer).toBe(null);
    });
  });

  describe('particleState namespace', () => {
    it('should have chaosLevel property with default 5', () => {
      expect(AppState.particleState).toHaveProperty('chaosLevel');
      expect(AppState.particleState.chaosLevel).toBe(5);
    });

    it('should have currentConfig property with default empty object', () => {
      expect(AppState.particleState).toHaveProperty('currentConfig');
      expect(typeof AppState.particleState.currentConfig).toBe('object');
    });

    it('should have originalInteractionModes property with default empty object', () => {
      expect(AppState.particleState).toHaveProperty('originalInteractionModes');
      expect(typeof AppState.particleState.originalInteractionModes).toBe('object');
    });

    it('should have originalOutModes property with default empty object', () => {
      expect(AppState.particleState).toHaveProperty('originalOutModes');
      expect(typeof AppState.particleState.originalOutModes).toBe('object');
    });

    it('should have initialConfigFromUrl property with default null', () => {
      expect(AppState.particleState).toHaveProperty('initialConfigFromUrl');
      expect(AppState.particleState.initialConfigFromUrl).toBe(null);
    });
  });

  describe('mutability', () => {
    it('should allow state modifications', () => {
      const originalValue = AppState.ui.isDarkMode;
      AppState.ui.isDarkMode = !originalValue;
      expect(AppState.ui.isDarkMode).toBe(!originalValue);
      // Restore original value
      AppState.ui.isDarkMode = originalValue;
    });

    it('should allow chaos level changes', () => {
      const originalValue = AppState.particleState.chaosLevel;
      AppState.particleState.chaosLevel = 10;
      expect(AppState.particleState.chaosLevel).toBe(10);
      // Restore original value
      AppState.particleState.chaosLevel = originalValue;
    });
  });
});
