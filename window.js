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

module.exports = MainWindow;