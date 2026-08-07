# ✨ tsDice | tsParticles Scene Randomizer ✨

[![Project Status: Maintained](https://img.shields.io/badge/project%20status-maintained-brightgreen.svg)](https://gist.github.com/zophiezlan/9733473a25de35dd924294d1354353c9)
[![CI](https://github.com/zophiezlan/tsdice/actions/workflows/ci.yml/badge.svg)](https://github.com/zophiezlan/tsdice/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zophiezlan/tsdice/actions/workflows/codeql.yml/badge.svg)](https://github.com/zophiezlan/tsdice/actions/workflows/codeql.yml)
[![Test Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zophiezlan/tsdice/main/badges/coverage.json)](tests/README.md)
[![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zophiezlan/tsdice/main/badges/tests.json)](tests/README.md)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://ket.horse/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🎲 **Roll the dice on particle animations!** A mesmerizing, interactive playground for discovering infinite visual possibilities.

**tsDice** transforms the powerful [tsParticles](https://github.com/tsparticles/tsparticles) library into an intuitive creative tool. Instead of manually configuring hundreds of options, you can click, shuffle, and discover stunning particle effects in seconds. Think of it as a **visual slot machine for generative art** — each spin reveals something unexpected and beautiful.

---

## 🚀 Quick Start

### Try It Now

**👉 [Launch tsDice](https://ket.horse/) 👈**

### Run Locally

```bash
# Clone the magic
git clone https://github.com/zophiezlan/tsdice.git

# Enter the realm
cd tsdice

# Option 1: Direct browser (no build needed)
# Open index.html in your browser

# Option 2: Development server (recommended)
npm install
npm run dev
# Visit http://localhost:3000
```

**📖 First Time Here?** Check out the [**User Guide**](USER_GUIDE.md) — your complete journey from beginner to power user!

---

## 📚 Documentation

**New to tsDice?** We've created comprehensive guides to help you master every aspect:

### 🎯 [**User Guide**](USER_GUIDE.md) ⭐ START HERE

Your complete journey from first click to power user. Includes:

- 🚀 Your first 5 minutes walkthrough
- 🎛️ Complete interface explanation
- 🎲 Chaos level deep dive
- ⌨️ Keyboard ninja training
- 🎨 Creative recipes (Zen Mode, Matrix Rain, Confetti, etc.)
- 🐛 Troubleshooting guide
- 💡 Pro tips & tricks

### 🏗️ [**Architecture Guide**](ARCHITECTURE.md)

Technical deep dive for developers:

- System overview with diagrams
- Design patterns explained
- Data flow analysis
- Key algorithms breakdown
- Performance optimizations
- Extension points for contributors

Keyboard shortcuts, recipes, and workflows live in the [User Guide](USER_GUIDE.md).

---

## 🎯 What Makes tsDice Special?

tsDice is built on **granular randomization**: four shuffle categories (appearance, movement, interaction, FX) plus a master shuffle, all scaled by a single **Chaos Level** slider (1–10) that controls particle count, speed, and effect probability. The result is a creative dial that balances surprise with intention.

Full feature tour, keyboard shortcuts, recipes, and accessibility notes live in the **[User Guide](USER_GUIDE.md)**.

---

## 🏗️ Architecture Deep Dive

### Modular ES6 Design

tsDice's codebase is a masterclass in modern JavaScript architecture:

```
tsdice/
├── index.html              # Single-file app with embedded styles
├── vite.config.js          # Vite build configuration
├── package.json            # Dependencies & scripts
├── styles/                 # Shared CSS variables + component styling
├── tests/                  # Vitest suite + coverage artifacts
└── js/
    ├── main.js             # Application orchestrator & event handling
    ├── state.js            # Centralized application state (single source of truth)
    ├── errorHandler.js     # Centralized error handling (Phase 2)
    ├── stateManager.js     # State management with dispatch pattern (Phase 2)
    ├── constants/          # Modular constants (Phase 2)
    │   ├── ui.js           # UI-related constants
    │   ├── particles.js    # Particle configuration constants
    │   └── colors.js       # Color palettes and themes
    ├── constants.js        # Barrel export for backward compatibility
    ├── configGenerator.js  # Particle configuration generators
    ├── particlesService.js # tsParticles interaction layer
    ├── uiManager.js        # DOM manipulation & UI feedback
    ├── modalManager.js     # Modal lifecycle management
    ├── commandManager.js   # Command pattern for undo/redo
    ├── tooltipManager.js   # Tooltip behavior & positioning
    ├── keyboardShortcuts.js # Global keyboard event handling
    └── utils.js            # Helper functions (random, debounce, clipboard)
```

### Key Architectural Patterns

#### 1. **Centralized Error Handling (Phase 2)**

All error-prone operations use `ErrorHandler` for consistent user feedback:

```javascript
const safeLoadParticles = ErrorHandler.wrap(
  loadParticles,
  ErrorType.PARTICLES_LOAD
);
await safeLoadParticles(config);
```

**Features:**

- 7 error types for classification
- User-friendly toast notifications
- Screen reader announcements
- Automatic recovery for non-fatal errors

#### 2. **State Management with Dispatch Pattern (Phase 2)**

All state mutations go through `StateManager.dispatch()` for validation:

```javascript
// Dispatch an action to change theme
StateManager.dispatch(Actions.setTheme(false));
StateManager.persist(); // Auto-save to localStorage
```

**Benefits:**

- Type-safe action creators
- Centralized validation
- Automatic UI synchronization
- Easy debugging with action logging

#### 3. **Command Pattern for Undo/Redo**

Every action is encapsulated as a command object with `execute()` and `undo()` methods:

```javascript
const command = {
  async execute() {
    /* apply changes */
  },
  async undo() {
    /* revert changes */
  },
};
CommandManager.execute(command);
```

#### 4. **State Management**

The `AppState` object serves as the single source of truth, modified through `StateManager`:

```javascript
AppState = {
  ui: { isDarkMode, isCursorParticle, isGravityOn, areWallsOn, isPaused },
  particleState: { chaosLevel, currentConfig, originalInteractionModes },
};

// All mutations go through StateManager
StateManager.dispatch(Actions.setChaosLevel(7));
```

#### 5. **Factory Functions**

Generators create configurations deterministically based on chaos level:

```javascript
ConfigGenerator.generateAppearance() → { color, shape, opacity, size, stroke }
ConfigGenerator.generateMovement()   → { speed, direction, trail, attract }
ConfigGenerator.generateInteraction() → { hover, click, modes }
ConfigGenerator.generateSpecialFX()  → { collisions, wobble, rotate, links }
```

#### 6. **Service Layer**

`particlesService.js` acts as an abstraction layer between tsDice and tsParticles:

- `buildConfig()` — Assembles final configuration
- `loadParticles()` — Initializes/refreshes particle engine
- `reapplyToggleStates()` — Ensures UI toggles persist across shuffles

### Data Flow

```
User Action → Event Listener (main.js)
           ↓
Command Factory (createShuffleCommand)
           ↓
Command Manager (execute with undo capability)
           ↓
StateManager.dispatch() (validate & apply state changes)
           ↓
Config Generator (randomized settings)
           ↓
Particles Service (apply to tsParticles)
           ↓
UI Manager (sync visual feedback)
```

---

## 🎨 Design Philosophy

### Glassmorphism UI

The interface uses **glassmorphism** design principles:

- Semi-transparent backgrounds (`rgba` with `backdrop-filter: blur`)
- Subtle borders and shadows
- Smooth transitions and animations
- Theme-aware color variables (CSS custom properties)

### CSS Variable Theming

The entire color scheme is controlled through CSS custom properties:

```css
:root {
  --bg-primary: #111;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --text-primary: white;
  --link-color: #87ceeb;
  /* ... and 20+ more variables */
}

body.light-mode {
  /* Override all variables for light theme */
}
```

### Responsive & Touch-Friendly

- Fluid grid layout adapts from mobile to desktop
- Touch targets meet WCAG size requirements (44x44px minimum)
- Momentum scrolling on mobile
- Auto-hide menu after 10 seconds of inactivity

---

## 🔧 Technical Highlights

### Performance Optimizations

1. **Debounced Slider**: Chaos slider uses debouncing to prevent excessive localStorage writes
2. **Event Delegation**: Single click listener handles all button events via bubbling
3. **Loading Indicators**: Only show spinner for operations > 300ms
4. **Structured Cloning**: Deep copies prevent unintended mutations
5. **Lazy Modal Population**: Info modal content builds on-demand

### URL Compression Magic

Share URLs use `lz-string` compression and emoji shortening:

```javascript
Full Config → JSON.stringify() → LZString.compress() → Base64 URL
                                                     ↓
                                          spoo.me API (8 random emojis)
                                                     ↓
                                    https://my.ket.horse/🐎🦄🌀✨🎉🪐👽🛸
```

### Memory Leak Prevention

- Particles container destroyed on `beforeunload`
- Event listeners properly cleaned up
- Debounced functions cancelled on component unmount

---

## 🎓 Learning Resources

### For Developers Exploring This Codebase

#### Understanding the Randomization System

Start in `configGenerator.js` to see how chaos level affects probability:

```javascript
// Higher chaos = more likely to enable complex effects
getRandomBool(getChaosProbability(0.5, chaosLevel));
// chaosLevel 1 → 10% chance
// chaosLevel 5 → 50% chance
// chaosLevel 10 → 100% chance
```

#### Understanding Toggle Persistence

The `reapplyToggleStates()` function ensures gravity, walls, and cursor modes survive shuffles:

```javascript
// Store original modes before toggle
AppState.particleState.originalOutModes = config.particles.move.outModes;

// Apply toggle
config.particles.move.outModes = { default: 'bounce' };

// Restore when toggled off
config.particles.move.outModes = originalOutModes;
```

#### Understanding the Command Pattern

Each action creates a command object that captures before/after state:

```javascript
const command = {
  oldConfig: clone(currentConfig), // Before
  newConfig: null, // After (lazy-evaluated)
  execute() {
    /* apply newConfig */
  },
  undo() {
    /* restore oldConfig */
  },
};
```

### For Contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. We welcome:

- 🐛 Bug fixes
- ⚡ Performance improvements
- 📖 Documentation enhancements
- ♿ Accessibility improvements
- 🎨 UI/UX polish

#### Running Tests

tsDice now includes a professional-grade automated test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Current test coverage includes:

- ✅ Command pattern (undo/redo)
- ✅ Error handling (ErrorHandler)
- ✅ State management (StateManager)
- ✅ Configuration generation
- ✅ Utility functions
- ✅ 111 test cases

#### Development & Build

```bash
# Start development server with HMR
npm run dev

# Build for production (optimized, minified)
npm run build

# Preview production build
npm run preview
```

See [tests/README.md](tests/README.md) for detailed testing documentation.

#### Code Quality Tools

The project uses ESLint and Prettier for code quality and consistency:

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

#### CI/CD Pipeline

tsDice has a comprehensive CI/CD framework powered by GitHub Actions:

- ✅ **Automated Testing** - Runs on Node.js 18, 20, and 22
- ✅ **Code Quality Checks** - ESLint and Prettier validation
- ✅ **Security Scanning** - CodeQL analysis and npm audit
- ✅ **Cloudflare Production Hosting** - Served at https://ket.horse
- ✅ **Dependency Updates** - Automated Dependabot PRs
- ✅ **Performance Monitoring** - Bundle size and Lighthouse CI
- ✅ **PR Validation** - Comprehensive checks on every pull request
- ✅ **Release Automation** - Automatic releases with changelogs

See [.github/CI_CD_GUIDE.md](.github/CI_CD_GUIDE.md) for detailed CI/CD documentation.

---

## 🌟 Use Cases

Rapid prototyping for developers, creative exploration for designers, and shareable particle scenes for the web. See the [User Guide](USER_GUIDE.md) for workflows and creative recipes.

---

## 🛠️ Technologies & Dependencies

### Core Stack

- **[tsParticles](https://particles.js.org/)** v3.9.1 — Particle animation engine
- **[lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)** v1.5.0 — URL compression
- **[Vite](https://vitejs.dev/)** v8.0.9 — Build tool & dev server (Phase 2)
- **[Vitest](https://vitest.dev/)** v4.0.16 — Test framework with 111 tests (Phase 2)
- **Vanilla JavaScript** — ES6 modules, no framework bloat
- **CSS3** — Custom properties, grid, flexbox, backdrop-filter
- **HTML5** — Semantic, accessible markup

### Browser Support

- Modern browsers with ES6 module support
- Graceful degradation for older browsers (no backdrop-filter)
- Responsive design from 320px to 4K displays

### External Services

- **spoo.me API** (via my.ket.horse) — Emoji URL shortening
- **jsDelivr CDN** — tsParticles & lz-string delivery

---

## 📊 Project Stats

- **Tracked Lines**: 21,339 across 65 Git-tracked files (code + docs)
- **JavaScript Modules**: 16 files (13 core + 3 constant modules)
- **Automated Tests**: 111 Vitest specs covering command/state/config layers
- **Test Coverage**: 76% statements / 71% branches (v8, `npm run test:coverage`)
- **CSS Variables**: 25+ theme properties
- **Keyboard Shortcuts**: 17 commands
- **Supported Particle Shapes**: 9 types
- **Color Palettes**: 8 dark + 8 light mode colors
- **Emoji Options**: 100+ for URL shortening
- **History Depth**: Infinite undo steps
- **Production Bundle**: 46 KB (gzipped)

---

## 🎯 Project Status

### Maintenance Mode

This project is **feature-complete** and actively maintained:

- ✅ Core functionality stable
- ✅ Bug fixes ongoing
- ✅ Community PRs reviewed
- ⏸️ No major new features planned

See the [PROJECT_STATUS.md](https://gist.github.com/zophiezlan/9733473a25de35dd924294d1354353c9) for detailed roadmap.

---

## 🤝 Community & Support

- **Issues**: [GitHub Issues](https://github.com/zophiezlan/tsdice/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zophiezlan/tsdice/discussions)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## 📜 License

MIT License — See [LICENSE](LICENSE) for details.

Built with ❤️ by [zophiezlan](https://github.com/zophiezlan)

---

**Now go forth and create something beautiful!** ✨🎲🎨

> Creative recipes, keyboard flows, and power-user techniques are documented in the **[User Guide](USER_GUIDE.md)**.
