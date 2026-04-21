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
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
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
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      // Additional rules for code quality
      curly: ['error', 'multi-line'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-coercion': ['warn', { allow: ['!!'] }],
      'no-throw-literal': 'error',
      'no-return-await': 'error',
      'require-await': 'error',
      'no-param-reassign': ['warn', { props: false }],
      'no-else-return': 'warn',
      'object-shorthand': ['warn', 'always'],
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'no-useless-return': 'warn',
      // Stricter correctness rules
      'no-promise-executor-return': 'error',
      'no-unreachable-loop': 'error',
      'no-self-compare': 'error',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-await-in-loop': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'build/**'],
  },
];
