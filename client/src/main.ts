import { app, BrowserWindow } from 'electron';

// Prevent multiple instances lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we don't get the lock, quit immediately
  app.quit();
} else {
  // Modify your existing createWindow function to accept a port number
  const createWindow = (port: number = 3000) => {
    const mainWindow = new BrowserWindow({
      // ...existing window options...
    });

    // Load with different ports
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL(`http://localhost:${port}`);
    } else {
      mainWindow.loadFile('index.html');
    }
  };

  app.on('ready', () => {
    // Get port from environment or use default
    const port = parseInt(process.env.PORT || '3000', 10);
    createWindow(port);
  });
}