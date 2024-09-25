const { app } = require('electron');
const MainWindow = require('./window');
const Updater = require('./autoUpdater');
const AppMenu = require('./menu');
const AppTray = require('./tray');

let mainWindow;

// Evento que é chamado quando o aplicativo está pronto
app.whenReady().then(() => {
    mainWindow = new MainWindow();
    mainWindow.createWindow();

    new AppMenu(mainWindow);  // Cria o menu
    new AppTray(mainWindow);   // Cria o Tray

    const updater = new Updater(mainWindow);
    updater.checkForUpdates();
});

// Encerrar o aplicativo quando todas as janelas forem fechadas, exceto no macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recria a janela no macOS quando o ícone do dock é clicado e não há outras janelas abertas
app.on('activate', () => {
    if (mainWindow.mainWindow && mainWindow.mainWindow.isDestroyed()) {
        mainWindow.createWindow();
    }
});
