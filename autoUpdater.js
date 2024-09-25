const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

class Updater {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;

        // Registrando os manipuladores de eventos de atualização
        this.registerUpdateHandlers();
    }

    registerUpdateHandlers() {
        autoUpdater.on('checking-for-update', () => log.log('Checking for updates.'));
        autoUpdater.on('update-available', () => log.log('Update available.'));
        autoUpdater.on('download-progress', this.handleDownloadProgress.bind(this));
        autoUpdater.on('error', (err) => log.log(`Update check failed: ${err.toString()}`));
        autoUpdater.on('update-not-available', () => log.log('Não há atualizações disponíveis para o launcher.'));
        autoUpdater.on('update-downloaded', this.handleUpdateDownloaded.bind(this));
    }

    handleDownloadProgress(progressObj) {
        const message = `Downloading update. Speed: ${progressObj.bytesPerSecond} - ${~~progressObj.percent}% [${progressObj.transferred}/${progressObj.total}]`;
        log.log(message);
        this.displaySwalMessage('Baixando atualização', message);
    }

    handleUpdateDownloaded() {
        this.displaySwalMessage('Reiniciando o aplicativo', 'Aguente firme, reiniciando o aplicativo para atualização!');
        autoUpdater.quitAndInstall();
    }

    displaySwalMessage(title, message) {
        const swalMessage = `
            Swal.fire({
                title: '${title}',
                html: '${message}',
                allowOutsideClick: false,
                onBeforeOpen: () => Swal.showLoading()
            });
        `;
        this.mainWindow.webContents.executeJavaScript(swalMessage);
    }

    checkForUpdates() {
        autoUpdater.checkForUpdates();
    }
}

module.exports = Updater;
