const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld('api', {
    // Example: Expose a function to send a message to the main process.
    // This will be used for save/load operations.
    // renderer.js -> preload.js -> main.js
    invoke: (channel, data) => {
        let validChannels = ['save-file', 'load-file']; // Whitelist of channels
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    },
    // Example: Expose a function to receive messages from the main process.
    // main.js -> preload.js -> renderer.js
    on: (channel, func) => {
        let validChannels = ['from-main']; // Whitelist of channels
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
