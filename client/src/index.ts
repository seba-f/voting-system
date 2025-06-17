import path from 'path';
import { app, BrowserWindow, Menu, nativeImage, session, ipcMain } from 'electron';

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Enable hot reload in development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (_) { console.log('Error'); }
}

// Setup get-window-id handler
ipcMain.on('get-window-id', (event) => {
  event.returnValue = event.sender.id;
});

const createWindow = async (): Promise<void> => {
  // Set up icon paths for different environments
  const isDev = process.env.NODE_ENV === 'development';
  const iconPath = isDev
    ? path.join(__dirname, '..', 'src', 'assets', 'icons', 'icon.ico')
    : path.join(__dirname, 'assets', 'icons', 'icon.ico');
    
  // Create a native image from the icon file
  const icon = nativeImage.createFromPath(iconPath);
  // Create a new window that does not inherit the parent's storage
  const parentSession = BrowserWindow.getAllWindows()[0]?.webContents.session;
  let partitionName;

  if (parentSession) {
    // For new windows, create a unique partition
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    partitionName = `persist:window-${sessionId}`;
  } else {
    // For the first window, use the default partition
    partitionName = 'persist:main';
  }

  // Create the browser window with appropriate session
  const mainWindow = new BrowserWindow({
    height: 1000,
    width: 1200,
    icon,
    frame: false, // Remove default frame
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      partition: partitionName
    },
  });
  // Handle window-specific events by using webContents ID
  const windowId = mainWindow.webContents.id;

  // Remove any existing handlers for this window ID (cleanup)
  ipcMain.removeHandler(`minimize-window-${windowId}`);
  ipcMain.removeHandler(`maximize-window-${windowId}`);
  ipcMain.removeHandler(`close-window-${windowId}`);

  // Add IPC handlers for window controls
  ipcMain.handle(`minimize-window-${windowId}`, () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle(`maximize-window-${windowId}`, () => {
    if (!mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle(`close-window-${windowId}`, () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // Add window-specific close handler
  mainWindow.on('closed', () => {
    // Clean up IPC handlers for this window
    ipcMain.removeHandler(`minimize-window-${windowId}`);
    ipcMain.removeHandler(`maximize-window-${windowId}`);
    ipcMain.removeHandler(`close-window-${windowId}`);

    // Check if there are any windows left
    if (BrowserWindow.getAllWindows().length === 0) {
      // Only quit the app when all windows are closed
      app.quit();
    }
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',          click: async () => {
            await createWindow();
          }
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
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
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template as Electron.MenuItemConstructorOptions[]);
  Menu.setApplicationMenu(menu);

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' http://localhost:5000;",
          "connect-src 'self' http://localhost:5000;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';"
        ].join(' ')
      }
    });
  });

  // Load the React app using the webpack entry point
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(async () => {
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
