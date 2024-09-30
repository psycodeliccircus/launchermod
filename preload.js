const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setLanguage: (language) => ipcRenderer.send('set-language', language),
    startDownload: (url) => ipcRenderer.send('download-dlc', url),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress)),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback)
});