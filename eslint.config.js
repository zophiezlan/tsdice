import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        structuredClone: 'readonly',
        URLSearchParams: 'readonly',
        Event: 'readonly',
        LZString: 'readonly',
        AbortController: 'readonly',
        performance: 'readonly',
        // Node globals for tests
        process: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        global: 'writable', // Node global object used in tests
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      // Additional rules for code quality
      curly: ['warn', 'multi-line'], // Require braces for multi-line blocks
      eqeqeq: ['error', 'always', { null: 'ignore' }], // Require === except for null
      'no-implicit-coercion': ['warn', { allow: ['!!'] }], // Warn on implicit type coercion
      'no-throw-literal': 'error', // Require throwing Error objects
      'no-return-await': 'warn', // Disallow unnecessary return await
      'require-await': 'warn', // Warn on async functions without await
      'no-param-reassign': ['warn', { props: false }], // Warn on parameter reassignment
      'no-else-return': 'warn', // Prefer early returns
      'object-shorthand': ['warn', 'always'], // Prefer {x} over {x: x}
      'prefer-template': 'warn', // Prefer template literals over concatenation
      'prefer-arrow-callback': 'warn', // Prefer arrow functions as callbacks
      'no-useless-return': 'warn', // Disallow unnecessary return statements
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'build/**'],
  },
];
