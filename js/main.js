import { tsParticles } from "https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.4.0/+esm";
import { loadAll } from "https://cdn.jsdelivr.net/npm/@tsparticles/all@3.4.0/+esm";
import { AppState } from "./state.js";
import { UIManager } from "./uiManager.js";
import { ConfigGenerator } from "./configGenerator.js";
import { CommandManager } from "./commandManager.js";
import { copyToClipboard, getRandomItem } from "./utils.js";
import {
  emojiOptions,
  darkColorPalette,
  lightColorPalette,
  BUTTON_IDS,
} from "./constants.js";

// Main async function to encapsulate the entire application logic.
(async () => {
  // Must be called before any other tsParticles calls.
  await loadAll(tsParticles);

  // --- 1. ELEMENT SELECTORS ---
  const mainMenuBtn = document.getElementById(BUTTON_IDS.MAIN_MENU);
  const menuContainer = document.getElementById("menu-container");
  const subMenu = document.getElementById("sub-menu");
  const chaosSlider = document.getElementById("chaos-slider");
  const welcomeModal = document.getElementById("welcome-modal");
  const closeModalBtn = document.getElementById("close-welcome-modal");
  const infoModal = document.getElementById("info-modal");
  const closeInfoModalBtn = document.getElementById("close-info-modal");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  // --- 2. TOOLTIP SETUP ---
  const tooltip = document.createElement("div");
  tooltip.id = "custom-tooltip";
  document.body.appendChild(tooltip);

  // --- 3. CORE LOGIC FUNCTIONS ---

  /** Generates a random string of emojis for the short URL. */
  const generateRandomEmojiString = (count) => {
    let emojiString = "";
    // Loop 'count' times instead of a fixed number
    for (let i = 0; i < count; i++) {
      emojiString += getRandomItem(emojiOptions);
    }
    return emojiString;
  };

  /** Creates a short URL using the my.ket.horse API with smart emoji selection */
  async function createEmojiShortUrl(longUrl) {
    try {
      // Prepare config data for smart emoji selection
      const configData = {
        particles: AppState.particleState.currentConfig?.particles?.number?.value || 0,
        isDarkMode: AppState.ui.isDarkMode,
        isGravityOn: AppState.ui.isGravityOn,
        areWallsOn: AppState.ui.areWallsOn,
        isCursorParticle: AppState.ui.isCursorParticle,
        chaosLevel: AppState.particleState.chaosLevel,
        // Include color info if available
        color: AppState.particleState.currentConfig?.particles?.color?.value,
        // Include shape info if available
        shape: AppState.particleState.currentConfig?.particles?.shape?.type,
      };

      const response = await fetch("https://my.ket.horse/api/tsdice/share", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          url: longUrl,
          config: JSON.stringify(configData),
        }),
      });
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);
      return (await response.json()).short_url;
    } catch (error) {
      console.error("Failed to create emoji short URL:", error);
      return null;
    }
  }

  /** Assembles a complete tsParticles configuration object based on shuffle options. */
  const buildConfig = (shuffleOptions) => {
    const isNew =
      !AppState.particleState.currentConfig ||
      Object.keys(AppState.particleState.currentConfig).length === 0;
    let newConfig = isNew ? {} : { ...AppState.particleState.currentConfig };

    if (shuffleOptions.all || isNew) {
      newConfig.particles = {
        ...ConfigGenerator.generateAppearance(),
        move: ConfigGenerator.generateMovement(),
        ...ConfigGenerator.generateSpecialFX(),
      };
      newConfig.interactivity = ConfigGenerator.generateInteraction();
    } else {
      newConfig.particles = { ...newConfig.particles };
      if (shuffleOptions.appearance)
        Object.assign(
          newConfig.particles,
          ConfigGenerator.generateAppearance()
        );
      if (shuffleOptions.movement)
        newConfig.particles.move = {
          ...newConfig.particles.move,
          ...ConfigGenerator.generateMovement(),
        };
      if (shuffleOptions.interaction)
        newConfig.interactivity = ConfigGenerator.generateInteraction();
      if (shuffleOptions.fx) {
        const fx = ConfigGenerator.generateSpecialFX(newConfig.particles);
        Object.assign(newConfig.particles, fx);
        newConfig.interactivity = ConfigGenerator.generateInteraction();
      }
    }

    Object.assign(newConfig, {
      background: {
        color: { value: AppState.ui.isDarkMode ? "#111" : "#f0f0f0" },
      },
      fpsLimit: 120,
      detectRetina: true,
    });
    if (!newConfig.particles.move.gravity)
      newConfig.particles.move.gravity = {};
    newConfig.particles.move.gravity.enable = AppState.ui.isGravityOn;
    newConfig.particles.move.gravity.acceleration = AppState.ui.isGravityOn
      ? 20
      : 0;
    newConfig.particles.number = {
      value: 20 + AppState.particleState.chaosLevel * 20,
    };
    return newConfig;
  };

  /** Loads a given configuration into the tsParticles instance. */
  const loadParticles = async (config) => {
    AppState.particleState.currentConfig = config;
    localStorage.setItem("tsDiceLastConfig", JSON.stringify(config));
    AppState.ui.particlesContainer = await tsParticles.load({
      id: "tsparticles",
      options: JSON.parse(JSON.stringify(config)),
    });
    AppState.ui.isPaused = false;
    UIManager.syncUI();
  };

  /** Applies or removes the cursor particle effect based on the current state. */
  const applyCursorMode = () => {
    const config = AppState.particleState.currentConfig;
    if (AppState.ui.isCursorParticle) {
      config.interactivity.modes.trail = {
        delay: 0.05,
        quantity: 1,
        pauseOnStop: true,
      };
      config.interactivity.events.onHover.mode = "trail";
      config.interactivity.events.onClick.enable = false;
    } else {
      config.interactivity.events.onHover.mode =
        AppState.particleState.originalInteractionModes.hover || "repulse";
      config.interactivity.events.onClick.enable = true;
    }
  };

  /** Handles the logic for toggling the application's color theme. */
  const updateTheme = async () => {
    AppState.ui.isDarkMode = !AppState.ui.isDarkMode;
    localStorage.setItem(
      "tsDiceTheme",
      AppState.ui.isDarkMode ? "dark" : "light"
    );
    UIManager.announce(
      AppState.ui.isDarkMode ? "Dark theme enabled" : "Light theme enabled"
    );

    const config = AppState.particleState.currentConfig;
    if (!config || Object.keys(config).length === 0) {
      UIManager.syncUI();
      return;
    }

    const newPalette = AppState.ui.isDarkMode
      ? darkColorPalette
      : lightColorPalette;
    config.background.color.value = AppState.ui.isDarkMode ? "#111" : "#f0f0f0";
    if (config.particles.color.value !== "random")
      config.particles.color.value = getRandomItem(newPalette);
    if (config.particles.links.enable)
      config.particles.links.color.value = AppState.ui.isDarkMode
        ? "#ffffff"
        : "#333333";
    if (config.particles.move.trail.enable)
      config.particles.move.trail.fill.color.value = AppState.ui.isDarkMode
        ? "#111"
        : "#f0f0f0";
    await loadParticles(config);
  };

  /** Toggles fullscreen mode for the browser window. */
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  /** Traps focus within a modal for accessibility. */
  const trapFocus = (e, modal) => {
    if (e.key !== "Tab") return;
    const focusableElements = modal.querySelectorAll("button, [href]");
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  // --- 4. COMMAND PATTERN IMPLEMENTATION ---

  /** Factory function to create a shuffle command object. */
  const createShuffleCommand = (shuffleOptions) => {
    const oldConfig = structuredClone(AppState.particleState.currentConfig);
    let newConfig = null;
    return {
      async execute() {
        if (!newConfig) newConfig = buildConfig(shuffleOptions);
        await loadParticles(newConfig);
        UIManager.announce("New scene generated.");
      },
      async undo() {
        await loadParticles(oldConfig);
      },
    };
  };

  /** Factory function to create a command for simple boolean state toggles. */
  const createToggleCommand = (stateKey, applyFn) => ({
    async execute() {
      AppState.ui[stateKey] = !AppState.ui[stateKey];
      await applyFn();
      const stateName = stateKey
        .replace("is", "")
        .replace("On", "")
        .replace("Particle", "");
      UIManager.announce(
        `${stateName} ${AppState.ui[stateKey] ? "enabled" : "disabled"}`
      );
    },
    async undo() {
      await this.execute();
    }, // Toggle is its own inverse
  });

  /** Factory function to create a command for toggling the theme. */
  const createThemeCommand = () => ({
    async execute() {
      await updateTheme();
    },
    async undo() {
      await updateTheme();
    },
  });

  /** Sets up event listeners for a modal to handle closing. */
  const setupModal = (modal, closeButton, onDismiss) => {
    closeButton.addEventListener("click", onDismiss);
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") onDismiss();
      else trapFocus(e, modal);
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) onDismiss();
    });
  };

  // --- 5. EVENT LISTENERS ---
  mainMenuBtn.addEventListener("click", () => {
    const isActive = menuContainer.classList.toggle("active");
    mainMenuBtn.setAttribute("aria-pressed", isActive);
    mainMenuBtn.setAttribute(
      "aria-label",
      isActive ? "Close Settings Menu" : "Open Settings Menu"
    );
    if (isActive) {
      document.getElementById(BUTTON_IDS.SHUFFLE_ALL).focus();
    } else {
      mainMenuBtn.focus(); // Return focus on close
    }
  });

  /** Main event listener for the control panel, using event delegation for performance. */
  subMenu.addEventListener("click", (e) => {
    const button = e.target.closest(".menu-button");
    if (!button) return;

    switch (button.id) {
      case BUTTON_IDS.SHUFFLE_ALL:
        CommandManager.execute(createShuffleCommand({ all: true }));
        break;
      case BUTTON_IDS.SHUFFLE_APPEARANCE:
        CommandManager.execute(createShuffleCommand({ appearance: true }));
        break;
      case BUTTON_IDS.SHUFFLE_MOVEMENT:
        CommandManager.execute(createShuffleCommand({ movement: true }));
        break;
      case BUTTON_IDS.SHUFFLE_INTERACTION:
        CommandManager.execute(createShuffleCommand({ interaction: true }));
        break;
      case BUTTON_IDS.SHUFFLE_FX:
        CommandManager.execute(createShuffleCommand({ fx: true }));
        break;
      case BUTTON_IDS.BACK:
        CommandManager.undo();
        break;
      case BUTTON_IDS.FORWARD:
        CommandManager.redo();
        break;
      case BUTTON_IDS.THEME:
        CommandManager.execute(createThemeCommand());
        break;
      case BUTTON_IDS.GRAVITY:
        CommandManager.execute(
          createToggleCommand("isGravityOn", async () => {
            const config = AppState.particleState.currentConfig;
            config.particles.move.gravity.enable = AppState.ui.isGravityOn;
            config.particles.move.gravity.acceleration = AppState.ui.isGravityOn
              ? 20
              : 0;
            await loadParticles(config);
          })
        );
        break;
      case BUTTON_IDS.WALLS:
        CommandManager.execute(
          createToggleCommand("areWallsOn", async () => {
            const config = AppState.particleState.currentConfig;
            if (!config.particles) return;
            if (AppState.ui.areWallsOn) {
              AppState.particleState.originalOutModes = structuredClone(
                config.particles.move.outModes
              );
              config.particles.move.outModes = { default: "bounce" };
            } else {
              config.particles.move.outModes =
                AppState.particleState.originalOutModes;
            }
            await loadParticles(config);
          })
        );
        break;
      case BUTTON_IDS.CURSOR:
        CommandManager.execute(
          createToggleCommand("isCursorParticle", async () => {
            applyCursorMode();
            await loadParticles(AppState.particleState.currentConfig);
          })
        );
        break;
      case BUTTON_IDS.REFRESH:
        (async () => {
          const config = AppState.particleState.currentConfig;
          if (config && Object.keys(config).length > 0) {
            await loadParticles(config);
            UIManager.showToast("Scene refreshed!");
            UIManager.announce("Scene refreshed");
          }
        })();
        break;
      case BUTTON_IDS.PAUSE:
        (() => {
          const container = AppState.ui.particlesContainer;
          if (!container) return;
          AppState.ui.isPaused = !AppState.ui.isPaused;
          if (AppState.ui.isPaused) container.pause();
          else container.play();
          UIManager.syncUI();
          UIManager.announce(
            AppState.ui.isPaused ? "Animation paused" : "Animation resumed"
          );
        })();
        break;
      case BUTTON_IDS.SHARE:
        (async () => {
          const sharableConfig = structuredClone(
            AppState.particleState.currentConfig
          );
          sharableConfig.uiState = {
            chaosLevel: AppState.particleState.chaosLevel,
            isDarkMode: AppState.ui.isDarkMode,
            isCursorParticle: AppState.ui.isCursorParticle,
            isGravityOn: AppState.ui.isGravityOn,
            areWallsOn: AppState.ui.areWallsOn,
            originalOutModes: AppState.ui.areWallsOn
              ? AppState.particleState.originalOutModes
              : undefined,
          };
          try {
            button.classList.add("disabled");
            UIManager.showToast("Creating shareable link...");
            UIManager.announce("Creating shareable link...");
            const compressedConfig = LZString.compressToEncodedURIComponent(
              JSON.stringify(sharableConfig)
            );
            const fullUrl = `${
              window.location.href.split("#")[0]
            }#config=${compressedConfig}`;
            const shortUrl = await createEmojiShortUrl(fullUrl);
            if (shortUrl) {
              await copyToClipboard(shortUrl);
              UIManager.showToast("Short emoji link copied!");
              UIManager.announce("Short emoji link copied!");
            } else {
              await copyToClipboard(fullUrl);
              UIManager.showToast(
                "Shortening failed. Full link copied instead."
              );
              UIManager.announce("Full link copied.");
            }
          } catch (e) {
            UIManager.showToast("Could not create share link.");
            UIManager.announce("Error creating share link.");
            console.error("Share error:", e);
          } finally {
            button.classList.remove("disabled");
          }
        })();
        break;
      case BUTTON_IDS.INFO:
        UIManager.populateInfoModal();
        UIManager.openModal(infoModal, button);
        break;
    }
  });

  chaosSlider.addEventListener("input", (e) => {
    AppState.particleState.chaosLevel = parseInt(e.target.value, 10);
    UIManager.syncUI();
    UIManager.announce(`Chaos level ${AppState.particleState.chaosLevel}`);
    localStorage.setItem("tsDiceChaos", AppState.particleState.chaosLevel);
  });

  /** Helper function to dismiss the welcome modal and set the timestamp. */
  const dismissWelcomeModal = () => {
    UIManager.closeModal(welcomeModal);
    localStorage.setItem("tsDiceWelcomeTimestamp", Date.now());
  };

  setupModal(welcomeModal, closeModalBtn, dismissWelcomeModal);
  setupModal(infoModal, closeInfoModalBtn, () =>
    UIManager.closeModal(infoModal)
  );

  fullscreenBtn.addEventListener("click", toggleFullScreen);
  document.addEventListener(
    "fullscreenchange",
    UIManager.updateFullscreenIcons
  );

  // --- Tooltip Logic ---
  function updateTooltipPosition(mouseX, mouseY) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 15;
    let top = mouseY - tooltipRect.height - padding;
    let left = mouseX - tooltipRect.width / 2;

    if (top < padding) top = mouseY + padding;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding)
      left = window.innerWidth - tooltipRect.width - padding;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  subMenu.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".menu-button, .slider-container");
    if (!target || !target.title) return;
    target.setAttribute("data-title", target.title);
    target.removeAttribute("title");
    const titleText = target.getAttribute("data-title");
    const shortcutMatch = titleText.match(/\(([^)]+)\)/);
    const cleanTitle = titleText.replace(/\s*\(([^)]+)\)/, "");
    const [name, description] = cleanTitle.split(": ");

    tooltip.innerHTML = ""; // Clear previous content
    const strong = document.createElement("strong");
    strong.textContent = name + " ";

    if (shortcutMatch) {
      const code = document.createElement("code");
      code.textContent = shortcutMatch[1];
      strong.appendChild(code);
    }

    const span = document.createElement("span");
    span.textContent = description || "";

    tooltip.appendChild(strong);
    tooltip.appendChild(span);

    tooltip.classList.add("visible");
    updateTooltipPosition(e.clientX, e.clientY);
  });

  subMenu.addEventListener("mouseout", (e) => {
    const target = e.target.closest(".menu-button, .slider-container");
    if (!target || !target.getAttribute("data-title")) return;
    tooltip.classList.remove("visible");
    target.setAttribute("title", target.getAttribute("data-title"));
    target.removeAttribute("data-title");
  });

  subMenu.addEventListener("mousemove", (e) => {
    if (tooltip.classList.contains("visible"))
      updateTooltipPosition(e.clientX, e.clientY);
  });

  // --- 6. ACCESSIBILITY - KEYBOARD ACTIVATION & SHORTCUTS ---
  document.querySelectorAll('[role="button"]').forEach((button) => {
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    });
  });

  chaosSlider.addEventListener("keydown", (e) => {
    let value = parseInt(chaosSlider.value, 10);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      chaosSlider.value = Math.max(1, value - 1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      chaosSlider.value = Math.min(10, value + 1);
    } else {
      return;
    }
    e.preventDefault();
    chaosSlider.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (welcomeModal.classList.contains("visible")) dismissWelcomeModal();
      if (infoModal.classList.contains("visible"))
        UIManager.closeModal(infoModal);
      return;
    }
    const activeEl = document.activeElement;
    const isInput =
      activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.isContentEditable;
    if (
      e.key === " " &&
      !isInput &&
      !menuContainer.classList.contains("active")
    ) {
      e.preventDefault();
      document.getElementById(BUTTON_IDS.PAUSE).click();
      return;
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const btnId = {
        m: BUTTON_IDS.MAIN_MENU,
        a: BUTTON_IDS.SHUFFLE_ALL,
        p: BUTTON_IDS.SHUFFLE_APPEARANCE,
        v: BUTTON_IDS.SHUFFLE_MOVEMENT,
        i: BUTTON_IDS.SHUFFLE_INTERACTION,
        f: BUTTON_IDS.SHUFFLE_FX,
        g: BUTTON_IDS.GRAVITY,
        w: BUTTON_IDS.WALLS,
        t: BUTTON_IDS.THEME,
        c: BUTTON_IDS.CURSOR,
        s: BUTTON_IDS.SHARE,
        "?": BUTTON_IDS.INFO,
        r: BUTTON_IDS.REFRESH,
        z: BUTTON_IDS.BACK,
        y: BUTTON_IDS.FORWARD,
      }[e.key.toLowerCase()];
      if (btnId) document.getElementById(btnId)?.click();
    }
  });

  // --- 7. INITIALISATION ---
  /** This section sets up the initial state of the application on load. */
  const savedTheme = localStorage.getItem("tsDiceTheme");
  AppState.ui.isDarkMode = savedTheme ? savedTheme === "dark" : true;

  const savedChaos = localStorage.getItem("tsDiceChaos");
  AppState.particleState.chaosLevel = savedChaos ? parseInt(savedChaos, 10) : 5;

  let initialConfigFromStorage = null;
  try {
    const savedConfigString = localStorage.getItem("tsDiceLastConfig");
    if (savedConfigString)
      initialConfigFromStorage = JSON.parse(savedConfigString);
  } catch (e) {
    console.error("Could not parse saved config from localStorage.", e);
    localStorage.removeItem("tsDiceLastConfig");
  }

  if (window.location.hash && window.location.hash.startsWith("#config=")) {
    try {
      const decodedString = LZString.decompressFromEncodedURIComponent(
        window.location.hash.substring(8)
      );
      if (decodedString) {
        const parsedConfig = JSON.parse(decodedString);
        if (parsedConfig.uiState) {
          AppState.particleState.chaosLevel =
            parsedConfig.uiState.chaosLevel || 5;
          AppState.ui.isDarkMode = parsedConfig.uiState.isDarkMode !== false;
          AppState.ui.isCursorParticle =
            !!parsedConfig.uiState.isCursorParticle;
          AppState.ui.isGravityOn = !!parsedConfig.uiState.isGravityOn;
          AppState.ui.areWallsOn = !!parsedConfig.uiState.areWallsOn;
          if (AppState.ui.areWallsOn)
            AppState.particleState.originalOutModes =
              parsedConfig.uiState.originalOutModes;
          delete parsedConfig.uiState;
        }
        AppState.particleState.initialConfigFromUrl = parsedConfig;
      } else {
        throw new Error("Decompression failed");
      }
    } catch (e) {
      window.location.hash = "";
    }
  }

  let configToLoad =
    AppState.particleState.initialConfigFromUrl ||
    initialConfigFromStorage ||
    buildConfig({ all: true });
  await loadParticles(configToLoad);

  UIManager.syncUI();

  // Show the welcome modal on first visit or after 24 hours have passed.
  const welcomeTimestamp = localStorage.getItem("tsDiceWelcomeTimestamp");
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // Milliseconds in 24 hours

  if (
    !welcomeTimestamp ||
    now - parseInt(welcomeTimestamp, 10) > twentyFourHours
  ) {
    setTimeout(() => UIManager.openModal(welcomeModal), 500);
  }

  // --- 8. REDUCED MOTION HANDLING ---
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handleReducedMotion = () => {
    const container = AppState.ui.particlesContainer;
    if (motionQuery.matches && container && !AppState.ui.isPaused) {
      container.pause();
      AppState.ui.isPaused = true;
      UIManager.syncUI();
      UIManager.announce("Animation paused due to reduced motion preference.");
    }
  };
  handleReducedMotion();
  motionQuery.addEventListener("change", handleReducedMotion);
})();
