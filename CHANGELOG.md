# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 3 (Architecture Integration)

- Integrated ErrorHandler into main.js for centralized error handling
- Integrated StateManager into main.js for predictable state management
- Production-ready Vite build system with optimization
  - Code splitting for vendor chunks
  - Legacy browser support
  - Minification with Terser
  - 46 KB gzipped production bundle
- Development workflow improvements
  - `npm run dev` - Vite dev server with HMR
  - `npm run build` - Production build
  - `npm run preview` - Preview production build
- Phase 3 implementation documentation

### Added - Phase 2 (Code Quality & Architecture)

- **Centralized Error Handling**
  - `errorHandler.js` with 7 typed error categories
  - User-friendly error messages with toast notifications
  - Automatic error recovery for non-fatal errors
  - Screen reader accessibility for errors
- **State Management with Dispatch Pattern**
  - `stateManager.js` with action creators
  - 9 action types for type-safe state mutations
  - Automatic validation and persistence
  - Immutable state snapshots
- **Modular Constants Organization**
  - Split `constants.js` into focused modules
  - `constants/ui.js` - UI-related constants
  - `constants/particles.js` - Particle configuration
  - `constants/colors.js` - Color palettes and themes
  - Barrel export for backward compatibility
- **Enhanced Testing**
  - 111 tests (up from 74)
  - Tests for ErrorHandler (14 tests)
  - Tests for StateManager (23 tests)
  - Maintained 84% code coverage
- **Magic Number Elimination**
  - Replaced hardcoded values with named constants
  - PARTICLE_CONFIG for particle settings
  - THEME_BACKGROUNDS for theme colors
- **Build System**
  - Vite 7.x with modern build pipeline
  - Code splitting and tree-shaking
  - Production bundle optimization
- Phase 2 implementation documentation

### Added - Phase 1 (Testing & Organization)

- Comprehensive CI/CD framework with GitHub Actions
  - Automated testing on Node.js 18, 20, and 22
  - ESLint and Prettier for code quality
  - CodeQL security scanning
  - Automated deployment to GitHub Pages
  - Performance monitoring with bundle size checks
  - Dependabot for dependency updates
  - Stale issue/PR management
  - Auto-labeling for PRs
- **Professional Test Suite**
  - Vitest testing framework
  - 74 initial tests with 84% coverage
  - Tests for command pattern, utils, state, config generator
  - Watch mode and coverage reporting
- ESLint configuration with flat config format (v9+)
- Prettier for consistent code formatting
- Security policy (SECURITY.md)
- Issue templates for bug reports and feature requests
- Pull request template
- Comprehensive CI/CD documentation
- Extracted CSS into modular stylesheets

### Changed

- **main.js** - Integrated ErrorHandler and StateManager (Phase 3)
- **ARCHITECTURE.md** - Documented new patterns and modules (Phase 3)
- All state mutations now use dispatch pattern (Phase 3)
- Error handling now centralized and typed (Phase 3)
- **configGenerator.js** - Uses modular constants (Phase 2)
- **particlesService.js** - Uses named constants instead of magic numbers (Phase 2)
- README.md updated with Phase 2/3 features, build system, and module count
- QUICK_REFERENCE.md updated with new module structure

### Improved

- Code maintainability through centralized error handling
- Debugging through action logging in StateManager
- User experience with better error messages
- Production performance with optimized builds
- Developer experience with HMR and fast builds
- Code organization through modular constants

## [1.0.0] - Previous Release

### Features

- Interactive particle animation randomizer
- Granular control with category-specific shufflers
- Chaos level slider (1-10)
- Full keyboard shortcut support
- History system with undo/redo
- URL sharing with emoji compression
- Dark/light theme toggle
- Accessibility features
- Professional test suite with 48+ tests
- Comprehensive documentation

---

For the complete history, see the [commit log](https://github.com/zophiezlan/tsdice/commits/main).
