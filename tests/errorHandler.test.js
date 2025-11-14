import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler, ErrorType } from '../js/errorHandler.js';

// Mock UIManager
vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    showToast: vi.fn(),
    announce: vi.fn(),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('handle', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');
      const consoleSpy = vi.spyOn(console, 'error');

      ErrorHandler.handle(error, ErrorType.UNKNOWN);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[UNKNOWN]',
        error,
        expect.any(Object)
      );
    });

    it('should show user-friendly toast message', async () => {
      const { UIManager } = await import('../js/uiManager.js');
      const error = new Error('Test error');

      ErrorHandler.handle(error, ErrorType.CONFIG_INVALID);

      expect(UIManager.showToast).toHaveBeenCalled();
      expect(UIManager.announce).toHaveBeenCalled();
    });

    it('should return false for non-recoverable errors', () => {
      const error = new Error('Library load failed');
      const isRecoverable = ErrorHandler.handle(error, ErrorType.LIBRARY_LOAD);

      expect(isRecoverable).toBe(false);
    });

    it('should return true for recoverable errors', () => {
      const error = new Error('Config invalid');
      const isRecoverable = ErrorHandler.handle(
        error,
        ErrorType.CONFIG_INVALID
      );

      expect(isRecoverable).toBe(true);
    });

    it('should handle unknown error types', () => {
      const error = new Error('Unknown error');
      const isRecoverable = ErrorHandler.handle(error, 'NONEXISTENT_TYPE');

      expect(isRecoverable).toBe(true); // Defaults to UNKNOWN which is recoverable
    });
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      const validConfig = {
        particles: { number: { value: 50 } },
        interactivity: { events: {} },
      };

      expect(ErrorHandler.validateConfig(validConfig)).toBe(true);
    });

    it('should return false for null config', () => {
      expect(ErrorHandler.validateConfig(null)).toBe(false);
    });

    it('should return false for non-object config', () => {
      expect(ErrorHandler.validateConfig('string')).toBe(false);
      expect(ErrorHandler.validateConfig(123)).toBe(false);
      expect(ErrorHandler.validateConfig([])).toBe(false);
    });

    it('should return false for config missing particles', () => {
      const invalidConfig = {
        interactivity: { events: {} },
      };

      expect(ErrorHandler.validateConfig(invalidConfig)).toBe(false);
    });

    it('should return false for config missing interactivity', () => {
      const invalidConfig = {
        particles: { number: { value: 50 } },
      };

      expect(ErrorHandler.validateConfig(invalidConfig)).toBe(false);
    });
  });

  describe('wrap', () => {
    it('should wrap async function with error handling', async () => {
      const successFn = vi.fn(async () => 'success');
      const wrapped = ErrorHandler.wrap(successFn, ErrorType.UNKNOWN);

      const result = await wrapped();

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalled();
    });

    it('should handle errors in wrapped function', async () => {
      const errorFn = vi.fn(async () => {
        throw new Error('Wrapped error');
      });
      const wrapped = ErrorHandler.wrap(errorFn, ErrorType.CONFIG_INVALID);

      const result = await wrapped('arg1', 'arg2');

      expect(result).toBeNull(); // Returns null on recoverable error
      expect(errorFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should re-throw non-recoverable errors', async () => {
      const fatalErrorFn = vi.fn(async () => {
        throw new Error('Fatal error');
      });
      const wrapped = ErrorHandler.wrap(fatalErrorFn, ErrorType.LIBRARY_LOAD);

      await expect(wrapped()).rejects.toThrow('Fatal error');
    });
  });

  describe('ErrorType enum', () => {
    it('should have all expected error types', () => {
      expect(ErrorType.LIBRARY_LOAD).toBeDefined();
      expect(ErrorType.CONFIG_INVALID).toBeDefined();
      expect(ErrorType.PARTICLES_LOAD).toBeDefined();
      expect(ErrorType.SHARE_FAILED).toBeDefined();
      expect(ErrorType.STORAGE_ERROR).toBeDefined();
      expect(ErrorType.NETWORK_ERROR).toBeDefined();
      expect(ErrorType.UNKNOWN).toBeDefined();
    });
  });
});
