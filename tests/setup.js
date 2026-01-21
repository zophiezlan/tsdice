// Test setup file for Vitest
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock;

  // Mock console.warn and console.error to reduce noise in tests
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
  };
});
