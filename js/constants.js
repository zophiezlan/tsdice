/**
 * @fileoverview Barrel export for all constants (backward compatibility)
 * @deprecated Individual constant modules are now in constants/ directory
 * Import from specific modules for better tree-shaking:
 * - constants/ui.js
 * - constants/particles.js
 * - constants/colors.js
 */

// Re-export all constants for backward compatibility
export * from './constants/ui.js';
export * from './constants/particles.js';
export * from './constants/colors.js';
