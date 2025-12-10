import { tsParticles } from 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.9.1/+esm';
import { loadAll } from 'https://cdn.jsdelivr.net/npm/@tsparticles/all@3.9.1/+esm';
import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { ModalManager } from './modalManager.js';
import { initTooltipManager } from './tooltipManager.js';
import { CommandManager } from './commandManager.js';
import { copyToClipboard, getRandomItem, debounce } from './utils.js';
import { ErrorHandler, ErrorType } from './errorHandler.js';
import { StateManager, Actions } from './stateManager.js';
import { emojiOptions, BUTTON_IDS, AUTO_HIDE_DELAY } from './constants.js';
import { SafeStorage } from './storage.js';
import { Telemetry } from './telemetry.js';
import {
  buildConfig,
  loadParticles,
  applyCursorMode,
  applyWallsMode,
  applyGravityMode,
  updateThemeAndReload,
} from './particlesService.js';
import { initKeyboardShortcuts } from './keyboardShortcuts.js';

// Main async function to encapsulate the entire application logic.
(async () => {
  try {
    // Initialize tsParticles with error handling
    await loadAll(tsParticles);
  } catch (error) {
    console.error('Failed to load tsParticles library:', error);
    ErrorHandler.createFatalErrorUI(ErrorType.LIBRARY_LOAD, error);
    return;
  }

  // --- 1. ELEMENT SELECTORS ---
  const mainMenuBtn = document.getElementById(BUTTON_IDS.MAIN_MENU);
  const menuContainer = document.getElementById('menu-container');
  const subMenu = document.getElementById('sub-menu');
  const chaosSlider = document.getElementById('chaos-slider');
  const welcomeModal = document.getElementById('welcome-modal');
  const closeModalBtn = document.getElementById('close-welcome-modal');
  const infoModal = document.getElementById('info-modal');
  const closeInfoModalBtn = document.getElementById('close-info-modal');
  const btnInfo = document.getElementById(BUTTON_IDS.INFO);
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // --- 2. TOOLTIP SETUP ---
  initTooltipManager(subMenu);

  // --- 3. CORE LOGIC FUNCTIONS ---

  /**
   * Generates a random string of emojis for the short URL.
   * @param {number} count - Number of emojis to generate
   * @returns {string} Random emoji string
   */
  const generateRandomEmojiString = (count) => {
    let emojiString = '';
    for (let i = 0; i < count; i++) {
      emojiString += getRandomItem(emojiOptions);
    }
    return emojiString;
  };

  /**
   * Creates a short URL using the spoo.me API hosted on share.ket.horse.
   * Generates an 8-emoji shortened link for easier sharing.
   * @param {string} longUrl - The full URL to shorten
   * @returns {Promise<string|null>} The shortened URL or null if shortening fails
   */
  async function createEmojiShortUrl(longUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      Telemetry.log('share:shorten:start', { urlLength: longUrl.length });
      const response = await fetch('https://my.ket.horse/emoji', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: controller.signal,
        body: new URLSearchParams({
          url: longUrl,
          emojies: generateRandomEmojiString(8),
        }),
      });
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);
      const payload = await response.json();
      Telemetry.log('share:shorten:success', {
        hasUrl: Boolean(payload.short_url),
      });
      return payload.short_url;
    } catch (error) {
      const aborted = error && error.name === 'AbortError';
      Telemetry.logError('share:shorten', error, { aborted });
      console.error('Failed to create emoji short URL:', error);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Handles the logic for toggling the application's color theme. */
  const updateTheme = async () => {
    StateManager.dispatch(Actions.setTheme(!AppState.ui.isDarkMode));
    StateManager.persist();
    const themeMessage = AppState.ui.isDarkMode
      ? 'Dark theme enabled'
      : 'Light theme enabled';
    UIManager.announce(themeMessage);
    UIManager.showToast(themeMessage);
    await updateThemeAndReload();
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

  // ModalManager now imported as a module

  // --- 4. COMMAND PATTERN IMPLEMENTATION ---

  /** Helper to get human-readable shuffle type name */
  const getShuffleTypeName = (shuffleOptions) => {
    if (shuffleOptions.all) return 'All';
    if (shuffleOptions.appearance) return 'Appearance';
    if (shuffleOptions.movement) return 'Movement';
    if (shuffleOptions.interaction) return 'Interaction';
    if (shuffleOptions.fx) return 'Special FX';
    return 'Configuration';
  };

  /** Factory function to create a shuffle command object. */
  const createShuffleCommand = (shuffleOptions) => {
    const shuffleType = getShuffleTypeName(shuffleOptions);
    const oldConfig = structuredClone(AppState.particleState.currentConfig);
    const oldUIStates = {
      isGravityOn: AppState.ui.isGravityOn,
      areWallsOn: AppState.ui.areWallsOn,
      isCursorParticle: AppState.ui.isCursorParticle,
      originalOutModes: AppState.particleState.originalOutModes
        ? structuredClone(AppState.particleState.originalOutModes)
        : null,
      originalInteractionModes: structuredClone(
        AppState.particleState.originalInteractionModes
      ),
    };
    let newConfig = null;
    let newUIStates = null;

    return {
      async execute() {
        if (!newConfig) {
          newConfig = buildConfig(shuffleOptions);
          // Capture UI states after shuffle (they should be same, but let's be explicit)
          newUIStates = {
            isGravityOn: AppState.ui.isGravityOn,
            areWallsOn: AppState.ui.areWallsOn,
            isCursorParticle: AppState.ui.isCursorParticle,
            originalOutModes: AppState.particleState.originalOutModes
              ? structuredClone(AppState.particleState.originalOutModes)
              : null,
            originalInteractionModes: structuredClone(
              AppState.particleState.originalInteractionModes
            ),
          };
        } else {
          // Restore new UI states on redo
          AppState.ui.isGravityOn = newUIStates.isGravityOn;
          AppState.ui.areWallsOn = newUIStates.areWallsOn;
          AppState.ui.isCursorParticle = newUIStates.isCursorParticle;
          AppState.particleState.originalOutModes = newUIStates.originalOutModes
            ? structuredClone(newUIStates.originalOutModes)
            : {};
          AppState.particleState.originalInteractionModes = structuredClone(
            newUIStates.originalInteractionModes
          );
          const redoMessage = `Redid ${shuffleType} shuffle`;
          UIManager.showToast(redoMessage);
          UIManager.announce(redoMessage);
        }

        // Add subtle burst effect on shuffle
        const container = document.getElementById('tsparticles');
        if (container) {
          container.style.filter = 'brightness(1.3)';
          setTimeout(() => {
            container.style.filter = '';
          }, 150);
        }

        await loadParticles(newConfig);
        UIManager.announce('New scene generated.');
      },
      async undo() {
        // Restore old UI states
        AppState.ui.isGravityOn = oldUIStates.isGravityOn;
        AppState.ui.areWallsOn = oldUIStates.areWallsOn;
        AppState.ui.isCursorParticle = oldUIStates.isCursorParticle;
        AppState.particleState.originalOutModes = oldUIStates.originalOutModes
          ? structuredClone(oldUIStates.originalOutModes)
          : {};
        AppState.particleState.originalInteractionModes = structuredClone(
          oldUIStates.originalInteractionModes
        );

        await loadParticles(oldConfig);
        const undoMessage = `Undid ${shuffleType} shuffle`;
        UIManager.showToast(undoMessage);
        UIManager.announce(undoMessage);
      },
    };
  };

  /** Factory function to create a command for simple boolean state toggles. */
  const createToggleCommand = (stateKey, applyFn) => ({
    async execute() {
      AppState.ui[stateKey] = !AppState.ui[stateKey];
      await applyFn();
      const stateName = stateKey
        .replace('is', '')
        .replace('On', '')
        .replace('Particle', '');
      UIManager.announce(
        `${stateName} ${AppState.ui[stateKey] ? 'enabled' : 'disabled'}`
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

  // Note: Legacy setupModal helper removed; ModalManager now centralizes modal handling

  // --- 5. EVENT LISTENERS ---

  // Auto-hide menu after 10 seconds of inactivity
  let menuInactivityTimer = null;

  const resetMenuInactivityTimer = () => {
    clearTimeout(menuInactivityTimer);
    if (menuContainer.classList.contains('active')) {
      menuInactivityTimer = setTimeout(() => {
        if (menuContainer.classList.contains('active')) {
          mainMenuBtn.click(); // Close the menu
        }
      }, AUTO_HIDE_DELAY);
    }
  };

  // Track menu interaction to reset inactivity timer
  menuContainer.addEventListener('mouseenter', resetMenuInactivityTimer);
  menuContainer.addEventListener('mousemove', resetMenuInactivityTimer);
  menuContainer.addEventListener('click', resetMenuInactivityTimer);
  menuContainer.addEventListener('touchstart', resetMenuInactivityTimer);

  mainMenuBtn.addEventListener('click', () => {
    const isActive = menuContainer.classList.toggle('active');
    mainMenuBtn.setAttribute('aria-pressed', isActive);
    mainMenuBtn.setAttribute(
      'aria-label',
      isActive ? 'Close Settings Menu' : 'Open Settings Menu'
    );
    if (isActive) {
      document.getElementById(BUTTON_IDS.SHUFFLE_ALL).focus();
      resetMenuInactivityTimer(); // Start auto-hide timer
    } else {
      mainMenuBtn.focus(); // Return focus on close
      clearTimeout(menuInactivityTimer); // Clear timer when closed manually
    }
  });

  /** Main event listener for the control panel, using event delegation for performance. */
  subMenu.addEventListener('click', (e) => {
    const button = e.target.closest('.menu-button');
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
          createToggleCommand('isGravityOn', async () => {
            applyGravityMode();
            await loadParticles(AppState.particleState.currentConfig);
            UIManager.showToast(
              `Gravity ${AppState.ui.isGravityOn ? 'enabled' : 'disabled'}`
            );
          })
        );
        break;
      case BUTTON_IDS.WALLS:
        CommandManager.execute(
          createToggleCommand('areWallsOn', async () => {
            applyWallsMode();
            await loadParticles(AppState.particleState.currentConfig);
            UIManager.showToast(
              `Walls ${AppState.ui.areWallsOn ? 'enabled' : 'disabled'}`
            );
          })
        );
        break;
      case BUTTON_IDS.CURSOR:
        CommandManager.execute(
          createToggleCommand('isCursorParticle', async () => {
            applyCursorMode();
            await loadParticles(AppState.particleState.currentConfig);
            UIManager.showToast(
              `Cursor particle ${
                AppState.ui.isCursorParticle ? 'enabled' : 'disabled'
              }`
            );
          })
        );
        break;
      case BUTTON_IDS.REFRESH:
        (async () => {
          const config = AppState.particleState.currentConfig;
          if (config && Object.keys(config).length > 0) {
            await loadParticles(config);
            UIManager.showToast('Scene refreshed!');
            UIManager.announce('Scene refreshed');
          }
        })();
        break;
      case BUTTON_IDS.PAUSE:
        (() => {
          const container = AppState.ui.particlesContainer;
          if (!container) {
            UIManager.showToast('No particle animation loaded');
            UIManager.announce('No particle animation loaded');
            return;
          }
          StateManager.dispatch(Actions.togglePause());
          if (AppState.ui.isPaused) container.pause();
          else container.play();
          UIManager.syncUI();
          const pauseMessage = AppState.ui.isPaused
            ? 'Animation paused'
            : 'Animation resumed';
          UIManager.announce(pauseMessage);
          UIManager.showToast(pauseMessage);
        })();
        break;
      case BUTTON_IDS.SHARE:
        (async () => {
          Telemetry.log('share:start', {
            hasConfig:
              AppState.particleState.currentConfig &&
              Object.keys(AppState.particleState.currentConfig).length > 0,
          });
          const handleShare = ErrorHandler.wrap(async () => {
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

            button.classList.add('disabled');
            UIManager.showToast('⏳ Creating shareable link...');
            UIManager.announce('Creating shareable link');
            Telemetry.log('share:compress:start', {
              chaos: AppState.particleState.chaosLevel,
            });

            const compressedConfig = LZString.compressToEncodedURIComponent(
              JSON.stringify(sharableConfig)
            );
            const fullUrl = `${
              window.location.href.split('#')[0]
            }#config=${compressedConfig}`;
            Telemetry.log('share:compress:complete', {
              size: compressedConfig.length,
            });

            // Try to create short URL, but don't block on failure
            let finalUrl = fullUrl;
            try {
              const shortUrl = await createEmojiShortUrl(fullUrl);
              if (shortUrl) {
                finalUrl = shortUrl;
              }
            } catch (shortenError) {
              console.warn(
                'URL shortening failed, using full URL:',
                shortenError
              );
              Telemetry.logError('share:shorten:unexpected', shortenError);
            }

            await copyToClipboard(finalUrl);

            // Show different message based on URL type
            const isShortenedUrl = finalUrl !== fullUrl;
            if (isShortenedUrl) {
              UIManager.showToast(
                `✓ Short link copied! ${finalUrl.split('/').pop()}`
              );
              UIManager.announce('Short emoji link copied to clipboard');
            } else {
              UIManager.showToast('✓ Link copied to clipboard');
              UIManager.announce('Full configuration link copied to clipboard');
            }

            Telemetry.log('share:copied', {
              shortened: isShortenedUrl,
              urlLength: finalUrl.length,
            });

            return { shortened: isShortenedUrl };
          }, ErrorType.SHARE_FAILED);

          const shareResult = await handleShare();
          Telemetry.log('share:complete', {
            status: shareResult ? 'success' : 'failed',
            shortened: Boolean(shareResult && shareResult.shortened),
          });
          button.classList.remove('disabled');
        })();
        break;
      case BUTTON_IDS.INFO:
        UIManager.populateInfoModal();
        ModalManager.open('info', button);
        break;
    }
  });

  // Create debounced functions for chaos slider
  const debouncedChaosAnnounce = debounce((level) => {
    UIManager.announce(`Chaos level ${level}`);
  }, 300);

  const debouncedChaosSave = debounce((level) => {
    SafeStorage.setItem('tsDiceChaos', String(level));
  }, 500);

  chaosSlider.addEventListener('input', (e) => {
    const newValue = parseInt(e.target.value, 10);
    // Validate range
    if (newValue < 1 || newValue > 10 || isNaN(newValue)) {
      console.warn('Invalid chaos level:', newValue);
      return;
    }
    StateManager.dispatch(Actions.setChaosLevel(newValue));
    UIManager.syncUI();
    // Use debounced versions to prevent excessive calls
    debouncedChaosAnnounce(AppState.particleState.chaosLevel);
    debouncedChaosSave(AppState.particleState.chaosLevel);
  });

  chaosSlider.addEventListener('change', () => {
    // Show toast and announce on change (when user releases the slider)
    const chaosMessage = `Chaos level set to ${AppState.particleState.chaosLevel}`;
    UIManager.showToast(chaosMessage);
    UIManager.announce(chaosMessage);
  });

  /** Helper function to dismiss the welcome modal and set the timestamp. */
  const dismissWelcomeModal = () => {
    const dontShowCheckbox = document.getElementById('dont-show-welcome');
    ModalManager.close('welcome');

    if (dontShowCheckbox && dontShowCheckbox.checked) {
      // Set a far future timestamp so it never shows again (1 year ahead)
      const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
      SafeStorage.setItem('tsDiceWelcomeTimestamp', String(farFuture));
      SafeStorage.setItem('tsDiceWelcomeDismissed', 'true');
    } else {
      // Set current timestamp for 24-hour reset
      SafeStorage.setItem('tsDiceWelcomeTimestamp', String(Date.now()));
      SafeStorage.removeItem('tsDiceWelcomeDismissed');
    }
  };

  /** Tab switcher for info modal */
  const setupInfoModalTabs = () => {
    const tabButtons = infoModal.querySelectorAll('.modal-tab');
    const tabContents = infoModal.querySelectorAll('.modal-tab-content');
    const LAST_TAB_KEY = 'tsDiceLastInfoTab';

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Remove active class from all tabs and contents
        tabButtons.forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        tabContents.forEach((content) => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        document.getElementById(`tab-${targetTab}`).classList.add('active');

        // Remember the last viewed tab
        SafeStorage.setItem(LAST_TAB_KEY, targetTab);
      });
    });

    // Restore last viewed tab when modal opens
    const restoreLastTab = () => {
      const lastTab = SafeStorage.getItem(LAST_TAB_KEY) || 'controls';
      const targetButton = Array.from(tabButtons).find(
        (btn) => btn.dataset.tab === lastTab
      );

      if (targetButton) {
        targetButton.click();
      }
    };

    // Listen for modal open and restore last tab
    btnInfo.addEventListener('click', () => {
      // Use setTimeout to ensure modal is open before restoring tab
      setTimeout(restoreLastTab, 0);
    });

    // Add keyboard navigation for tabs (arrow keys)
    const tabButtonsArray = Array.from(tabButtons);
    tabButtons.forEach((button, index) => {
      button.addEventListener('keydown', (e) => {
        let targetIndex = -1;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = (index + 1) % tabButtonsArray.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex =
            (index - 1 + tabButtonsArray.length) % tabButtonsArray.length;
        }

        if (targetIndex !== -1) {
          tabButtonsArray[targetIndex].click();
          tabButtonsArray[targetIndex].focus();
        }
      });
    });
  };

  /** Wire up the advanced settings toggles within the info modal. */
  const setupAdvancedSettingsPanel = () => {
    const toggleInputs = document.querySelectorAll('[data-advanced-setting]');
    const resetBtn = document.getElementById('advanced-reset-btn');
    const copyBtn = document.getElementById('copy-diagnostics-btn');

    if (!toggleInputs.length) return;

    const messages = {
      autoPauseHidden: {
        enabled: 'Auto pause when hidden enabled',
        disabled: 'Auto pause when hidden disabled',
      },
      batterySaverMode: {
        enabled: 'Battery saver mode enabled',
        disabled: 'Battery saver mode disabled',
      },
    };

    const syncToggleStates = () => {
      toggleInputs.forEach((input) => {
        const key = input.dataset.advancedSetting;
        if (!key) return;
        input.checked = Boolean(AppState.advanced[key]);
      });
    };

    const reloadIfReady = async () => {
      const config = AppState.particleState.currentConfig;
      if (config && Object.keys(config).length > 0) {
        await loadParticles(config);
      }
    };

    toggleInputs.forEach((input) => {
      const key = input.dataset.advancedSetting;
      if (!key) return;
      input.checked = Boolean(AppState.advanced[key]);

      input.addEventListener('change', async () => {
        StateManager.dispatch(Actions.setAdvancedSetting(key, input.checked));
        const status = input.checked ? 'enabled' : 'disabled';
        const message = messages[key] ? messages[key][status] : null;
        if (message) {
          UIManager.showToast(message);
          UIManager.announce(message);
        }
        Telemetry.log('advanced_setting', { key, value: input.checked });
        await reloadIfReady();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        StateManager.dispatch(Actions.resetAdvancedSettings());
        syncToggleStates();
        UIManager.showToast('Advanced settings restored');
        UIManager.announce('Advanced settings restored');
        Telemetry.log('advanced_setting_reset');
        await reloadIfReady();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await Telemetry.copyToClipboard();
          UIManager.showToast('Diagnostics log copied');
          UIManager.announce('Diagnostics log copied');
          Telemetry.log('observability:log-exported', {
            entries: Telemetry.getEvents().length,
          });
        } catch (error) {
          ErrorHandler.handle(error, ErrorType.UNKNOWN, {
            feature: 'copy-diagnostics',
          });
        }
      });
    }
  };

  // Register all modals with the ModalManager
  ModalManager.register(
    'welcome',
    welcomeModal,
    closeModalBtn,
    dismissWelcomeModal
  );
  ModalManager.register('info', infoModal, closeInfoModalBtn);

  // Setup tab functionality for info modal
  setupInfoModalTabs();
  setupAdvancedSettingsPanel();

  fullscreenBtn.addEventListener('click', toggleFullScreen);
  document.addEventListener(
    'fullscreenchange',
    UIManager.updateFullscreenIcons
  );

  // Tooltip logic moved into tooltipManager module

  // --- 6. ACCESSIBILITY - KEYBOARD ACTIVATION & SHORTCUTS ---
  document.querySelectorAll('[role="button"]').forEach((button) => {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });

  chaosSlider.addEventListener('keydown', (e) => {
    const value = parseInt(chaosSlider.value, 10);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      chaosSlider.value = Math.max(1, value - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      chaosSlider.value = Math.min(10, value + 1);
    } else {
      return;
    }
    e.preventDefault();
    chaosSlider.dispatchEvent(new Event('input', { bubbles: true }));
  });

  initKeyboardShortcuts(menuContainer);

  // --- KONAMI CODE EASTER EGG ---
  /** Special particle configuration for Konami code (↑ ↑ ↓ ↓ ← → ← → B A) */
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const expectedKey = konamiCode[konamiIndex].toLowerCase();

    if (key === expectedKey || e.key === expectedKey) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        // Trigger special "party mode" configuration
        const partyConfig = buildConfig({ all: true });
        partyConfig.particles.number.value = 300;
        partyConfig.particles.color.value = 'random';
        partyConfig.particles.move.speed = 10;
        partyConfig.particles.shape.type = ['star', 'circle', 'triangle'];
        partyConfig.particles.size.value = { min: 2, max: 8 };
        partyConfig.particles.move.direction = 'none';
        partyConfig.particles.move.random = true;
        partyConfig.particles.move.outModes = { default: 'bounce' };

        CommandManager.execute({
          newConfig: partyConfig,
          shuffleType: '🎉 Party Mode',
          async execute() {
            await loadParticles(partyConfig);
            AppState.particleState.currentConfig = partyConfig;
            UIManager.syncUI();
            UIManager.showToast('🎉 Party Mode Activated! 🎊');
            UIManager.announce('Party mode activated with Konami code');
          },
          async undo() {
            const prevConfig = AppState.particleState.currentConfig;
            await loadParticles(prevConfig);
            UIManager.syncUI();
          },
        });
      }
    } else {
      konamiIndex = 0;
    }
  });

  // --- 7. INITIALISATION ---
  /** This section sets up the initial state of the application on load. */
  const savedTheme = SafeStorage.getItem('tsDiceTheme');
  StateManager.dispatch(
    Actions.setTheme(savedTheme ? savedTheme === 'dark' : true)
  );

  const savedChaos = SafeStorage.getItem('tsDiceChaos');
  StateManager.dispatch(
    Actions.setChaosLevel(savedChaos ? parseInt(savedChaos, 10) : 5)
  );

  let initialConfigFromStorage = null;
  try {
    const savedConfigString = SafeStorage.getItem('tsDiceLastConfig');
    if (savedConfigString) {
      initialConfigFromStorage = JSON.parse(savedConfigString);
      // Validate config using ErrorHandler
      if (!ErrorHandler.validateConfig(initialConfigFromStorage)) {
        console.warn('Saved config is malformed, ignoring.');
        initialConfigFromStorage = null;
        SafeStorage.removeItem('tsDiceLastConfig');
      }
    }
  } catch (e) {
    ErrorHandler.handle(e, ErrorType.STORAGE_ERROR);
    SafeStorage.removeItem('tsDiceLastConfig');
  }

  if (window.location.hash && window.location.hash.startsWith('#config=')) {
    try {
      const decodedString = LZString.decompressFromEncodedURIComponent(
        window.location.hash.substring(8)
      );
      if (decodedString) {
        const parsedConfig = JSON.parse(decodedString);
        // Validate config structure
        if (!parsedConfig || typeof parsedConfig !== 'object') {
          throw new Error('Invalid config structure');
        }

        if (parsedConfig.uiState) {
          StateManager.dispatch(
            Actions.setChaosLevel(parsedConfig.uiState.chaosLevel || 5)
          );
          StateManager.dispatch(
            Actions.setTheme(parsedConfig.uiState.isDarkMode !== false)
          );
          if (parsedConfig.uiState.isCursorParticle) {
            StateManager.dispatch(Actions.toggleCursor());
          }
          if (parsedConfig.uiState.isGravityOn) {
            StateManager.dispatch(Actions.toggleGravity());
          }
          if (parsedConfig.uiState.areWallsOn) {
            StateManager.dispatch(Actions.toggleWalls());
            AppState.particleState.originalOutModes =
              parsedConfig.uiState.originalOutModes;
          }
          delete parsedConfig.uiState;
        }

        // Validate the particle config before using it
        if (ErrorHandler.validateConfig(parsedConfig)) {
          AppState.particleState.initialConfigFromUrl = parsedConfig;
        } else {
          throw new Error('Invalid particle configuration');
        }
      } else {
        throw new Error('Decompression failed');
      }
    } catch (e) {
      ErrorHandler.handle(e, ErrorType.CONFIG_INVALID);
      window.location.hash = '';
    }
  }

  // Determine initial config: URL config > saved config > fresh random shuffle
  let configToLoad =
    AppState.particleState.initialConfigFromUrl || initialConfigFromStorage;

  // If no saved or URL config, generate a fresh random shuffle
  if (!configToLoad) {
    configToLoad = buildConfig({ all: true });
  }

  await loadParticles(configToLoad);

  UIManager.syncUI();

  // Show the welcome modal on first visit or after 24 hours have passed
  // (unless permanently dismissed)
  const welcomeTimestamp = SafeStorage.getItem('tsDiceWelcomeTimestamp');
  const welcomeDismissed = SafeStorage.getItem('tsDiceWelcomeDismissed');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // Milliseconds in 24 hours

  if (
    welcomeDismissed !== 'true' &&
    (!welcomeTimestamp ||
      now - parseInt(welcomeTimestamp, 10) > twentyFourHours)
  ) {
    setTimeout(() => ModalManager.open('welcome'), 500);
  }

  // --- 8. REDUCED MOTION HANDLING ---
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleReducedMotion = () => {
    const container = AppState.ui.particlesContainer;
    if (motionQuery.matches && container && !AppState.ui.isPaused) {
      container.pause();
      StateManager.dispatch(Actions.togglePause());
      UIManager.syncUI();
      UIManager.announce('Animation paused due to reduced motion preference.');
      UIManager.showToast('Animation paused due to reduced motion preference.');
    }
  };
  handleReducedMotion();
  motionQuery.addEventListener('change', handleReducedMotion);

  // --- 9. DEBOUNCED WINDOW RESIZE ---
  const handleResize = debounce(() => {
    const container = AppState.ui.particlesContainer;
    if (container) {
      container.refresh();
    }
  }, 250);
  window.addEventListener('resize', handleResize);

  // --- 10. MEMORY LEAK PREVENTION ---
  /** Cleanup function to prevent memory leaks on page unload */
  window.addEventListener('beforeunload', () => {
    const container = AppState.ui.particlesContainer;
    if (container) {
      container.destroy();
    }
  });
})();
