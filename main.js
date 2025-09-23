// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow; // Make mainWindow accessible to other functions
let hasUnsavedChanges = false; // Track unsaved changes

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#1e1e1e', // Match dark theme to prevent white flash
        show: false, // Don't show the window until the content is ready
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path.join(__dirname, 'assets/icon.png') 
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Gracefully show the window and set the initial title
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setTitle('tsDice - New Scene');
    });

    // Handle the window close event
    mainWindow.on('close', (event) => {
        if (hasUnsavedChanges) {
            event.preventDefault(); // Prevent the window from closing immediately
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['Quit Without Saving', 'Cancel', 'Save'],
                defaultId: 2,
                title: 'Confirm Quit',
                message: 'You have unsaved changes. Do you want to save them before quitting?'
            }).then(result => {
                if (result.response === 0) { // Quit Without Saving
                    hasUnsavedChanges = false; // Allow the window to close
                    mainWindow.close();
                } else if (result.response === 2) { // Save
                    // Send a message to the renderer to trigger the save process
                    mainWindow.webContents.send('menu-action', 'save-file-and-quit');
                }
                // If 'Cancel' (1), do nothing, the window remains open.
            });
        }
    });

    // Set the application menu
    const menu = Menu.buildFromTemplate(createAppMenu());
    Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
});


// --- Application Menu ---
function createAppMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Scene',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'load-file');
                    }
                },
                {
                    label: 'Save Scene',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'save-file');
                    }
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        }
    ];

    return template;
}


// --- IPC Handlers for Native File System Access ---

// Listen for a request from the renderer to quit the app after a successful save
ipcMain.on('quit-app', () => {
    hasUnsavedChanges = false; // Ensure the close event doesn't trigger another dialog
    app.quit();
});

// Listen for changes to the unsaved state from the renderer
ipcMain.on('set-unsaved-changes', (event, status) => {
    hasUnsavedChanges = status;
    if (!hasUnsavedChanges) {
        // If changes are saved, the title is set by the save/load handlers
    } else {
        // If there are new unsaved changes, update the title
        mainWindow?.setTitle('tsDice - New Scene*');
    }
});

// Handle request to save a file
ipcMain.handle('save-file', async (event, configString) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Save Scene',
        defaultPath: 'tsDice-scene.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (canceled || !filePath) {
        return { success: false, message: 'Save cancelled.' };
    }

    try {
        await fs.writeFile(filePath, configString);
        hasUnsavedChanges = false; // Reset unsaved changes flag
        mainWindow?.setTitle(`tsDice - ${path.basename(filePath)}`); // Update window title
        return { success: true, message: 'Scene saved successfully!', path: filePath };
    } catch (error) {
        console.error('Failed to save file:', error);
        return { success: false, message: `Failed to save scene: ${error.message}` };
    }
});

// Handle request to load a file
ipcMain.handle('load-file', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Load Scene',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, message: 'Load canceled.' };
    }

    const filePath = filePaths[0];

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        // Attempt to parse to ensure it's valid JSON before sending
        JSON.parse(fileContent);
        hasUnsavedChanges = false; // Reset unsaved changes flag
        mainWindow?.setTitle(`tsDice - ${path.basename(filePath)}`); // Update window title
        return { success: true, content: fileContent, path: filePath };
    } catch (error) {
        console.error('Failed to load file:', error);
        return { success: false, message: `Failed to load scene: ${error.message}` };
    }
});
