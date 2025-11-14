import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'js/main.js', // Integration/orchestration file
        'js/constants.js', // Data file
        'tests/setup.js', // Test setup file
      ]
    }
  }
});
