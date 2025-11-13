# ✨ tsDice | The Ultimate tsParticles Scene Randomizer ✨

[![Project Status: Maintained](https://img.shields.io/badge/project%20status-maintained-brightgreen.svg)](https://gist.github.com/zophiezlan/9733473a25de35dd924294d1354353c9)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://tsdice.pages.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🎲 **Roll the dice on particle animations!** A mesmerizing, interactive playground for discovering infinite visual possibilities.

**tsDice** transforms the powerful [tsParticles](https://github.com/tsparticles/tsparticles) library into an intuitive creative tool. Instead of manually configuring hundreds of options, you can click, shuffle, and discover stunning particle effects in seconds. Think of it as a **visual slot machine for generative art** — each spin reveals something unexpected and beautiful.

---

## 🚀 Quick Start

### Try It Now!

**👉 [Launch tsDice](https://tsdice.pages.dev/) 👈**

**Desktop Wallpaper Version:**  
🖥️ Turn your desktop into a living artwork with the [desktop branch](https://github.com/zophiezlan/tsdice/tree/desktop) + Lively Wallpaper integration!

### Run Locally

```bash
# Clone the magic
git clone https://github.com/zophiezlan/tsdice.git

# Enter the realm
cd tsdice

# Open index.html in your browser - that's it! No build steps, no dependencies to install.
```

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

- **History System**: 20-step undo/redo stack remembers your journey
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
└── js/
    ├── main.js             # Application orchestrator & event handling
    ├── state.js            # Centralized application state (single source of truth)
    ├── constants.js        # Data arrays (colors, shapes, emojis, etc.)
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

#### 1. **Command Pattern for Undo/Redo**

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

#### 2. **State Management**

The `AppState` object serves as the single source of truth:

```javascript
AppState = {
  ui: { isDarkMode, isCursorParticle, isGravityOn, areWallsOn, isPaused },
  particleState: { chaosLevel, currentConfig, originalInteractionModes },
};
```

#### 3. **Factory Functions**

Generators create configurations deterministically based on chaos level:

```javascript
ConfigGenerator.generateAppearance() → { color, shape, opacity, size, stroke }
ConfigGenerator.generateMovement()   → { speed, direction, trail, attract }
ConfigGenerator.generateInteraction() → { hover, click, modes }
ConfigGenerator.generateSpecialFX()  → { collisions, wobble, rotate, links }
```

#### 4. **Service Layer**

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
config.particles.move.outModes = { default: "bounce" };

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
- **Desktop Wallpaper**: Use the desktop branch for dynamic backgrounds
- **Party Visuals**: High chaos + fullscreen mode = instant ambiance

---

## 🛠️ Technologies & Dependencies

### Core Stack

- **[tsParticles](https://particles.js.org/)** v3.9.1 — Particle animation engine
- **[lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)** v1.5.0 — URL compression
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

- **Lines of Code**: ~3,500 (including comments & docs)
- **JavaScript Modules**: 11 files
- **CSS Variables**: 25+ theme properties
- **Keyboard Shortcuts**: 17 commands
- **Supported Particle Shapes**: 9 types
- **Color Palettes**: 8 dark + 8 light mode colors
- **Emoji Options**: 100+ for URL shortening
- **History Depth**: 20 undo steps

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
