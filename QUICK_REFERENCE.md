# ⚡ tsDice Quick Reference

> Fast lookup for developers and power users

---

## 🎯 At a Glance

```
┌──────────────────────────────────────────────────────┐
│  tsDice: tsParticles Random Configuration Generator  │
│  • 11 JavaScript modules                             │
│  • 17 keyboard shortcuts                             │
│  • 20-step undo history                              │
│  • Zero dependencies (except tsParticles)            │
└──────────────────────────────────────────────────────┘
```

---

## 🔤 Keyboard Shortcuts

### Shuffle Commands

| Key     | Action              |
| ------- | ------------------- |
| `Alt+A` | Shuffle All         |
| `Alt+P` | Shuffle Appearance  |
| `Alt+V` | Shuffle Movement    |
| `Alt+I` | Shuffle Interaction |
| `Alt+F` | Shuffle Special FX  |

### Toggles

| Key     | Action                    |
| ------- | ------------------------- |
| `Alt+G` | Toggle Gravity            |
| `Alt+W` | Toggle Walls              |
| `Alt+C` | Toggle Cursor Particle    |
| `Alt+T` | Toggle Theme (Dark/Light) |
| `Space` | Pause/Play                |

### Navigation

| Key      | Action           |
| -------- | ---------------- |
| `Alt+Z`  | Undo             |
| `Alt+Y`  | Redo             |
| `Alt+M`  | Toggle Menu      |
| `Escape` | Close Modal/Menu |

### Utilities

| Key     | Action           |
| ------- | ---------------- |
| `Alt+S` | Share (Copy URL) |
| `Alt+R` | Refresh Scene    |
| `Alt+?` | Show Help        |

### Easter Egg

| Sequence              | Action      |
| --------------------- | ----------- |
| `↑ ↑ ↓ ↓ ← → ← → B A` | Party Mode! |

---

## 📁 File Structure

```
tsdice/
├── index.html                  # Main app (1447 lines)
├── README.md                   # Project overview
├── CONTRIBUTING.md             # Contribution guide
├── CODE_OF_CONDUCT.md          # Community standards
├── LICENSE                     # MIT License
├── ARCHITECTURE.md             # Technical deep dive (new!)
├── USER_GUIDE.md               # User manual (new!)
├── ANALYSIS.md                 # Complete analysis (new!)
└── js/
    ├── main.js                 # Orchestrator (822 lines)
    ├── state.js                # State container (20 lines)
    ├── constants.js            # Data arrays (150 lines)
    ├── utils.js                # Helpers (40 lines)
    ├── configGenerator.js      # Randomization (180 lines)
    ├── particlesService.js     # tsParticles facade (239 lines)
    ├── uiManager.js            # DOM manipulation (200 lines)
    ├── commandManager.js       # Undo/redo (60 lines)
    ├── modalManager.js         # Modal lifecycle (80 lines)
    ├── tooltipManager.js       # Tooltip behavior (120 lines)
    └── keyboardShortcuts.js    # Keyboard events (60 lines)
```

---

## 🎨 Module Cheat Sheet

### Import Map

```javascript
// Core dependencies
import { tsParticles } from "cdn.jsdelivr.net/@tsparticles/engine@3.9.1/+esm";
import { loadAll } from "cdn.jsdelivr.net/@tsparticles/all@3.9.1/+esm";

// Internal modules
import { AppState } from "./state.js";
import { UIManager } from "./uiManager.js";
import { ModalManager } from "./modalManager.js";
import { ConfigGenerator } from "./configGenerator.js";
import { CommandManager } from "./commandManager.js";
import { copyToClipboard, getRandomItem, debounce } from "./utils.js";
import {
  darkColorPalette,
  lightColorPalette,
  BUTTON_IDS,
} from "./constants.js";
import {
  buildConfig,
  loadParticles,
  reapplyToggleStates,
} from "./particlesService.js";
import { initTooltipManager } from "./tooltipManager.js";
import { initKeyboardShortcuts } from "./keyboardShortcuts.js";
```

### API Quick Reference

#### State Management

