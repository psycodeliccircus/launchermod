const { app, BrowserWindow, ipcMain, Tray, nativeImage, dialog, shell, Menu, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const AppMenu = require('./menu');
const RightMenuapp = require('./right-menu-config');

let mainWindow; // Variável para armazenar a janela principal
let tray = null; // Variável para armazenar o Tray
let rightMenu = Menu.buildFromTemplate(RightMenuapp);

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,  // Mantém a segurança ativa
            enableRemoteModule: false // Desabilita o remote (obsoleto)
        }
    });

    mainWindow.maximize();
    new AppMenu(mainWindow);  // Cria o menu
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'login.html'));

    //Load Right click menu
    mainWindow.webContents.on('context-menu', e => {
        rightMenu.popup(mainWindow);
    });

    const wc = mainWindow.webContents;

    // Prevenir navegação em links externos e abrir no navegador padrão
    wc.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            event.preventDefault();
            shell.openExternal(url); // Abre o link externo no navegador
        }
    });

    // Verificar atualizações assim que a janela for criada
    autoUpdater.checkForUpdates();
}

// Função para criar o Tray
function createTray() {
    const trayIcon = path.join(__dirname, 'build/icon.png'); // Caminho para o ícone da bandeja
    tray = new Tray(trayIcon);

    const trayMenu = Menu.buildFromTemplate([
        { label: 'Mostrar Aplicativo', click: () => { mainWindow.show(); } },
        { type: 'separator' }, // Separador
        {
            label: 'Redes Sociais',
            submenu: [
                {
                    label: 'YouTube',
                    click: () => {
                        shell.openExternal('https://www.youtube.com/@renildomarcio'); // Substitua pela sua URL
                    }
                },
                {
                    label: 'GitHub',
                    click: () => {
                        shell.openExternal('https://github.com/psycodeliccircus'); // Substitua pela sua URL
                    }
                }
            ]
        },
        { type: 'separator' }, // Separador
        { label: 'Sair', click: () => { app.quit(); } }
    ]);

    tray.setToolTip('Launcher Mods');
    tray.setContextMenu(trayMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
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

// Evento que é chamado quando o aplicativo está pronto
app.whenReady().then(() => {
    createWindow();
    createTray(); // Chama a função para criar o Tray
});

// Encerrar o aplicativo quando todas as janelas forem fechadas, exceto no macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recria a janela no macOS quando o ícone do dock é clicado e não há outras janelas abertas
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
