const { contextBridge, ipcRenderer } = require('electron');

// Expondo funções do Node.js no contexto seguro da web
contextBridge.exposeInMainWorld('electronAPI', {
    startDownload: (url) => ipcRenderer.send('download-dlc', url),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress)),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback)
});
