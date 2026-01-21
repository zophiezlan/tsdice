/**
 * @fileoverview Command factory functions for the command pattern implementation
 * These factories create undoable command objects for various actions.
 */

/**
 * Maps shuffle options to human-readable names
 * @param {Object} shuffleOptions - The shuffle options object
 * @returns {string} Human-readable shuffle type name
 */
export const getShuffleTypeName = (shuffleOptions) => {
  if (shuffleOptions.all) return 'All';
  if (shuffleOptions.appearance) return 'Appearance';
  if (shuffleOptions.movement) return 'Movement';
  if (shuffleOptions.interaction) return 'Interaction';
  if (shuffleOptions.fx) return 'Special FX';
  return 'Configuration';
};

/**
 * Captures the current UI state for undo/redo operations
 * @param {Object} appState - The application state object
 * @returns {Object} Captured UI state
 */
export const captureUIState = (appState) => ({
  isGravityOn: appState.ui.isGravityOn,
  areWallsOn: appState.ui.areWallsOn,
  isCursorParticle: appState.ui.isCursorParticle,
  originalOutModes: appState.particleState.originalOutModes
    ? structuredClone(appState.particleState.originalOutModes)
    : null,
  originalInteractionModes: structuredClone(
    appState.particleState.originalInteractionModes
  ),
});

/**
 * Restores a previously captured UI state
 * @param {Object} appState - The application state object to mutate
 * @param {Object} uiState - The UI state to restore
 */
export const restoreUIState = (appState, uiState) => {
  appState.ui.isGravityOn = uiState.isGravityOn;
  appState.ui.areWallsOn = uiState.areWallsOn;
  appState.ui.isCursorParticle = uiState.isCursorParticle;
  appState.particleState.originalOutModes = uiState.originalOutModes
    ? structuredClone(uiState.originalOutModes)
    : {};
  appState.particleState.originalInteractionModes = structuredClone(
    uiState.originalInteractionModes
  );
};

/**
 * Applies a visual burst effect to the particles container
 * @param {string} containerId - The ID of the container element
 * @param {number} brightness - Brightness multiplier (default 1.3)
 * @param {number} duration - Effect duration in ms (default 150)
 */
export const applyBurstEffect = (
  containerId = 'tsparticles',
  brightness = 1.3,
  duration = 150
) => {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.filter = `brightness(${brightness})`;
    setTimeout(() => {
      container.style.filter = '';
    }, duration);
  }
};

/**
 * Factory function to create a shuffle command object.
 * @param {Object} options - Configuration options
 * @param {Object} options.shuffleOptions - Which aspects to shuffle
 * @param {Object} options.appState - Application state reference
 * @param {Object} options.uiManager - UI manager for toasts/announcements
 * @param {Function} options.buildConfig - Config builder function
 * @param {Function} options.loadParticles - Particle loader function
 * @returns {Object} Command object with execute and undo methods
 */
export const createShuffleCommand = ({
  shuffleOptions,
  appState,
  uiManager,
  buildConfig,
  loadParticles,
}) => {
  const shuffleType = getShuffleTypeName(shuffleOptions);
  const oldConfig = structuredClone(appState.particleState.currentConfig);
  const oldUIStates = captureUIState(appState);
  let newConfig = null;
  let newUIStates = null;

  return {
    async execute() {
      if (!newConfig) {
        newConfig = buildConfig(shuffleOptions);
        newUIStates = captureUIState(appState);
      } else {
        restoreUIState(appState, newUIStates);
        const redoMessage = `Redid ${shuffleType} shuffle`;
        uiManager.showToast(redoMessage);
        uiManager.announce(redoMessage);
      }

      applyBurstEffect();
      await loadParticles(newConfig);
      uiManager.announce('New scene generated.');
    },

    async undo() {
      restoreUIState(appState, oldUIStates);
      await loadParticles(oldConfig);
      const undoMessage = `Undid ${shuffleType} shuffle`;
      uiManager.showToast(undoMessage);
      uiManager.announce(undoMessage);
    },
  };
};

/**
 * Factory function to create a command for simple boolean state toggles.
 * @param {Object} options - Configuration options
 * @param {string} options.stateKey - The key in appState.ui to toggle
 * @param {Object} options.appState - Application state reference
 * @param {Object} options.uiManager - UI manager for announcements
 * @param {Function} options.applyFn - Function to apply the toggle effect
 * @returns {Object} Command object with execute and undo methods
 */
export const createToggleCommand = ({
  stateKey,
  appState,
  uiManager,
  applyFn,
}) => ({
  async execute() {
    appState.ui[stateKey] = !appState.ui[stateKey];
    await applyFn();
    const stateName = stateKey
      .replace('is', '')
      .replace('On', '')
      .replace('Particle', '');
    uiManager.announce(
      `${stateName} ${appState.ui[stateKey] ? 'enabled' : 'disabled'}`
    );
  },
  async undo() {
    await this.execute();
  },
});

/**
 * Factory function to create a command for toggling the theme.
 * @param {Object} options - Configuration options
 * @param {Function} options.updateTheme - Theme update function
 * @returns {Object} Command object with execute and undo methods
 */
export const createThemeCommand = ({ updateTheme }) => ({
  async execute() {
    await updateTheme();
  },
  async undo() {
    await updateTheme();
  },
});
