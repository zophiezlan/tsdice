import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRandomInRange,
  getRandomBool,
  getRandomItem,
  getChaosProbability,
  debounce,
  copyToClipboard,
} from '../js/utils.js';

describe('utils', () => {
  describe('getRandomInRange', () => {
    it('should return a number within the specified range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInRange(10, 20);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(20);
      }
    });

    it('should work with negative numbers', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInRange(-50, -10);
        expect(result).toBeGreaterThanOrEqual(-50);
        expect(result).toBeLessThanOrEqual(-10);
      }
    });

    it('should work when min equals max', () => {
      const result = getRandomInRange(5, 5);
      expect(result).toBe(5);
    });
  });

  describe('getRandomBool', () => {
    it('should return a boolean', () => {
      const result = getRandomBool();
      expect(typeof result).toBe('boolean');
    });

    it('should return true more often with higher probability', () => {
      let trueCount = 0;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        if (getRandomBool(0.8)) trueCount++;
      }

      // With probability 0.8, we expect roughly 80% true values
      // Allow some variance (70% to 90%)
      const ratio = trueCount / iterations;
      expect(ratio).toBeGreaterThan(0.7);
      expect(ratio).toBeLessThan(0.9);
    });

    it('should return false more often with lower probability', () => {
      let trueCount = 0;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        if (getRandomBool(0.2)) trueCount++;
      }

      // With probability 0.2, we expect roughly 20% true values
      // Allow some variance (10% to 30%)
      const ratio = trueCount / iterations;
      expect(ratio).toBeGreaterThan(0.1);
      expect(ratio).toBeLessThan(0.3);
    });

    it('should default to 50% probability', () => {
      let trueCount = 0;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        if (getRandomBool()) trueCount++;
      }

      // With default 0.5 probability, expect roughly 50% true values
      // Allow variance (40% to 60%)
      const ratio = trueCount / iterations;
      expect(ratio).toBeGreaterThan(0.4);
      expect(ratio).toBeLessThan(0.6);
    });
  });

  describe('getRandomItem', () => {
    it('should return an item from the array', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = getRandomItem(arr);
      expect(arr).toContain(result);
    });

    it('should work with different types', () => {
      const arr = ['a', 'b', 'c'];
      const result = getRandomItem(arr);
      expect(arr).toContain(result);
    });

    it('should return the only item from a single-item array', () => {
      const arr = [42];
      const result = getRandomItem(arr);
      expect(result).toBe(42);
    });

    it('should cover all items given enough iterations', () => {
      const arr = [1, 2, 3, 4, 5];
      const found = new Set();

      // Run enough times to statistically cover all items
      for (let i = 0; i < 100; i++) {
        found.add(getRandomItem(arr));
      }

      expect(found.size).toBe(5);
    });
  });

  describe('getChaosProbability', () => {
    it('should scale probability based on chaos level', () => {
      // At chaos level 5, probability should equal base probability
      expect(getChaosProbability(0.5, 5)).toBe(0.5);

      // At chaos level 10, probability should be doubled (but capped at 1)
      expect(getChaosProbability(0.5, 10)).toBe(1);

      // At chaos level 1, probability should be 1/5 of base
      expect(getChaosProbability(0.5, 1)).toBe(0.1);
    });

    it('should cap probability at 1.0', () => {
      // Even with high chaos and high base probability, should not exceed 1
      expect(getChaosProbability(0.9, 10)).toBe(1);
      expect(getChaosProbability(1.0, 10)).toBe(1);
    });

    it('should work with different base probabilities', () => {
      expect(getChaosProbability(0.2, 5)).toBe(0.2);
      expect(getChaosProbability(0.8, 5)).toBe(0.8);
    });

    it('should increase linearly with chaos level', () => {
      const baseProb = 0.5;

      const prob1 = getChaosProbability(baseProb, 1);
      const prob2 = getChaosProbability(baseProb, 2);
      const prob5 = getChaosProbability(baseProb, 5);
      const prob8 = getChaosProbability(baseProb, 8);

      expect(prob2).toBeGreaterThan(prob1);
      expect(prob5).toBeGreaterThan(prob2);
      expect(prob8).toBeGreaterThan(prob5);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should delay function execution', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(99);
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(func).toHaveBeenCalledOnce();
    });

    it('should reset timer on multiple calls', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      vi.advanceTimersByTime(50);
      debouncedFunc();
      vi.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledOnce();
    });

    it('should pass arguments correctly', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('arg1', 'arg2', 42);
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('arg1', 'arg2', 42);
    });

    it('should only call function once within wait period', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledOnce();
    });
  });

  describe('copyToClipboard', () => {
    let originalNavigator;
    let originalDocument;

    beforeEach(() => {
      originalNavigator = global.navigator;
      originalDocument = global.document;

      // Setup document mock
      global.document = {
        createElement: vi.fn(() => ({
          value: '',
          style: {},
          focus: vi.fn(),
          select: vi.fn(),
        })),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
        execCommand: vi.fn(() => true),
      };
    });

    afterEach(() => {
      global.navigator = originalNavigator;
      global.document = originalDocument;
    });

    it('should use navigator.clipboard when available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      global.navigator = {
        clipboard: {
          writeText: writeTextMock,
        },
      };

      await copyToClipboard('test text');

      expect(writeTextMock).toHaveBeenCalledWith('test text');
    });

    it('should use fallback textarea method when clipboard API fails', async () => {
      // Make clipboard API fail
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
        },
      };

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      global.document.createElement = vi.fn(() => mockTextArea);

      await copyToClipboard('fallback text');

      expect(global.document.createElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('fallback text');
      expect(mockTextArea.focus).toHaveBeenCalled();
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      expect(global.document.body.appendChild).toHaveBeenCalledWith(
        mockTextArea
      );
      expect(global.document.body.removeChild).toHaveBeenCalledWith(
        mockTextArea
      );
    });

    it('should use fallback when navigator.clipboard is undefined', async () => {
      global.navigator = {};

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      global.document.createElement = vi.fn(() => mockTextArea);

      await copyToClipboard('no clipboard API');

      expect(global.document.createElement).toHaveBeenCalledWith('textarea');
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should position textarea off-screen', async () => {
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
        },
      };

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      global.document.createElement = vi.fn(() => mockTextArea);

      await copyToClipboard('test');

      expect(mockTextArea.style.position).toBe('fixed');
      expect(mockTextArea.style.top).toBe('-9999px');
    });

    it('should handle execCommand failure gracefully', async () => {
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
        },
      };

      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      global.document.createElement = vi.fn(() => mockTextArea);
      global.document.execCommand = vi.fn(() => {
        throw new Error('execCommand failed');
      });

      // Should not throw
      await expect(copyToClipboard('test')).resolves.not.toThrow();

      // Should still clean up
      expect(global.document.body.removeChild).toHaveBeenCalledWith(
        mockTextArea
      );
    });
  });
});
