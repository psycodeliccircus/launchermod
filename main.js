const { app, BrowserWindow, ipcMain, session, Tray, nativeImage, shell, Menu, nativeTheme } = require('electron');
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

// Função para carregar as traduções
function loadTranslations(language) {
    const filePath = path.join(__dirname, `locales/${language}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const currentLanguage = 'pt'; // Mude para 'en' se preferir inglês
const translations = loadTranslations(currentLanguage);

ipcMain.on('set-language', (event, language) => {
    const translations = loadTranslations(language);
    mainWindow.webContents.send('language-updated', translations);
});

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.maximize();
    mainWindow.setResizable(true);
    mainWindow.setMaximizable(true);
    mainWindow.setMinimizable(true);
    //mainWindow.webContents.openDevTools();
    new AppMenu(mainWindow);
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'login.html'));

    // Load Right click menu
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
        const iconPath = process.env.NODE_ENV === 'development' 
            ? path.join(__dirname, 'build/icon.png') 
            : path.join(process.resourcesPath, 'build/icon.png');

        if (!fs.existsSync(iconPath)) {
            const fallbackIconPath = path.join(__dirname, 'build', 'icon.png');
            if (!fs.existsSync(fallbackIconPath)) {
                throw new Error(`Neither primary nor fallback icons found.`);
            }
            tray = new Tray(fallbackIconPath);
        } else {
            tray = new Tray(iconPath);
        }

        const trayMenu = Menu.buildFromTemplate([
            { label: 'Mostrar Aplicativo', click: () => { mainWindow.show(); } },
            { type: 'separator' },
            {
                label: 'Redes Sociais',
                submenu: [
                    { label: 'YouTube', click: () => shell.openExternal('https://www.youtube.com/@renildomarcio') },
                    { label: 'GitHub', click: () => shell.openExternal('https://github.com/psycodeliccircus') }
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

// Funções relacionadas a atualização
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

    const message = `${translations.downloadingUpdate}. Speed: ${speedFormatted}/s - ${~~progressObj.percent}% [${transferredFormatted}/${totalFormatted}]`;
    log.log(message);

    const swalMessage = `Swal.fire({
        title: '${translations.downloadingUpdate}',
        html: '${message}',
        allowOutsideClick: false,
        onBeforeOpen: () => Swal.showLoading()
    });`;

    mainWindow.webContents.executeJavaScript(swalMessage);
}

function handleUpdateError(err) {
    log.log(`Update check failed: ${translations.updateError}`);
}

function handleUpdateNotAvailable(info) {
    log.log(`Não há atualizações disponíveis para o launcher.`);
}

function handleUpdateDownloaded(info) {
    const swalMessage = `Swal.fire({
        title: '${translations.restartingApp}',
        html: '${translations.restartingApp}',
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
autoUpdater.on('update-detected', handleUpdateDownloaded);

// Evento quando o aplicativo está pronto
app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Evento de download
ipcMain.on('download-dlc', (event, downloadUrl) => {
    const win = BrowserWindow.getFocusedWindow();
    const downloadDir = app.getPath('downloads');
    
    win.webContents.downloadURL(downloadUrl);

    win.webContents.session.on('will-download', (event, item) => {
        const filePath = path.join(downloadDir, item.getFilename());

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Arquivo existente deletado: ${filePath}`);
            } catch (error) {
                console.error(`Erro ao deletar arquivo existente: ${error.message}`);
            }
        }

        item.setSavePath(filePath);

        item.on('updated', (event, state) => {
            if (state === 'progressing') {
                const progress = Math.round((item.getReceivedBytes() / item.getTotalBytes()) * 100);
                win.webContents.send('download-progress', { percent: progress });
            }
        });

        item.on('done', (event, state) => {
            if (state === 'completed') {
                const swalMessage = `Swal.fire({
                    title: '${translations.downloadComplete}',
                    html: '${translations.downloadSuccessMessage.replace('{{fileName}}', item.getFilename())}',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });`;
                mainWindow.webContents.executeJavaScript(swalMessage);
                win.webContents.send('download-complete');
            } else {
                const swalError = `Swal.fire({
                    title: '${translations.downloadError}',
                    text: '${translations.downloadFailedMessage}',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });`;
                mainWindow.webContents.executeJavaScript(swalError);
            }
        });
    });
});
