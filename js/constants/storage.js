/**
 * @fileoverview Centralized storage key constants
 * All localStorage keys used by tsDice are defined here to prevent
 * typos and make refactoring easier.
 */

/**
 * Storage keys for localStorage persistence
 */
export const STORAGE_KEYS = {
  /** User's theme preference ('dark' or 'light') */
  THEME: 'tsDiceTheme',

  /** Current chaos level (1-10) */
  CHAOS: 'tsDiceChaos',

  /** Last particle configuration (JSON) */
  LAST_CONFIG: 'tsDiceLastConfig',

  /** Timestamp of last welcome modal display */
  WELCOME_TIMESTAMP: 'tsDiceWelcomeTimestamp',

  /** Whether user permanently dismissed welcome modal */
  WELCOME_DISMISSED: 'tsDiceWelcomeDismissed',

  /** Last viewed tab in info modal */
  LAST_INFO_TAB: 'tsDiceLastInfoTab',

  /** Advanced settings object (JSON) */
  ADVANCED_SETTINGS: 'tsDiceAdvancedSettings',
};