```javascript
// Read state
AppState.ui.isDarkMode;
AppState.particleState.chaosLevel;
AppState.particleState.currentConfig;

// Modify state (always through commands!)
CommandManager.execute(command);
```

#### Config Generation

```javascript
ConfigGenerator.generateAppearance();
ConfigGenerator.generateMovement();
ConfigGenerator.generateInteraction();
ConfigGenerator.generateSpecialFX();
```

#### Particles Service

```javascript
buildConfig({ all: true }); // Full randomization
buildConfig({ appearance: true }); // Appearance only
await loadParticles(config);
reapplyToggleStates(config);
```

#### UI Management

```javascript
UIManager.syncUI(); // Sync all UI to state
UIManager.showToast(message);
UIManager.announce(message); // Screen reader
UIManager.openModal(modal, opener);
UIManager.closeModal(modal);
```

#### Command Pattern

```javascript
const command = {
  async execute() {
    /* do thing */
  },
  async undo() {
    /* undo thing */
  },
};
CommandManager.execute(command);
CommandManager.undo();
CommandManager.redo();
```

---

## 🎲 Chaos Level Guide

| Level | Particles | Speed   | Effects | Vibe      |
| ----- | --------- | ------- | ------- | --------- |
| 1     | 40        | 0.5-2x  | 10%     | Zen       |
| 2     | 60        | 1.0-4x  | 20%     | Calm      |
| 3     | 80        | 1.5-6x  | 30%     | Gentle    |
| 4     | 100       | 2.0-8x  | 40%     | Moderate  |
| 5     | 120       | 2.5-10x | 50%     | Balanced  |
| 6     | 140       | 3.0-12x | 60%     | Energetic |
| 7     | 160       | 3.5-14x | 70%     | Dynamic   |
| 8     | 180       | 4.0-16x | 80%     | Intense   |
| 9     | 200       | 4.5-18x | 90%     | Extreme   |
| 10    | 220       | 5.0-20x | 100%    | Maximum   |

**Formula**: `particleCount = 20 + (chaosLevel * 20)`

---

## 🎯 Common Workflows

### Rapid Exploration

```
Alt+A → Alt+A → Alt+A → Space → Alt+Z
```

### Fine Tuning

```
Alt+A → Alt+V → Alt+V → Alt+P → Alt+S
```

### Undo Recovery

```
Alt+A (oops!) → Alt+Z → Alt+Z → Alt+Y
```

### Create & Share

```
1. Shuffle until happy
2. Alt+S (share)
3. Paste URL anywhere
```

---

## 🔧 Configuration Structure

### Minimal Config

```javascript
{
  background: { color: { value: "#111" } },
  fpsLimit: 120,
  detectRetina: true,
  particles: {
    number: { value: 120 },
    color: { value: "#ff007b" },
    shape: { type: "circle" },
    opacity: { value: { min: 0.3, max: 1 } },
    size: { value: { min: 1, max: 7.5 } },
    move: {
      enable: true,
      speed: 5,
      direction: "none",
      outModes: { default: "out" }
    }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      onClick: { enable: true, mode: "push" }
    },
    modes: {
      repulse: { distance: 100 },
      push: { quantity: 5 }
    }
  }
}
```

### With All Features

```javascript
{
  // ... base config
  particles: {
    // ... appearance
    stroke: { width: 2, color: { value: "random" } },
    move: {
      // ... movement
      trail: { enable: true, length: 10 },
      attract: { enable: true, rotate: { x: 1000, y: 1000 } },
      gravity: { enable: true, acceleration: 20 }
    },
    collisions: { enable: true, mode: "bounce" },
    wobble: { enable: true, distance: 5, speed: 5 },
    rotate: { animation: { enable: true, speed: 20 } },
    links: { enable: true, distance: 150 },
    twinkle: { particles: { enable: true } }
  }
}
```

---

## 🎨 Color Palettes

### Dark Mode

```javascript
[
  "#ff007b",
  "#33ff57",
  "#3357ff",
  "#ffc300",
  "#ffffff",
  "#ad55ff",
  "#00f5d4",
  "#f15bb5",
];
```

### Light Mode

