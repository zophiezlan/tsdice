# 🏛️ tsDice Architecture Guide

> A comprehensive deep dive into the design decisions, patterns, and technical implementation of tsDice.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Design Principles](#design-principles)
3. [Module Architecture](#module-architecture)
4. [Data Flow & State Management](#data-flow--state-management)
5. [Key Algorithms](#key-algorithms)
6. [Performance Considerations](#performance-considerations)
7. [Security & Privacy](#security--privacy)
8. [Extension Points](#extension-points)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                      │
│  (index.html + CSS Variables + Glassmorphism Design)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer (main.js)              │
│  • Event Orchestration    • Lifecycle Management            │
│  • Command Factory        • Modal Coordination              │
└────────┬─────────────────────┬──────────────────────────────┘
         │                     │
         ▼                     ▼
┌────────────────────┐  ┌────────────────────────────────────┐
│  UI Manager        │  │     Command Manager                │
│  • DOM Updates     │  │     • Undo/Redo Stack              │
│  • Feedback        │  │     • Command Execution            │
│  • Accessibility   │  │     • History Deduplication        │
└────────────────────┘  └────────────────────────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management (state.js)              │
│  • Single Source of Truth    • Reactive State Updates       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│             Business Logic Layer                           │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Config       │  │  Particles   │  │  Utilities      │  │
│  │  Generator    │  │  Service     │  │  (utils.js)     │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              tsParticles Engine (External)                  │
│  • Particle Rendering    • Physics Engine                   │
│  • Interaction Handling  • Canvas Management                │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Separation of Concerns

Each module has a single, well-defined responsibility:

| Module                 | Responsibility                           | Dependencies             |
| ---------------------- | ---------------------------------------- | ------------------------ |
| `main.js`              | Application orchestration, event binding | All modules              |
| `state.js`             | State storage (no logic)                 | None                     |
| `uiManager.js`         | DOM manipulation, accessibility          | State                    |
| `commandManager.js`    | Undo/redo logic                          | UI Manager               |
| `configGenerator.js`   | Randomization algorithms                 | State, Constants, Utils  |
| `particlesService.js`  | tsParticles API abstraction              | State, Config Generator  |
| `modalManager.js`      | Modal lifecycle & focus management       | UI Manager               |
| `tooltipManager.js`    | Tooltip positioning & timing             | Constants                |
| `keyboardShortcuts.js` | Global keyboard event handling           | Constants, Modal Manager |
| `utils.js`             | Pure utility functions                   | None                     |
| `constants.js`         | Static data arrays                       | None                     |

### 2. Unidirectional Data Flow

Data always flows in one direction, preventing circular dependencies:

```
User Input → Event Handler → Command Factory → Command Manager
                                                     ↓
                                              Execute Command
                                                     ↓
                                        Update AppState (state.js)
                                                     ↓
                                        Generate/Apply Config (configGenerator + particlesService)
                                                     ↓
                                        Sync UI (uiManager.js)
                                                     ↓
                                              Visual Feedback
```

### 3. Command Pattern for Time Travel

Every stateful action implements the Command interface:

```javascript
interface Command {
  execute(): Promise<void>; // Apply the change
  undo(): Promise<void>; // Revert the change
}
```

This enables:

- **Undo/Redo**: Infinite history stack
- **Deduplication**: Identical consecutive configs are skipped
- **Encapsulation**: Each command captures its own before/after state

### 4. Immutability Where Possible

- Configs are deep-cloned using `structuredClone()` before mutation
- Original interaction modes stored separately for restoration
- No direct mutation of `AppState` outside designated functions

### 5. Progressive Enhancement

- Works without JavaScript (shows basic HTML)
- Keyboard shortcuts enhance mouse interaction
- Tooltips provide context but aren't required
- Reduced motion preferences honored automatically

---

## Module Architecture

### Core Modules

#### `state.js` — The Single Source of Truth

```javascript
export const AppState = {
  ui: {
    isDarkMode: boolean,
    isCursorParticle: boolean,
    isGravityOn: boolean,
    areWallsOn: boolean,
    isPaused: boolean,
    lastFocusedElement: HTMLElement | null,
    particlesContainer: Container | null,
  },
  particleState: {
    chaosLevel: 1 - 10,
    currentConfig: object,
    originalInteractionModes: object,
    originalOutModes: object,
    initialConfigFromUrl: object | null,
  },
};
```

**Why this structure?**

- Clear namespace separation between UI state and particle state
- Easy to serialize for debugging
- Single import point for all modules

#### `configGenerator.js` — The Randomization Engine

Four pure functions that generate particle config sections:

```javascript
ConfigGenerator = {
  generateAppearance(): object
  generateMovement(): object
  generateInteraction(): object
  generateSpecialFX(currentFx?: object): object
}
```

**Key Insight**: Each generator uses chaos level to scale randomness:

```javascript
// Base probability increases with chaos
getChaosProbability(baseProb, chaosLevel);

// Example: Collision probability
enable: getRandomBool(getChaosProbability(0.6, chaosLevel));
// Chaos 1 → 12% chance
// Chaos 5 → 60% chance
// Chaos 10 → 100% chance
```

#### `particlesService.js` — The tsParticles Abstraction Layer

Isolates all tsParticles interactions behind a clean API:

```javascript
export const particlesService = {
  buildConfig(shuffleOptions): object,
  loadParticles(config): Promise<void>,
  reapplyToggleStates(config): void,
  applyCursorMode(): void,
  applyWallsMode(): void,
  applyGravityMode(): void,
  updateThemeAndReload(): Promise<void>
};
```

**Why abstract tsParticles?**

- Future-proof against API changes
- Centralize error handling
- Enable configuration validation
- Provide loading indicators for async operations

#### `commandManager.js` — Time Travel Implementation

```javascript
CommandManager = {
  undoStack: Command[],  // Infinite history
  redoStack: Command[],

  execute(command): void,   // Run + add to undo stack
  undo(): void,             // Pop undo, push to redo
  redo(): void              // Pop redo, push to undo
};
```

**Deduplication Logic**:

```javascript
// Only deduplicate shuffle commands with configs
if (lastCommand.newConfig && newCommand.newConfig) {
  if (JSON.stringify(lastConfig) === JSON.stringify(newConfig)) {
    return; // Skip duplicate
  }
}
```

#### `uiManager.js` — The View Layer

Centralized DOM manipulation prevents scattered jQuery-style code:

```javascript
UIManager = {
  announce(message: string): void,              // Screen reader
  showToast(message: string): void,             // Visual feedback
  updateFullscreenIcons(): void,                // Icon swap
  populateInfoModal(): void,                    // Dynamic content
  openModal(modal: Element, opener: Element): void,
  closeModal(modal: Element): void,
  showLoadingIndicator(): void,
  hideLoadingIndicator(): void,
  syncUI(): void                                // Complete state sync
};
```

**The `syncUI()` Pattern**:
Instead of ad-hoc DOM updates, one function syncs **everything**:

- Theme class toggle
- Button active states
- Slider position
- ARIA attributes
- History button states

Called after **every state change**, guaranteeing UI consistency.

---

## Data Flow & State Management

### Shuffle Flow (Complete Walkthrough)

```javascript
// 1. USER CLICKS "Shuffle All"
subMenu.addEventListener("click", (e) => {
  if (button.id === BUTTON_IDS.SHUFFLE_ALL) {
    // 2. CREATE SHUFFLE COMMAND
    const command = createShuffleCommand({ all: true });

    // 3. EXECUTE VIA COMMAND MANAGER
    CommandManager.execute(command);
  }
});

// Inside createShuffleCommand:
const createShuffleCommand = (shuffleOptions) => {
  const oldConfig = structuredClone(AppState.particleState.currentConfig);
  const oldUIStates = {
    /* capture gravity, walls, cursor states */
  };

  return {
    async execute() {
      // 4. GENERATE NEW CONFIG
      newConfig = buildConfig(shuffleOptions);

      // 5. VISUAL EFFECT (optional burst)
      container.style.filter = "brightness(1.3)";
      setTimeout(() => (container.style.filter = ""), 150);

      // 6. LOAD INTO tsParticles
      await loadParticles(newConfig);

      // 7. ANNOUNCE TO SCREEN READERS
      UIManager.announce("New scene generated.");
    },

    async undo() {
      // 8. RESTORE OLD STATE
      AppState.particleState.currentConfig = oldConfig;
      await loadParticles(oldConfig);
      UIManager.showToast("Undid shuffle");
    },
  };
};

// Inside buildConfig:
const buildConfig = (shuffleOptions) => {
  let config = {};

  // 9. CALL APPROPRIATE GENERATORS
  if (shuffleOptions.all) {
    config.particles = {
      ...ConfigGenerator.generateAppearance(),
      move: ConfigGenerator.generateMovement(),
      ...ConfigGenerator.generateSpecialFX(),
    };
    config.interactivity = ConfigGenerator.generateInteraction();
  }

  // 10. APPLY THEME & PARTICLE COUNT
  config.background = { color: { value: isDarkMode ? "#111" : "#f0f0f0" } };
  config.particles.number = { value: 20 + chaosLevel * 20 };

  // 11. REAPPLY UI TOGGLES
  reapplyToggleStates(config);

  return config;
};

// Inside loadParticles:
const loadParticles = async (config) => {
  // 12. SHOW LOADING (IF > 300ms)
  const loadingTimeout = setTimeout(
    () => UIManager.showLoadingIndicator(),
    300
  );

  // 13. SAVE TO LOCAL STORAGE
  localStorage.setItem("tsDiceLastConfig", JSON.stringify(config));

  // 14. INITIALIZE tsParticles
  AppState.ui.particlesContainer = await tsParticles.load({
    id: "tsparticles",
    options: config,
  });

  // 15. SYNC UI STATE
  UIManager.syncUI();

  clearTimeout(loadingTimeout);
  UIManager.hideLoadingIndicator();
};
```

### Toggle Flow (Gravity Example)

```javascript
// 1. USER CLICKS GRAVITY BUTTON
case BUTTON_IDS.GRAVITY:
  CommandManager.execute(
    createToggleCommand('isGravityOn', async () => {

      // 2. UPDATE STATE
      AppState.ui.isGravityOn = !AppState.ui.isGravityOn;

      // 3. APPLY TO CONFIG
      applyGravityMode();

      // 4. RELOAD PARTICLES
      await loadParticles(AppState.particleState.currentConfig);

      // 5. SHOW FEEDBACK
      UIManager.showToast(`Gravity ${AppState.ui.isGravityOn ? 'enabled' : 'disabled'}`);
    })
  );

// Inside applyGravityMode:
const applyGravityMode = () => {
  const config = AppState.particleState.currentConfig;
  if (!config.particles.move.gravity) config.particles.move.gravity = {};

  // 6. SET GRAVITY CONFIG
  config.particles.move.gravity.enable = AppState.ui.isGravityOn;
  config.particles.move.gravity.acceleration = AppState.ui.isGravityOn ? 20 : 0;
};
```

---

## Key Algorithms

### 1. Chaos Probability Scaling

```javascript
/**
 * Scales a base probability by the chaos level.
 * Formula: min(baseProb * (chaosLevel / 5), 1)
 *
 * @param {number} baseProb - Base probability (0.0 to 1.0)
 * @param {number} chaosLevel - User's chaos setting (1 to 10)
 * @returns {number} Scaled probability (0.0 to 1.0)
 */
const getChaosProbability = (baseProb, chaosLevel) =>
  Math.min(baseProb * (chaosLevel / 5), 1);

// Example: Enable wobble effect
wobble: {
  enable: getRandomBool(getChaosProbability(0.5, chaosLevel)),
  // Chaos 1: 10% chance (0.5 * 0.2)
  // Chaos 5: 50% chance (0.5 * 1.0)
  // Chaos 10: 100% chance (capped at 1.0)
}
```

**Why this formula?**

- Linear scaling keeps user expectations consistent
- Division by 5 makes chaos 5 the "neutral" point (100% of base probability)
- Cap at 1.0 prevents probabilities > 100%

### 2. URL Compression Pipeline

```javascript
/**
 * Share flow: Config → JSON → Compressed → Base64 → Short URL
 */
const shareConfig = async () => {
  // 1. Prepare shareable config (includes UI state)
  const sharableConfig = {
    ...currentConfig,
    uiState: { chaosLevel, isDarkMode, isGravityOn, areWallsOn, isCursorParticle }
  };

  // 2. Serialize to JSON
  const jsonString = JSON.stringify(sharableConfig);

  // 3. Compress using lz-string (LZMA algorithm)
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  // 4. Build full URL
  const fullUrl = `${window.location.href.split('#')[0]}#config=${compressed}`;

  // 5. Shorten via API (8 random emojis)
  const shortUrl = await createEmojiShortUrl(fullUrl);

  // 6. Copy to clipboard
  await copyToClipboard(shortUrl || fullUrl);
};

/**
 * Load flow: Short URL → Full URL → Decompress → Parse → Apply
 */
const loadFromUrl = () => {
  if (window.location.hash.startsWith('#config=')) {
    // 1. Extract compressed string
    const compressed = window.location.hash.substring(8);

    // 2. Decompress
    const jsonString = LZString.decompressFromEncodedURIComponent(compressed);

    // 3. Parse JSON
    const config = JSON.parse(jsonString);

    // 4. Extract UI state
    if (config.uiState) {
      AppState.particleState.chaosLevel = config.uiState.chaosLevel || 5;
      AppState.ui.isDarkMode = config.uiState.isDarkMode !== false;
      // ... restore other UI states
      delete config.uiState;
    }

    // 5. Load particles
    await loadParticles(config);
  }
};
```

**Compression Ratio**: Typical config (5KB) → Compressed (1-2KB) → ~60-75% size reduction

### 3. Toggle State Persistence

The challenge: How do we preserve gravity/walls/cursor settings across shuffles?

**Solution: Shadow State Pattern**

```javascript
/**
 * Before applying a toggle, store the original config value.
 * When toggle is disabled, restore the original value.
 */

// WALLS TOGGLE EXAMPLE:
const applyWallsMode = () => {
  if (AppState.ui.areWallsOn) {
    // 1. Store original out modes (if not already stored)
    if (!AppState.particleState.originalOutModes.default) {
      AppState.particleState.originalOutModes = structuredClone(
        config.particles.move.outModes
      );
    }

    // 2. Override with bounce
    config.particles.move.outModes = { default: "bounce" };
  } else {
    // 3. Restore original out modes
    config.particles.move.outModes = structuredClone(
      AppState.particleState.originalOutModes
    );

    // 4. Clear stored state
    AppState.particleState.originalOutModes = {};
  }
};

// This pattern ensures:
// - Shuffle → Walls On → Shuffle → Walls still on + new particles respect walls
// - Shuffle → Walls On → Shuffle → Walls Off → Original out mode restored
```

### 4. Debouncing for Performance

```javascript
/**
 * Debounce prevents excessive function calls during rapid input.
 * Only executes after user stops interacting for `wait` milliseconds.
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Usage: Chaos slider
chaosSlider.addEventListener("input", (e) => {
  AppState.particleState.chaosLevel = parseInt(e.target.value);

  // Announce after 300ms of no changes (prevents spam)
  debouncedAnnounce(chaosLevel);

  // Save to localStorage after 500ms (prevents excessive writes)
  debouncedSave(chaosLevel);
});
```

---

## Performance Considerations

### 1. Event Delegation

Instead of 17 individual click listeners, **one listener** handles all buttons:

```javascript
subMenu.addEventListener("click", (e) => {
  const button = e.target.closest(".menu-button");
  if (!button) return;

  switch (button.id) {
    case BUTTON_IDS.SHUFFLE_ALL: /* ... */
    case BUTTON_IDS.SHUFFLE_APPEARANCE: /* ... */
    // ... etc
  }
});
```

**Benefits**:

- Fewer memory allocations
- Dynamic button additions don't need new listeners
- Easier to debug (single entry point)

### 2. Lazy Loading Indicators

Loading spinners only appear if operation takes > 300ms:

```javascript
const loadingTimeout = setTimeout(() => {
  UIManager.showLoadingIndicator();
}, 300);

await tsParticles.load(config);

clearTimeout(loadingTimeout);
UIManager.hideLoadingIndicator();
```

**Why 300ms?**  
Research shows users perceive delays > 300ms as "slow". Below that, spinners are distracting.

### 3. Structured Clone Instead of JSON

```javascript
// ❌ Slow: JSON stringify/parse loses functions, regexes, undefined
const copy = JSON.parse(JSON.stringify(obj));

// ✅ Fast: Native structured clone (Chrome 98+)
const copy = structuredClone(obj);
```

### 4. CSS Transitions Over JavaScript Animations

All UI animations use CSS transitions:

```css
.glass-button {
  transition: all 0.3s ease;
}

.modal-content {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

**Benefits**:

- Hardware accelerated (GPU)
- Automatically handles interruptions
- Respects `prefers-reduced-motion`

### 5. Reduced Motion Support

```javascript
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if (motionQuery.matches) {
  // Auto-pause animations
  container.pause();
}
```

### 6. Memory Leak Prevention

```javascript
window.addEventListener("beforeunload", () => {
  if (AppState.ui.particlesContainer) {
    AppState.ui.particlesContainer.destroy();
  }
});
```

---

## Security & Privacy

### Data Privacy

- **No Analytics**: Zero tracking or telemetry
- **No Cookies**: All state in localStorage (user-controlled)
- **No Server Communication**: Except optional emoji URL shortening
- **No PII Collection**: No user data ever leaves the browser

### Content Security Policy

Could add to `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline';"
/>
```

### Input Validation

```javascript
// Chaos slider validation
const newValue = parseInt(e.target.value, 10);
if (newValue < 1 || newValue > 10 || isNaN(newValue)) {
  console.warn("Invalid chaos level:", newValue);
  return;
}
```

### URL Decompression Safety

```javascript
try {
  const decodedString = LZString.decompressFromEncodedURIComponent(hash);
  const parsedConfig = JSON.parse(decodedString);

  // Validate structure
  if (!parsedConfig || typeof parsedConfig !== "object") {
    throw new Error("Invalid config structure");
  }

  if (!parsedConfig.particles || !parsedConfig.interactivity) {
    throw new Error("Missing required config properties");
  }

  // Safe to use
  await loadParticles(parsedConfig);
} catch (e) {
  console.error("Failed to parse config from URL:", e);
  window.location.hash = "";
  UIManager.showToast("Invalid shared configuration link");
}
```

---

## Extension Points

### Adding a New Shuffle Category

**Example: Adding "Audio Reactive" Shuffle**

1. **Add to `configGenerator.js`:**

```javascript
generateAudio: () => ({
  responsive: [
    {
      maxWidth: 768,
      options: {
        /* mobile-specific settings */
      },
    },
  ],
  // Add audio-reactive settings here
  // (Would require tsParticles audio plugin)
});
```

2. **Add Button to `index.html`:**

```html
<div
  class="glass-button menu-button"
  id="btn-shuffle-audio"
  title="Shuffle Audio (Alt+U): Randomizes audio-reactive properties"
>
  <!-- Add icon SVG -->
</div>
```

3. **Add Event Handler in `main.js`:**

```javascript
case BUTTON_IDS.SHUFFLE_AUDIO:
  CommandManager.execute(createShuffleCommand({ audio: true }));
  break;
```

4. **Update `buildConfig()` in `particlesService.js`:**

```javascript
if (shuffleOptions.audio) {
  Object.assign(newConfig, ConfigGenerator.generateAudio());
}
```

### Adding a New Toggle

**Example: Adding "Fullscreen" Toggle**

1. **Add to `state.js`:**

```javascript
ui: {
  // ... existing properties
  isFullscreen: false;
}
```

2. **Add Button & Handler in `main.js`:**

```javascript
case BUTTON_IDS.FULLSCREEN_TOGGLE:
  CommandManager.execute(
    createToggleCommand('isFullscreen', async () => {
      if (AppState.ui.isFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    })
  );
  break;
```

3. **Update `UIManager.syncUI()`:**

```javascript
document
  .getElementById(BUTTON_IDS.FULLSCREEN_TOGGLE)
  .classList.toggle("active", AppState.ui.isFullscreen);
```

### Adding a New Keyboard Shortcut

In `keyboardShortcuts.js`:

```javascript
const btnId = {
  // ... existing shortcuts
  u: BUTTON_IDS.SHUFFLE_AUDIO, // Alt+U for audio shuffle
}[e.key.toLowerCase()];
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] All shuffle buttons generate different configs
- [ ] Undo/redo preserves exact state
- [ ] Toggles persist across shuffles
- [ ] Share URLs decompress correctly
- [ ] Keyboard shortcuts work
- [ ] Mobile touch events responsive
- [ ] Reduced motion honors user preference
- [ ] Screen reader announces state changes
- [ ] Focus trap works in modals

### Automated Testing (Future)

Could add:

- Unit tests for `utils.js` pure functions
- Integration tests for command execution
- Visual regression tests for UI states
- Performance benchmarks for config generation

---

## Conclusion

tsDice's architecture balances **simplicity** with **sophistication**:

- Modular design enables easy maintenance
- Command pattern provides powerful undo/redo
- Pure functions ensure predictability
- Accessibility baked in from the start
- Performance optimizations where they matter

The codebase serves as a **teaching tool** for modern JavaScript patterns and a **production-ready** creative application.

---

**Questions? Open a GitHub Discussion!**
