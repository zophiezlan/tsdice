import { AppState } from './state.js';
import { StateManager, Actions } from './stateManager.js';
import { SafeStorage } from './storage.js';
import { ErrorHandler, ErrorType } from './errorHandler.js';
import { STORAGE_KEYS } from './constants.js';

const HASH_PREFIX = '#config=';

/**
 * Reads and validates a saved scene config from local storage.
 * Clears the stored value if malformed.
 */
export function loadSavedConfig() {
  try {
    const savedConfigString = SafeStorage.getItem(STORAGE_KEYS.LAST_CONFIG);
    if (!savedConfigString) return null;

    const parsed = JSON.parse(savedConfigString);
    if (!ErrorHandler.validateConfig(parsed)) {
      console.warn('Saved config is malformed, ignoring.');
      SafeStorage.removeItem(STORAGE_KEYS.LAST_CONFIG);
      return null;
    }
    return parsed;
  } catch (e) {
    ErrorHandler.handle(e, ErrorType.STORAGE_ERROR);
    SafeStorage.removeItem(STORAGE_KEYS.LAST_CONFIG);
    return null;
  }
}

/**
 * Applies any `uiState` fields from a decoded config to the app state.
 * Mutates the config by deleting the `uiState` key so downstream consumers
 * see only the particle config.
 */
function applyUiStateFromConfig(parsedConfig) {
  const uiState = parsedConfig.uiState;
  if (!uiState) return;

  StateManager.dispatch(Actions.setChaosLevel(uiState.chaosLevel || 5));
  StateManager.dispatch(Actions.setTheme(uiState.isDarkMode !== false));
  if (uiState.isCursorParticle) StateManager.dispatch(Actions.toggleCursor());
  if (uiState.isGravityOn) StateManager.dispatch(Actions.toggleGravity());
  if (uiState.areWallsOn) {
    StateManager.dispatch(Actions.toggleWalls());
    if (uiState.originalOutModes) {
      StateManager.dispatch(
        Actions.setOriginalModes({ outModes: uiState.originalOutModes })
      );
    }
  }
  delete parsedConfig.uiState;
}

/**
 * Reads a `#config=…` URL hash, decompresses it, validates it, and stages it
 * on AppState. On any failure, clears the hash and reports via ErrorHandler.
 * Returns true when a URL config was successfully loaded.
 */
export function loadConfigFromHash() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith(HASH_PREFIX)) return false;

  try {
    const decoded = LZString.decompressFromEncodedURIComponent(
      hash.substring(HASH_PREFIX.length)
    );
    if (!decoded) throw new Error('Decompression failed');

    const parsedConfig = JSON.parse(decoded);
    if (!parsedConfig || typeof parsedConfig !== 'object') {
      throw new Error('Invalid config structure');
    }

    applyUiStateFromConfig(parsedConfig);

    if (!ErrorHandler.validateConfig(parsedConfig)) {
      throw new Error('Invalid particle configuration');
    }

    AppState.particleState.initialConfigFromUrl = parsedConfig;
    return true;
  } catch (e) {
    ErrorHandler.handle(e, ErrorType.CONFIG_INVALID);
    window.location.hash = '';
    return false;
  }
}
