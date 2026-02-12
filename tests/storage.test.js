import { describe, it, expect, beforeEach } from 'vitest';
import { SafeStorage } from '../js/storage.js';

describe('SafeStorage', () => {
  beforeEach(() => {
    // Clear the fallback store between tests
    SafeStorage.clearFallback();
    // Reset localStorage mock
    if (global.localStorage) {
      global.localStorage.getItem.mockReset();
      global.localStorage.setItem.mockReset();
      global.localStorage.removeItem.mockReset();
    }
  });

  describe('getItem', () => {
    it('should retrieve item from localStorage when available', () => {
      global.localStorage.getItem.mockReturnValue('testValue');
      const result = SafeStorage.getItem('testKey');
      expect(result).toBe('testValue');
      expect(global.localStorage.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should return null for non-existent keys', () => {
      global.localStorage.getItem.mockReturnValue(null);
      const result = SafeStorage.getItem('nonExistent');
      expect(result).toBe(null);
    });

    it('should fall back to Map store when localStorage.getItem throws', () => {
      // Force setItem to use fallback by making localStorage throw
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });

      // Set a value - this will go to fallback store
      SafeStorage.setItem('fallbackKey', 'fallbackValue');

      // Now make getItem also throw to force fallback read
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });

      // Now get should use fallback
      const result = SafeStorage.getItem('fallbackKey');
      expect(result).toBe('fallbackValue');
    });

    it('should return null from fallback store for non-existent keys', () => {
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });

      const result = SafeStorage.getItem('nonExistent');
      expect(result).toBe(null);
    });
  });

  describe('setItem', () => {
    it('should set item in localStorage when available', () => {
      const result = SafeStorage.setItem('testKey', 'testValue');
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        'testValue'
      );
    });

    it('should fall back to Map store when localStorage.setItem throws', () => {
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      const result = SafeStorage.setItem('fallbackKey', 'fallbackValue');
      expect(result).toBe(false); // Returns false when using fallback

      // Verify value is stored in fallback
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      expect(SafeStorage.getItem('fallbackKey')).toBe('fallbackValue');
    });

    it('should delete from fallback when successfully writing to localStorage', () => {
      // First, force a value into fallback
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      SafeStorage.setItem('testKey', 'initialValue');

      // Now enable localStorage and set again
      global.localStorage.setItem.mockReset();
      SafeStorage.setItem('testKey', 'newValue');

      // Force fallback read - should not have the old value
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      // The fallback should be cleared, so getItem should return null
      const result = SafeStorage.getItem('testKey');
      expect(result).toBe(null);
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage when available', () => {
      SafeStorage.removeItem('testKey');
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('should remove item from fallback store when localStorage throws', () => {
      // First set a value in fallback
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      SafeStorage.setItem('fallbackKey', 'value');

      // Now remove it
      global.localStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      SafeStorage.removeItem('fallbackKey');

      // Verify it's gone from fallback
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      expect(SafeStorage.getItem('fallbackKey')).toBe(null);
    });

    it('should remove from both localStorage and fallback', () => {
      // Set in fallback
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      SafeStorage.setItem('testKey', 'value');

      // Re-enable localStorage for remove
      global.localStorage.removeItem.mockReset();
      SafeStorage.removeItem('testKey');

      // Verify localStorage.removeItem was called
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('testKey');
    });
  });

  describe('usingFallback', () => {
    it('should return false when localStorage is available', () => {
      expect(SafeStorage.usingFallback()).toBe(false);
    });

    it('should return true when localStorage is not available', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      // Also need to handle window.localStorage
      const originalWindow = global.window;
      global.window = {};

      expect(SafeStorage.usingFallback()).toBe(true);

      // Restore
      global.localStorage = originalLocalStorage;
      global.window = originalWindow;
    });
  });

  describe('clearFallback', () => {
    it('should clear all items from fallback store', () => {
      // Add items to fallback
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      SafeStorage.setItem('key1', 'value1');
      SafeStorage.setItem('key2', 'value2');

      // Clear fallback
      SafeStorage.clearFallback();

      // Verify items are gone
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage blocked');
      });
      expect(SafeStorage.getItem('key1')).toBe(null);
      expect(SafeStorage.getItem('key2')).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      delete global.window;

      // Should not throw
      expect(() => SafeStorage.getItem('test')).not.toThrow();
      expect(() => SafeStorage.setItem('test', 'value')).not.toThrow();
      expect(() => SafeStorage.removeItem('test')).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle null values', () => {
      global.localStorage.getItem.mockReturnValue(null);
      expect(SafeStorage.getItem('nullKey')).toBe(null);
    });

    it('should handle empty string values', () => {
      global.localStorage.getItem.mockReturnValue('');
      expect(SafeStorage.getItem('emptyKey')).toBe('');
    });

    it('should handle JSON string values', () => {
      const jsonValue = JSON.stringify({ key: 'value' });
      global.localStorage.getItem.mockReturnValue(jsonValue);
      expect(SafeStorage.getItem('jsonKey')).toBe(jsonValue);
    });
  });
});