```javascript
[
  "#f72585",
  "#7209b7",
  "#3a0ca3",
  "#4361ee",
  "#4cc9f0",
  "#f94144",
  "#f3722c",
  "#f9c74f",
];
```

---

## 🔀 Particle Shapes

```javascript
[
  "circle",
  "square",
  "triangle",
  "star",
  "polygon",
  "line",
  "heart",
  "rounded-rectangle",
  "character",
];
```

---

## 📐 Directions

```javascript
[
  "none",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
  "top-left",
];
```

---

## 🖱️ Interaction Modes

### Hover

```javascript
["repulse", "grab", "bubble", "slow", "connect", "parallax", "attract"];
```

### Click

```javascript
["push", "bubble", "remove", "trail", "absorb"];
```

---

## 🐛 Debugging

### Check State

```javascript
console.log(AppState);
console.log(AppState.particleState.currentConfig);
```

### Check History

```javascript
console.log(CommandManager.undoStack.length);
console.log(CommandManager.redoStack.length);
```

### Force Sync UI

```javascript
UIManager.syncUI();
```

### Manually Load Config

```javascript
await loadParticles(yourConfig);
```

### Clear History

```javascript
CommandManager.undoStack = [];
CommandManager.redoStack = [];
```

---

## 📊 Performance Tips

1. **Keep Chaos ≤ 7** on mobile
2. **Disable links** for better FPS
3. **Pause when not watching** (Space)
4. **Use Light theme** if laggy
5. **Disable collisions** if laggy

---

## 🔗 Useful Links

- **Live Demo**: [tsdice.pages.dev](https://tsdice.pages.dev)
- **GitHub**: [github.com/zophiezlan/tsdice](https://github.com/zophiezlan/tsdice)
- **Desktop Version**: [desktop branch](https://github.com/zophiezlan/tsdice/tree/desktop)
- **tsParticles Docs**: [particles.js.org](https://particles.js.org)

---

## 💡 Quick Recipes

### Zen Mode

```
Chaos: 2 | Theme: Light | Gravity: Off | Walls: Off
Shuffle until: Circles + Pastel colors + Slow movement
```

### Matrix Rain

```
Chaos: 6 | Theme: Dark | Gravity: On | Walls: On
Shuffle until: Green lines + Downward direction
```

### Confetti

```
Chaos: 10 | Theme: Any | Gravity: On | Walls: On
Shuffle until: Multi-color + Diverse shapes
```

### Starfield

```
Chaos: 4 | Theme: Dark | Gravity: Off | Walls: Off
Shuffle until: Stars + Links enabled + Slow speed
```

---

## 📝 Common Patterns

### Command Factory Pattern

```javascript
const createShuffleCommand = (options) => ({
  async execute() {
    /* generate & load */
  },
  async undo() {
    /* restore old */
  },
});
```

### Toggle Factory Pattern

```javascript
const createToggleCommand = (stateKey, applyFn) => ({
  async execute() {
    AppState.ui[stateKey] = !AppState.ui[stateKey];
    await applyFn();
  },
  async undo() {
    await this.execute();
  },
});
```

### Debounce Pattern

```javascript
const debouncedFn = debounce((arg) => {
  // Expensive operation
}, 500);
```

---

## 🎓 Learning Path

1. **Beginner**: Use GUI, explore shuffles
2. **Intermediate**: Learn keyboard shortcuts
3. **Advanced**: Create custom recipes
4. **Expert**: Modify source code, add features

---

## ⚠️ Gotchas

1. **History limit**: Only 20 steps
2. **URL length**: Configs too large may fail to share
3. **Browser support**: Requires ES6 modules
4. **Chaos 10**: May be laggy on old devices
5. **Share URLs**: Short URLs expire after ~1 year

---

**For full details, see:**

- 📖 [User Guide](USER_GUIDE.md) — How to use tsDice
- 🏗️ [Architecture](ARCHITECTURE.md) — How it works
- 📊 [Analysis](ANALYSIS.md) — Complete technical overview
- 📄 [README](README.md) — Project overview

---

**Now go create something beautiful!** ✨
