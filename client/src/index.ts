import path from 'path';
import { app, BrowserWindow, Menu, nativeImage, session } from 'electron';

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
    height: 600,
    width: 800,
    icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      partition: partitionName
    },
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
