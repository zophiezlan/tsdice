import { UIManager } from './uiManager.js';

/**
 * @description Manages the application's undo/redo history using command objects.
 * This is more memory-efficient than storing full state snapshots.
 */
export const CommandManager = {
  undoStack: [],
  redoStack: [],

  /** Executes a command, adds it to the undo stack, and clears the redo stack. */
  execute(command) {
    // Check if this command produces the same config as the last one (deduplication)
    // Only deduplicate shuffle commands that have newConfig property
    if (this.undoStack.length > 0 && command.newConfig) {
      const lastCommand = this.undoStack[this.undoStack.length - 1];

      // Only compare if both commands have configs
      if (lastCommand.newConfig) {
        const lastConfig = JSON.stringify(lastCommand.newConfig);
        const newConfig = JSON.stringify(command.newConfig);

        if (lastConfig === newConfig) {
          // Skip adding duplicate consecutive configs
          return;
        }
      }
    }

    command.execute();
    this.undoStack.push(command);
    // No limit on history - infinite undo/redo
    this.redoStack = [];
    UIManager.syncUI();
  },

  /** Undoes the most recent command. */
  undo() {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    UIManager.syncUI();
    UIManager.announce('Action undone.');
  },

  /** Redoes the most recently undone command. */
  redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    UIManager.syncUI();
    UIManager.announce('Action redone.');
  },
};
