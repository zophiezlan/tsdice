import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandManager } from '../js/commandManager.js';

// Mock UIManager to avoid dependencies
vi.mock('../js/uiManager.js', () => ({
  UIManager: {
    syncUI: vi.fn(),
    announce: vi.fn(),
  },
}));

describe('CommandManager', () => {
  beforeEach(() => {
    // Reset stacks before each test
    CommandManager.undoStack = [];
    CommandManager.redoStack = [];
  });

  describe('execute', () => {
    it('should execute a command and add it to undo stack', () => {
      const command = {
        execute: vi.fn(),
        undo: vi.fn(),
      };

      CommandManager.execute(command);

      expect(command.execute).toHaveBeenCalledOnce();
      expect(CommandManager.undoStack).toHaveLength(1);
      expect(CommandManager.undoStack[0]).toBe(command);
    });

    it('should clear redo stack when executing a new command', () => {
      const command1 = {
        execute: vi.fn(),
        undo: vi.fn(),
      };
      const command2 = {
        execute: vi.fn(),
        undo: vi.fn(),
      };

      CommandManager.execute(command1);
      CommandManager.undo();
      expect(CommandManager.redoStack).toHaveLength(1);

      CommandManager.execute(command2);
      expect(CommandManager.redoStack).toHaveLength(0);
    });

    it('should support infinite history (no limit on undo stack)', () => {
      // Execute 50 commands to test that we no longer have a 20-step limit
      for (let i = 0; i < 50; i++) {
        const command = {
          id: i,
          execute: vi.fn(),
          undo: vi.fn(),
        };
        CommandManager.execute(command);
      }

      expect(CommandManager.undoStack).toHaveLength(50);
      expect(CommandManager.undoStack[0].id).toBe(0);
      expect(CommandManager.undoStack[49].id).toBe(49);
    });

    it('should deduplicate consecutive identical configs', () => {
      const config = { particles: { number: { value: 50 } } };

      const command1 = {
        execute: vi.fn(),
        undo: vi.fn(),
        newConfig: config,
      };

      const command2 = {
        execute: vi.fn(),
        undo: vi.fn(),
        newConfig: config,
      };

      CommandManager.execute(command1);
      CommandManager.execute(command2);

      // Second command should be skipped due to deduplication
      expect(CommandManager.undoStack).toHaveLength(1);
      expect(command2.execute).not.toHaveBeenCalled();
    });

    it('should not deduplicate different configs', () => {
      const config1 = { particles: { number: { value: 50 } } };
      const config2 = { particles: { number: { value: 100 } } };

      const command1 = {
        execute: vi.fn(),
        undo: vi.fn(),
        newConfig: config1,
      };

      const command2 = {
        execute: vi.fn(),
        undo: vi.fn(),
        newConfig: config2,
      };

      CommandManager.execute(command1);
      CommandManager.execute(command2);

      expect(CommandManager.undoStack).toHaveLength(2);
      expect(command2.execute).toHaveBeenCalledOnce();
    });
  });

  describe('undo', () => {
    it('should undo the last command', () => {
      const command = {
        execute: vi.fn(),
        undo: vi.fn(),
      };

      CommandManager.execute(command);
      CommandManager.undo();

      expect(command.undo).toHaveBeenCalledOnce();
      expect(CommandManager.undoStack).toHaveLength(0);
      expect(CommandManager.redoStack).toHaveLength(1);
    });

    it('should do nothing if undo stack is empty', () => {
      expect(CommandManager.undoStack).toHaveLength(0);
      expect(() => CommandManager.undo()).not.toThrow();
      expect(CommandManager.undoStack).toHaveLength(0);
      expect(CommandManager.redoStack).toHaveLength(0);
    });

    it('should support multiple undos', () => {
      const commands = [];
      for (let i = 0; i < 5; i++) {
        const command = {
          id: i,
          execute: vi.fn(),
          undo: vi.fn(),
        };
        commands.push(command);
        CommandManager.execute(command);
      }

      CommandManager.undo();
      CommandManager.undo();
      CommandManager.undo();

      expect(CommandManager.undoStack).toHaveLength(2);
      expect(CommandManager.redoStack).toHaveLength(3);
      expect(commands[4].undo).toHaveBeenCalledOnce();
      expect(commands[3].undo).toHaveBeenCalledOnce();
      expect(commands[2].undo).toHaveBeenCalledOnce();
    });
  });

  describe('redo', () => {
    it('should redo the last undone command', () => {
      const command = {
        execute: vi.fn(),
        undo: vi.fn(),
      };

      CommandManager.execute(command);
      CommandManager.undo();
      CommandManager.redo();

      expect(command.execute).toHaveBeenCalledTimes(2);
      expect(CommandManager.undoStack).toHaveLength(1);
      expect(CommandManager.redoStack).toHaveLength(0);
    });

    it('should do nothing if redo stack is empty', () => {
      expect(CommandManager.redoStack).toHaveLength(0);
      expect(() => CommandManager.redo()).not.toThrow();
      expect(CommandManager.undoStack).toHaveLength(0);
      expect(CommandManager.redoStack).toHaveLength(0);
    });

    it('should support multiple redos', () => {
      const commands = [];
      for (let i = 0; i < 5; i++) {
        const command = {
          id: i,
          execute: vi.fn(),
          undo: vi.fn(),
        };
        commands.push(command);
        CommandManager.execute(command);
      }

      // Undo 3 times
      CommandManager.undo();
      CommandManager.undo();
      CommandManager.undo();

      expect(CommandManager.redoStack).toHaveLength(3);

      // Redo 2 times
      CommandManager.redo();
      CommandManager.redo();

      expect(CommandManager.undoStack).toHaveLength(4);
      expect(CommandManager.redoStack).toHaveLength(1);
    });
  });

  describe('undo/redo workflow', () => {
    it('should support complete undo/redo workflow', () => {
      const commands = [];

      // Execute 3 commands
      for (let i = 0; i < 3; i++) {
        const command = {
          id: i,
          execute: vi.fn(),
          undo: vi.fn(),
        };
        commands.push(command);
        CommandManager.execute(command);
      }

      expect(CommandManager.undoStack).toHaveLength(3);

      // Undo all
      CommandManager.undo();
      CommandManager.undo();
      CommandManager.undo();

      expect(CommandManager.undoStack).toHaveLength(0);
      expect(CommandManager.redoStack).toHaveLength(3);

      // Redo all
      CommandManager.redo();
      CommandManager.redo();
      CommandManager.redo();

      expect(CommandManager.undoStack).toHaveLength(3);
      expect(CommandManager.redoStack).toHaveLength(0);
    });

    it('should clear redo stack when executing after undo', () => {
      const command1 = {
        execute: vi.fn(),
        undo: vi.fn(),
      };
      const command2 = {
        execute: vi.fn(),
        undo: vi.fn(),
      };
      const command3 = {
        execute: vi.fn(),
        undo: vi.fn(),
      };

      CommandManager.execute(command1);
      CommandManager.execute(command2);
      CommandManager.undo();

      expect(CommandManager.redoStack).toHaveLength(1);

      // Execute a new command - should clear redo stack
      CommandManager.execute(command3);

      expect(CommandManager.redoStack).toHaveLength(0);
      expect(CommandManager.undoStack).toHaveLength(2);
    });
  });
});
