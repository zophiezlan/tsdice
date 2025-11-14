# tsDice Test Suite

This directory contains automated tests for the tsDice project, bringing it from a hobby project to professional-grade quality.

## Test Framework

We use **[Vitest](https://vitest.dev/)** as our test framework because:

- Fast and modern
- Native ES modules support
- Compatible with our existing codebase
- Excellent developer experience

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### `commandManager.test.js` (13 tests)

Tests the undo/redo command pattern implementation, including:

- Command execution and history tracking
- Infinite undo/redo support (no 20-step limit)
- Command deduplication logic
- Undo/redo workflow scenarios

### `utils.test.js` (19 tests)

Tests pure utility functions:

- Random number generation (`getRandomInRange`)
- Random boolean generation (`getRandomBool`)
- Random array item selection (`getRandomItem`)
- Chaos probability calculation (`getChaosProbability`)
- Debouncing function (`debounce`)
- Clipboard operations (`copyToClipboard`)

### `state.test.js` (16 tests)

Tests the application state structure:

- State object schema validation
- Default values verification
- State mutability tests
- UI state properties
- Particle state properties

### `configGenerator.test.js` (26 tests)

Tests particle configuration generation:

- Appearance generation (colors, shapes, sizes)
- Movement generation (speed, direction, trails)
- Interaction generation (hover, click modes)
- Special FX generation (collisions, wobble, links)
- Chaos level effects on configurations

### `errorHandler.test.js` (14 tests) _Phase 2_

Tests centralized error handling:

- Error type classification
- Error message display
- Config validation
- Async function wrapping
- Recovery vs. fatal error handling

### `stateManager.test.js` (23 tests) _Phase 2_

Tests state management with dispatch pattern:

- Action dispatching for all action types
- Action creators
- State validation
- localStorage persistence
- Immutable state snapshots

## Coverage Statistics

**Total: 111 tests with 84% coverage**

Current coverage includes:

- ✅ Core business logic (commandManager, utils)
- ✅ State management (AppState, StateManager)
- ✅ Error handling (ErrorHandler)
- ✅ Configuration generation (configGenerator)
- ⏭️ UI interactions (future: E2E tests with Playwright)
- ⏭️ Integration with tsParticles (future)

## Writing New Tests

When adding new tests, follow these conventions:

1. **File naming**: `[module-name].test.js`
2. **Structure**: Use `describe` blocks to group related tests
3. **Assertions**: Use clear, descriptive `expect` statements
4. **Mocking**: Mock external dependencies using `vi.mock()`
5. **Isolation**: Reset state between tests using `beforeEach`

Example:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyModule', () => {
  beforeEach(() => {
    // Reset state
  });

  describe('myFunction', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Continuous Integration

Tests should be run automatically in CI/CD pipelines before deployment. Add this to your GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test
```

## Future Improvements

- [ ] Add E2E tests using Playwright for UI interactions
- [ ] Increase coverage to 80%+ of codebase
- [ ] Add visual regression testing for particle animations
- [ ] Performance benchmarking tests
- [ ] Integration tests with tsParticles API
