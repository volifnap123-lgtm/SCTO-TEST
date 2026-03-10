const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    openDevTools: () => ipcRenderer.send('open-devtools'),
    onAppVersion: (callback) => ipcRenderer.on('app-version', (event, version) => callback(version))
});