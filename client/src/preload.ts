import { contextBridge, ipcRenderer } from 'electron';

//preload scripts
contextBridge.exposeInMainWorld('electron', {
    minimize: async () => {
        const windowId = ipcRenderer.sendSync('get-window-id');
        return ipcRenderer.invoke(`minimize-window-${windowId}`);
    },
    maximize: async () => {
        const windowId = ipcRenderer.sendSync('get-window-id');
        return ipcRenderer.invoke(`maximize-window-${windowId}`);
    },
    close: async () => {
        const windowId = ipcRenderer.sendSync('get-window-id');
        return ipcRenderer.invoke(`close-window-${windowId}`);
    },
});
