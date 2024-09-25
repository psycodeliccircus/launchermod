const { app } = require('electron');
const MainWindow = require('./window');
const AppMenu = require('./menu');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;

// Evento que é chamado quando o aplicativo está pronto
app.whenReady().then(() => {
    mainWindow = new MainWindow();
    mainWindow.createWindow();

    autoUpdater.checkForUpdates();

    new AppMenu(mainWindow);  // Cria o menu
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
  