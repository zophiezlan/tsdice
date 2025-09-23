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

    initializeCommandManager(initialChaos) {
        const commandMap = {
            'btn-shuffle-appearance': () => shuffle('appearance'),
            'btn-shuffle-movement': () => shuffle('movement'),
            'btn-shuffle-interaction': () => shuffle('interaction'),
            'btn-shuffle-special-fx': () => shuffle('special-fx'),
            'btn-shuffle-all': shuffleAll,
            'btn-save': saveScene,
            'btn-load': loadScene,
            'btn-history': toggleHistory,
            'btn-copy': copyConfig,
            'btn-toggle-theme': toggleTheme,
            'btn-close-welcome': () => setWelcomeModalVisibility(false),
            'btn-start': () => setWelcomeModalVisibility(false),
            'btn-clear-history': clearHistory,
            'chaos-slider': (event) => {
                setChaosLevel(event.target.value);
            }
        };

        document.addEventListener('click', (event) => {
            const button = event.target.closest('[id^="btn-"]');
            if (button && commandMap[button.id]) {
                commandMap[button.id]();
            } else if (event.target.closest('.history-item')) {
                const historyIndex = event.target.closest('.history-item').dataset.index;
                if (historyIndex) {
                    restoreFromHistory(parseInt(historyIndex, 10));
                }
            }
        });

        const chaosSlider = document.getElementById('chaos-slider');
        if (chaosSlider) {
            chaosSlider.addEventListener('input', commandMap['chaos-slider']);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            const keyMap = {
                's': 'btn-save',
                'l': 'btn-load',
                'h': 'btn-history',
                'c': 'btn-copy',
                't': 'btn-toggle-theme',
            };
            if (event.altKey && keyMap[event.key.toLowerCase()]) {
                event.preventDefault();
                const btn = document.getElementById(keyMap[event.key.toLowerCase()]);
                btn?.click();
            }
        });
    }
};
