# ✨ tsDice | The Ultimate tsParticles Scene Randomizer ✨

[![Project Status: Maintained](https://img.shields.io/badge/project%20status-maintained-brightgreen.svg)](https://gist.github.com/zophiezlan/9733473a25de35dd924294d1354353c9)
[![CI](https://github.com/zophiezlan/tsdice/workflows/CI/badge.svg)](https://github.com/zophiezlan/tsdice/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zophiezlan/tsdice/workflows/CodeQL%20Security%20Analysis/badge.svg)](https://github.com/zophiezlan/tsdice/actions/workflows/codeql.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-84%25-brightgreen.svg)](PHASE1_IMPLEMENTATION.md)
[![Tests](https://img.shields.io/badge/tests-111%20passing-brightgreen.svg)](PHASE3_IMPLEMENTATION.md)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://zophiezlan.github.io/tsdice/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🎲 **Roll the dice on particle animations!** A mesmerizing, interactive playground for discovering infinite visual possibilities.

**tsDice** transforms the powerful [tsParticles](https://github.com/tsparticles/tsparticles) library into an intuitive creative tool. Instead of manually configuring hundreds of options, you can click, shuffle, and discover stunning particle effects in seconds. Think of it as a **visual slot machine for generative art** — each spin reveals something unexpected and beautiful.

---

## 🚀 Quick Start

### Try It Now

**👉 [Launch tsDice](https://zophiezlan.github.io/tsdice/) 👈**

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

### 📊 [**Complete Analysis**](ANALYSIS.md)

Fresh technical overview of the entire codebase:

- File structure & relationships
- Module responsibilities
- State management details
- Security considerations
- Testing strategies
- Overall assessment (Grade: A+ 95/100)

### ⚡ [**Quick Reference**](QUICK_REFERENCE.md)

Fast lookup cheat sheet:

- All keyboard shortcuts
- API quick reference
- Common workflows
- Debugging commands
- Quick recipes

---

## 🎯 What Makes tsDice Special?

### The Philosophy: Controlled Chaos

tsDice is built on a unique **granular randomization architecture** that gives you both surprise and control:

- 🎨 **Appearance Shuffler** — Randomizes colors, shapes, sizes, and strokes
- 🌊 **Movement Shuffler** — Changes speed, direction, trails, and attractions
- 🖱️ **Interaction Shuffler** — Modifies hover/click behaviors (repel, grab, bubble, etc.)
- ✨ **Special FX Shuffler** — Toggles advanced effects (links, rotation, wobble, collisions)
- 🎲 **Shuffle All** — Complete randomization for maximum surprise

### The Chaos Level: Your Creative Dial

The **Chaos Level** (1-10) is tsDice's secret sauce:

- **Low Chaos (1-3)**: Calm, elegant, minimalist scenes
- **Medium Chaos (4-7)**: Balanced energy and complexity
- **High Chaos (8-10)**: Maximum particles, wild physics, visual extravaganza!

This single slider controls particle count, speed multipliers, and the probability of enabling complex effects.

---

## 🎮 Features That Spark Joy

### 🎛️ Interactive Controls

| Feature                 | What It Does                    | Keyboard Shortcut     |
| ----------------------- | ------------------------------- | --------------------- |
| **Shuffle All**         | Complete scene regeneration     | `Alt + A`             |
| **Shuffle Appearance**  | Change particle visuals only    | `Alt + P`             |
| **Shuffle Movement**    | Modify motion physics           | `Alt + V`             |
| **Shuffle Interaction** | Alter mouse effects             | `Alt + I`             |
| **Shuffle Special FX**  | Toggle advanced effects         | `Alt + F`             |
| **Gravity Toggle**      | Pull particles downward         | `Alt + G`             |
| **Walls Toggle**        | Make particles bounce at edges  | `Alt + W`             |
| **Cursor Particle**     | Trail particles from your mouse | `Alt + C`             |
| **Theme Toggle**        | Switch dark/light mode          | `Alt + T`             |
| **Pause/Play**          | Freeze the animation            | `Space`               |
| **Undo/Redo**           | Navigate through history        | `Alt + Z` / `Alt + Y` |
| **Share**               | Generate shareable emoji URL    | `Alt + S`             |
| **Info Modal**          | View all controls & shortcuts   | `Alt + ?`             |

### 💾 Smart Persistence

- **History System**: Infinite undo/redo stack remembers your journey
- **Local Storage**: Your last configuration automatically saves
- **URL Sharing**: Compress entire scenes into shareable emoji links 🐎🦄✨
- **Theme Memory**: Preferences persist across sessions

### 🎨 Accessibility First

- Full keyboard navigation support
- ARIA live regions for screen readers
- Focus trapping in modals
- Reduced motion support (auto-pauses for users with motion sensitivities)
- Custom tooltips with keyboard shortcuts

### 🎭 Easter Eggs

Try the **Konami Code** (↑ ↑ ↓ ↓ ← → ← → B A) for a surprise party mode! 🎉

---

## 🏗️ Architecture Deep Dive

### Modular ES6 Design

tsDice's codebase is a masterclass in modern JavaScript architecture:

```
tsdice/
├── index.html              # Single-file app with embedded styles
├── vite.config.js          # Vite build configuration
├── package.json            # Dependencies & scripts
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
    ├── keyboardShortcuts.js# Global keyboard event handling
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
                                    https://share.ket.horse/🐎🦄🌀✨🎉🪐👽🛸
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
- ✅ **Automated Deployment** - GitHub Pages deployment on main branch
- ✅ **Dependency Updates** - Automated Dependabot PRs
- ✅ **Performance Monitoring** - Bundle size and Lighthouse CI
- ✅ **PR Validation** - Comprehensive checks on every pull request
- ✅ **Release Automation** - Automatic releases with changelogs

See [.github/CI_CD_GUIDE.md](.github/CI_CD_GUIDE.md) for detailed CI/CD documentation.

---

## 🌟 Use Cases

### For Developers

- **Rapid Prototyping**: Discover particle configs for your own projects
- **Learning Tool**: Study how different tsParticles options interact
- **Design Inspiration**: Generate ideas for landing pages, backgrounds, interactive art

### For Designers

- **Creative Exploration**: Find unexpected visual combinations
- **Client Presentations**: Quickly demo different particle styles
- **Moodboard Generation**: Create and share particle scenes via URLs

### For Fun

- **Stress Relief**: Meditative, endlessly changing visuals
- **Desktop Wallpaper**: Create dynamic backgrounds with Lively Wallpaper integration
- **Party Visuals**: High chaos + fullscreen mode = instant ambiance

---

<details>
<summary><strong>🖥️ How to Set Up tsDice as an Animated Desktop Wallpaper</strong></summary>

<br>

Transform your desktop into a mesmerizing particle animation with Lively Wallpaper!

### Prerequisites

- **Windows 10/11** (64-bit)
- **[Lively Wallpaper](https://www.rocksdanister.com/lively/)** — Free, open-source animated wallpaper engine
  - Download from [Microsoft Store](https://apps.microsoft.com/detail/9NTM2QC6QWS7) (recommended)
  - Or from [GitHub Releases](https://github.com/rocksdanister/lively/releases) (portable version available)
- **tsDice files** — Either clone this repository or save the hosted version locally

### Installation Guide

#### Step 1: Prepare tsDice Files

Choose **one** of these options:

**Option A: Clone the Repository** (Recommended)

```bash
git clone https://github.com/zophiezlan/tsdice.git
cd tsdice
```

**Option B: Download as ZIP**

1. Visit [tsDice Repository](https://github.com/zophiezlan/tsdice)
2. Click **Code** → **Download ZIP**
3. Extract to a permanent location (e.g., `C:\Wallpapers\tsDice`)

**Option C: Save Live Version**

1. Visit [tsDice Live Demo](https://zophiezlan.github.io/tsdice/)
2. Press `Ctrl+S` to save the webpage
3. Choose **"Webpage, Complete"** to include all assets
4. Save to a permanent folder

#### Step 2: Install Lively Wallpaper

1. **Download Lively Wallpaper:**
   - [Microsoft Store](https://apps.microsoft.com/detail/9NTM2QC6QWS7) — Auto-updates, easy install
   - [GitHub](https://github.com/rocksdanister/lively/releases) — Portable version available

2. **Launch Lively** and complete the first-run setup

3. **Grant necessary permissions** if prompted (for wallpaper control)

#### Step 3: Add tsDice to Lively

1. Open **Lively Wallpaper**
2. Click the **"+"** (Add Wallpaper) button in the top-right
3. Select **"Choose File"** from the menu
4. Navigate to your tsDice folder
5. Select `index.html` and click **Open**
6. Lively will process the file and add it to your library

#### Step 4: Apply as Wallpaper

1. Find **tsDice** in your Lively library (thumbnail preview will show)
2. **Right-click** on the tsDice thumbnail
3. Select **"Set as wallpaper"**
   - For multi-monitor setups, choose **"Span across all displays"** or set individually

#### Step 5: Customize Your Scene

**Using tsDice Controls:**

- The control menu appears at the bottom of your screen
- **Shuffle buttons** — Randomize different aspects:
  - `Shuffle All` — Complete scene regeneration
  - `Appearance` — Change colors, shapes, sizes
  - `Movement` — Adjust speed and physics
  - `Special FX` — Toggle advanced effects
- **Chaos Level slider** — Control complexity (1 = calm, 10 = wild)
- **Toggle switches** — Enable/disable gravity, walls, cursor particles

**Saving Your Favorite Scene:**

1. Customize until you find a scene you love
2. The configuration auto-saves to browser localStorage
3. Your scene will persist as your default wallpaper

**Creating Multiple Scenes:**

1. Configure a scene you like
2. Press `Alt+S` to generate a shareable URL
3. Bookmark the URL or save it in a text file
4. Later, open that URL and repeat Step 3 to add it as a new wallpaper variant

### Performance Tips

**For Optimal Experience:**

- **Lower Chaos Levels (1-5)** — Minimal CPU/GPU usage, battery-friendly
- **Disable Special FX** — Reduces particle calculations
- **Pause when inactive** — Right-click tsDice thumbnail → **Settings** → Enable "Pause when not visible"

**For High-End Systems:**

- **Chaos Level 8-10** — Maximum visual impact
- **Enable all Special FX** — Links, collisions, rotation, wobble
- **4K/multi-monitor** — tsDice scales beautifully to any resolution

### Troubleshooting

**Issue: Wallpaper appears frozen or laggy**

- Lower the Chaos Level slider to reduce particle count
- Disable Special FX toggles
- In Lively settings, try **"Video Player"** mode instead of **"Web Browser"**

**Issue: Controls don't respond**

- Ensure Lively is set to **"Web Browser"** mode (not Video Player)
- Try reloading: Right-click wallpaper → **"Restart"**

**Issue: Wallpaper resets after restart**

- tsDice uses browser localStorage, which Lively may clear
- Save your favorite URLs (with `Alt+S`) and re-apply them after restarts
- Alternatively, edit `index.html` to set a default configuration

**Issue: Multi-monitor wallpaper doesn't span correctly**

- Right-click tsDice in Lively → **"Duplicate"** to create separate instances per monitor
- Or use **"Span"** mode and adjust particle count for performance

### Advanced Customization

**Editing Default Settings:**

1. Open `index.html` in a text editor (VS Code, Notepad++)
2. Find the `AppState` initialization (around line 150)
3. Modify `chaosLevel`, `isDarkMode`, or other defaults
4. Save and re-add to Lively

**Creating Theme Presets:**

Use the Share URL feature to create bookmarkable presets:

- **Zen Desktop**: Chaos 2, gravity on, circles only
- **Cosmic Desktop**: Chaos 7, dark theme, star shapes
- **Matrix Desktop**: Chaos 5, green particles, links enabled
- **Confetti Desktop**: Chaos 10, bounce walls, maximum chaos

### Recommended Settings by Use Case

| Use Case           | Chaos Level | Special FX | Theme | Notes                       |
| ------------------ | ----------- | ---------- | ----- | --------------------------- |
| Work/Productivity  | 1-3         | Off        | Light | Minimal distraction         |
| Ambient Background | 4-6         | Selective  | Dark  | Balanced visual interest    |
| Gaming/Streaming   | 7-9         | On         | Dark  | High energy, matches RGB    |
| Showpiece/Demo     | 10          | All On     | Dark  | Maximum visual impact       |
| Battery Saving     | 1-2         | Off        | Light | Lowest resource consumption |

---

**Pro Tip:** Create multiple tsDice wallpapers with different configs in Lively's library, then use Lively's **playlist feature** to rotate between them on a schedule!

</details>

---

## 🛠️ Technologies & Dependencies

### Core Stack

- **[tsParticles](https://particles.js.org/)** v3.9.1 — Particle animation engine
- **[lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)** v1.5.0 — URL compression
- **[Vite](https://vitejs.dev/)** v7.2.2 — Build tool & dev server (Phase 2)
- **[Vitest](https://vitest.dev/)** v4.0.8 — Test framework with 111 tests (Phase 2)
- **Vanilla JavaScript** — ES6 modules, no framework bloat
- **CSS3** — Custom properties, grid, flexbox, backdrop-filter
- **HTML5** — Semantic, accessible markup

### Browser Support

- Modern browsers with ES6 module support
- Graceful degradation for older browsers (no backdrop-filter)
- Responsive design from 320px to 4K displays

### External Services

- **spoo.me API** (via share.ket.horse) — Emoji URL shortening
- **jsDelivr CDN** — tsParticles & lz-string delivery

---

## 📊 Project Stats

- **Lines of Code**: ~4,500 (including comments & docs)
- **JavaScript Modules**: 15 files (11 core + 3 constants + 2 managers)
- **Test Coverage**: 84% with 111 passing tests
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

## 🎁 Bonus: Tips & Tricks

### Creating Specific Moods

- **Zen Mode**: Chaos 1-2, enable gravity, shuffle appearance until you get circles
- **Cosmic Mode**: Chaos 7-8, dark theme, shuffle until you get star shapes
- **Matrix Mode**: Chaos 5, green particles with links enabled
- **Confetti Mode**: Konami code or Chaos 10 with bounce walls
- **Minimalist Mode**: Chaos 1, shuffle FX until links appear, disable everything else

### Keyboard Ninja Shortcuts

- **Rapid Exploration**: `Alt+A` (shuffle all) → `Space` (pause) → `Alt+Z` (undo) → repeat
- **Fine-Tuning**: `Alt+P` (appearance) → `Alt+V` (movement) → `Alt+I` (interaction)
- **Quick Share**: Create scene → `Alt+S` (share) → Paste in Discord/Slack

### Best Practices

1. Start with Chaos 5 to understand the middle ground
2. Use category shuffles to isolate what you like
3. Save favorite configs by sharing and bookmarking the URL
4. Toggle gravity on/off dynamically for dramatic effect
5. Use cursor particle mode for interactive presentations

---

**Now go forth and create something beautiful!** ✨🎲🎨
