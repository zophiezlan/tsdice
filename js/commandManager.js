import { UIManager } from './uiManager.js';
import { ErrorHandler, ErrorType } from './errorHandler.js';
import { Telemetry } from './telemetry.js';

const describeCommand = (command) =>
  (command && (command.shuffleType || command.name)) || 'anonymous';

/**
 * @description Manages the application's undo/redo history using command objects.
 * This is more memory-efficient than storing full state snapshots.
 */
export const CommandManager = {
  undoStack: [],
  redoStack: [],

  /** Executes a command, adds it to the undo stack, and clears the redo stack. */
  execute(command) {
    if (!command || typeof command.execute !== 'function') return;
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

    this.undoStack.push(command);
    // No limit on history - infinite undo/redo
    this.redoStack = [];
    UIManager.syncUI();

    let result;
    try {
      result = command.execute();
    } catch (error) {
      this.undoStack.pop();
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'execute',
      });
      Telemetry.logError('command:execute', error, {
        command: describeCommand(command),
      });
      return;
    }

    const onSuccess = () => {
      Telemetry.log('command:execute', {
        name: describeCommand(command),
        undoDepth: this.undoStack.length,
      });
    };

    const onError = (error) => {
      if (this.undoStack[this.undoStack.length - 1] === command) {
        this.undoStack.pop();
      }
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'execute',
      });
      Telemetry.logError('command:execute', error, {
        command: describeCommand(command),
      });
    };

    if (result && typeof result.then === 'function') {
      return result.then(onSuccess).catch(onError);
    }

    onSuccess();
    return result;
  },

  /** Undoes the most recent command. */
  undo() {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop();
    this.redoStack.push(command);
    UIManager.syncUI();
    UIManager.announce('Action undone.');

    let result;
    try {
      result = command.undo();
    } catch (error) {
      this.redoStack.pop();
      this.undoStack.push(command);
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'undo',
      });
      Telemetry.logError('command:undo', error, {
        command: describeCommand(command),
      });
      return;
    }

    const onSuccess = () => {
      Telemetry.log('command:undo', {
        name: describeCommand(command),
        undoDepth: this.undoStack.length,
      });
    };

    const onError = (error) => {
      this.redoStack.pop();
      this.undoStack.push(command);
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'undo',
      });
      Telemetry.logError('command:undo', error, {
        command: describeCommand(command),
      });
    };

    if (result && typeof result.then === 'function') {
      return result.then(onSuccess).catch(onError);
    }

    onSuccess();
    return result;
  },

  /** Redoes the most recently undone command. */
  redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop();
    this.undoStack.push(command);
    UIManager.syncUI();
    UIManager.announce('Action redone.');

    let result;
    try {
      result = command.execute();
    } catch (error) {
      this.undoStack.pop();
      this.redoStack.push(command);
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'redo',
      });
      Telemetry.logError('command:redo', error, {
        command: describeCommand(command),
      });
      return;
    }

    const onSuccess = () => {
      Telemetry.log('command:redo', {
        name: describeCommand(command),
        undoDepth: this.undoStack.length,
      });
    };

    const onError = (error) => {
      this.undoStack.pop();
      this.redoStack.push(command);
      ErrorHandler.handle(error, ErrorType.UNKNOWN, {
        command: describeCommand(command),
        phase: 'redo',
      });
      Telemetry.logError('command:redo', error, {
        command: describeCommand(command),
      });
    };

    if (result && typeof result.then === 'function') {
      return result.then(onSuccess).catch(onError);
    }

    onSuccess();
    return result;
  },
};
