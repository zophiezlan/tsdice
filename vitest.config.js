import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        lines: 65,
        statements: 63,
        functions: 70,
        branches: 55,
      },
      exclude: [
        'node_modules/**',
        'js/main.js', // Integration/orchestration file
        'js/constants.js', // Data file
        'tests/setup.js', // Test setup file
      ],
    },
  },
});
