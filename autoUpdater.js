const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

class AutoUpdater {
    constructor(mainWindow) {
        mainWindow = mainWindow;

        // Configurar o autoUpdater para registrar logs
        autoUpdater.logger = log;
        autoUpdater.logger.transports.file.level = 'info';

        // Vincular os eventos
        this.bindEvents();
    }

    // Função para verificar atualizações manualmente
    checkForUpdates() {
        log.log('Verificando manualmente por atualizações.');
        autoUpdater.checkForUpdates();
    }

    // Função para vincular os manipuladores de eventos
    bindEvents() {
        autoUpdater.on('checking-for-update', () => {
            log.log('Checking for updates.');
            mainWindow.webContents.executeJavaScript(`
                Swal.fire({
                    title: 'Procurando por atualizações...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => Swal.showLoading()
                });
            `);
        });

        autoUpdater.on('update-available', (info) => {
            log.log('Update available.');
            mainWindow.webContents.executeJavaScript(`
                Swal.fire({
                    title: 'Atualização disponível',
                    text: 'Uma nova atualização está disponível!',
                    icon: 'info',
                    allowOutsideClick: false
                });
            `);
        });

        autoUpdater.on('update-not-available', () => {
            log.log('Não há atualizações disponíveis para o launcher.');
            mainWindow.webContents.executeJavaScript(`
                Swal.fire({
                    title: 'Nenhuma atualização disponível',
                    text: 'Você já está utilizando a versão mais recente.',
                    icon: 'info',
                    allowOutsideClick: true
                });
            `);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            const message = `Downloading update. Speed: ${progressObj.bytesPerSecond} - ${~~progressObj.percent}% [${progressObj.transferred}/${progressObj.total}]`;
            log.log(message);

            const swalMessage = `Swal.fire({
                title: 'Baixando atualização',
                html: '${message}',
                allowOutsideClick: false,
                onBeforeOpen: () => Swal.showLoading()
            });`;

            mainWindow.webContents.executeJavaScript(swalMessage);
        });

        autoUpdater.on('error', (err) => {
            log.log(`Update check failed: ${err.toString()}`);
            mainWindow.webContents.executeJavaScript(`
                Swal.fire({
                    title: 'Erro ao buscar atualização',
                    text: '${err.toString()}',
                    icon: 'error',
                    allowOutsideClick: true
                });
            `);
        });

        autoUpdater.on('update-downloaded', () => {
            log.log('Atualização baixada. Reiniciando o aplicativo...');
            const swalMessage = `Swal.fire({
                title: 'Reiniciando o aplicativo',
                html: 'Aguente firme, reiniciando o aplicativo para aplicar a atualização!',
                allowOutsideClick: false,
                onBeforeOpen: () => Swal.showLoading()
            });`;

            mainWindow.webContents.executeJavaScript(swalMessage);
            autoUpdater.quitAndInstall();
        });
    }
}

module.exports = AutoUpdater;
