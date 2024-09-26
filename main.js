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
    try {
        // Define o caminho do ícone com base no ambiente
        const iconPath = process.env.NODE_ENV === 'development' 
            ? path.join(__dirname, 'build/icon.png') 
            : path.join(process.resourcesPath, 'build/icon.png');

        // Verifica se o ícone existe no caminho primário
        if (!fs.existsSync(iconPath)) {
            console.warn(`Icon not found at path: ${iconPath}, trying fallback path...`);
            // Define um caminho alternativo
            const fallbackIconPath = path.join(__dirname, 'build', 'icon.png');
            
            // Verifica se o ícone de fallback existe
            if (!fs.existsSync(fallbackIconPath)) {
                throw new Error(`Neither primary nor fallback icons found. Primary: ${iconPath}, Fallback: ${fallbackIconPath}`);
            }

            // Se o ícone principal não foi encontrado, use o de fallback
            tray = new Tray(fallbackIconPath);
        } else {
            // Se o ícone principal foi encontrado
            tray = new Tray(iconPath);
        }

        const trayMenu = Menu.buildFromTemplate([
            { label: 'Mostrar Aplicativo', click: () => { mainWindow.show(); } },
            { type: 'separator' },
            {
                label: 'Redes Sociais',
                submenu: [
                    {
                        label: 'YouTube',
                        click: () => {
                            shell.openExternal('https://www.youtube.com/@renildomarcio');
                        }
                    },
                    {
                        label: 'GitHub',
                        click: () => {
                            shell.openExternal('https://github.com/psycodeliccircus');
                        }
                    }
                ]
            },
            { type: 'separator' },
            { label: 'Sair', click: () => { app.quit(); } }
        ]);

        tray.setToolTip('Launcher Mods');
        tray.setContextMenu(trayMenu);

        tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        });

    } catch (error) {
        console.error('Failed to load tray icon:', error.message);
    }
}

// Manipuladores de atualização
function handleUpdateChecking() {
    log.log('Checking for updates.');
}

function handleUpdateAvailable(info) {
    log.log('Update available.');
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function handleDownloadProgress(progressObj) {
    const transferredFormatted = formatBytes(progressObj.transferred);
    const totalFormatted = formatBytes(progressObj.total);
    const speedFormatted = formatBytes(progressObj.bytesPerSecond);
    
    const message = `Downloading update. Speed: ${speedFormatted}/s - ${~~progressObj.percent}% [${transferredFormatted}/${totalFormatted}]`;
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
