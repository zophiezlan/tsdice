const { contextBridge, ipcRenderer } = require('electron');

// Whitelist of valid channels for IPC communication
const validInvokeChannels = ['save-file', 'load-file'];
const validSendChannels = ['set-unsaved-changes', 'quit-app'];
const validOnChannels = ['menu-action'];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Sends a one-way message to the main process.
     * @param {string} channel - The IPC channel to send to. Must be in the whitelist.
     * @param {...any} args - Arguments to pass to the IPC handler.
     */
    send: (channel, ...args) => {
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        } else {
            console.error(`Attempted to send on a non-whitelisted channel: ${channel}`);
        }
    },

    /**
     * Invokes a channel on the main process and returns a promise that resolves with the result.
     * @param {string} channel - The IPC channel to invoke. Must be in the whitelist.
     * @param {...any} args - Arguments to pass to the IPC handler.
     * @returns {Promise<any>} - A promise that resolves with the result from the main process.
     */
    invoke: (channel, ...args) => {
        if (validInvokeChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        // It's good practice to throw an error or log if a non-whitelisted channel is used.
        console.error(`Attempted to invoke a non-whitelisted channel: ${channel}`);
    },

    /**
     * Listens to a channel from the main process.
     * @param {string} channel - The IPC channel to listen to. Must be in the whitelist.
     * @param {Function} func - The callback function to execute when a message is received.
     */
    on: (channel, func) => {
        if (validOnChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            // Return a cleanup function to remove the listener
            return () => ipcRenderer.removeListener(channel, subscription);
        }
        console.error(`Attempted to listen on a non-whitelisted channel: ${channel}`);
    }
});
