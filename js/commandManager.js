import { UIManager } from "./uiManager.js";

/**
 * @description Manages the application's undo/redo history using command objects.
 * This is more memory-efficient than storing full state snapshots.
 */
export const CommandManager = {
  undoStack: [],
  redoStack: [],

  /** Executes a command, adds it to the undo stack, and clears the redo stack. */
  execute(command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > 20) this.undoStack.shift();
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
    UIManager.announce("Action undone.");
  },

  /** Redoes the most recently undone command. */
  redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    UIManager.syncUI();
    UIManager.announce("Action redone.");
  },
};
