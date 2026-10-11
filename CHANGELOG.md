# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Comfort layer

- `js/comfort.js`: limits every scene stays within before it is drawn,
  whatever its source (shuffle, undo, saved scene or someone else's share
  link): particle count, speed and size caps; twinkle and opacity/colour
  animation kept well under WCAG 2.3.1's three-flashes-a-second; collisions
  only bounce and nothing self-destructs; only curated hover/click modes.
  Limits sit at or above anything tsDice generates, so its own scenes are
  unchanged (tested across every chaos level, toggle and Party Mode)
- Push-clicks can no longer grow a scene past 300 particles
- Holding an Alt shortcut fires it once instead of ~30 times a second
- Scenes cross-fade over 0.65s (shuffles, undo/redo, theme, toggles)
  instead of swapping instantly; replaces the 30% opacity dip and the
  brightness burst on shuffle. Theme changes now ease between dark and
  light rather than jumping

### Changed - tsParticles v4

- The "absorb" click mode, which never matched a real tsParticles mode and so
  did nothing, is now a 1.2s click-attract that gathers nearby particles
  into a soft ring and lets them go; old share links get it too
- Link triangles now favour calm scenes: 30% of linked scenes at chaos 1-4,
  fading out by chaos 8 (previously they grew more likely with chaos, which
  made dense scenes busy and slow)
- Spiral and infinity shapes only appear at chaos 6+, featuring in 5% of
  shuffles at chaos 6 rising to 30% at chaos 10
- Browsers without OffscreenCanvas (iOS/Safari before 16.4) get a small
  shim so v4 still draws; if the engine still can't start, a friendly
  "browser is a little too old" screen replaces a blank page
- Upgraded tsParticles 3.9.1 → 4.4.0, now installed from npm and bundled by
  Vite instead of loaded from jsDelivr
- Particle colour and outline moved to v4's `particles.paint.fill` /
  `particles.paint.stroke` (v4 ignores the old keys and draws white)
- Share links and saved scenes from before the upgrade are converted to the
  v4 layout on load (`js/configMigration.js`), so existing my.ket.horse links
  keep their colours
- HDR / Display-P3 rendering is turned off so scenes keep their curated
  colours on HDR screens
- The reduced-motion freeze is now switched off through the motion plugin's
  options instead of resetting `retina.reduceFactor` after every load
- Black-screen diagnostics read pixels from v4's OffscreenCanvas

### Fixed - Maintenance

- Alt keyboard shortcuts now work on macOS (matched on the physical key, so
  Option+A no longer arrives as "å"), and unmapped Alt combos are no longer
  swallowed, so browser and OS shortcuts keep working
- Shortcuts and Enter/Space no longer activate disabled buttons, and repeat
  share requests are ignored while one is in flight
- Refreshing the page restores the gravity, walls and cursor toggles the
  saved scene was built with, instead of showing them off over a scene that
  still has them applied
- Shared links with the cursor effect on now remember the hover effect it
  replaced
- Undoing Party Mode (Konami code) restores the previous scene
- An invalid share link no longer leaves a stray "#" in the address bar

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
- Removed GitHub Pages deployment workflow; production deployment is Cloudflare-hosted
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
