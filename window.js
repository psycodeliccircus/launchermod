const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

class MainWindow {
    constructor() {
        this.mainWindow = null;
        this.WINDOW_CONFIG = {
            width: 1200,
            height: 800,
            icon: path.join(__dirname, 'build/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,  // Mantém a segurança ativa
                enableRemoteModule: false // Desabilita o remote (obsoleto)
            }
        };
    }

    createWindow() {
        this.mainWindow = new BrowserWindow(this.WINDOW_CONFIG);
        this.mainWindow.maximize();
        this.mainWindow.loadFile(path.join(__dirname, 'frontend', 'login.html'));

        // Prevenir navegação em links externos e abrir no navegador padrão
        this.mainWindow.webContents.on('will-navigate', this.handleExternalLinks);
    }

    handleExternalLinks(event, url) {
        const parsedUrl = new URL(url);
        if (['http:', 'https:'].includes(parsedUrl.protocol)) {
            event.preventDefault();
            shell.openExternal(url); // Abre o link externo no navegador
        }
    }
}

// Manipuladores de atualização
function handleUpdateChecking() {
  log.log('Checking for updates.');
}
    
function handleUpdateAvailable(info) {
  log.log('Update available.');
}
    
function handleDownloadProgress(progressObj) {
  const message = `Downloading update. Speed: ${progressObj.bytesPerSecond} - ${~~progressObj.percent}% [${progressObj.transferred}/${progressObj.total}]`;
  log.log(message);
  const swalMessage = `Swal.fire({
    title: 'Baixando atualização',
    html: '${message}',
    allowOutsideClick: false,
    onBeforeOpen: () => Swal.showLoading()
  });`;
 
  mainWindow.webContents.executeJavaScript(swalMessage);
}
    
function handleUpdateError(err) {
  log.log(`Update check failed: ${err.toString()}`);
}
    
function handleUpdateNotAvailable(info) {
  log.log(`Não há atualizações disponíveis para o launcher.`);
}
    
function handleUpdateDownloaded(info) {
  const swalMessage = `Swal.fire({
    title: 'Reiniciando o aplicativo',
    html: 'Aguente firme, reiniciando o aplicativo para atualização!',
    allowOutsideClick: false,
    onBeforeOpen: () => Swal.showLoading()
  });`;
    
  mainWindow.webContents.executeJavaScript(swalMessage);
  autoUpdater.quitAndInstall();
}
    
autoUpdater.on('checking-for-update', handleUpdateChecking);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('error', handleUpdateError);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);

module.exports = MainWindow;
