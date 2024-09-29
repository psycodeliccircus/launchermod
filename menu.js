const { app, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

class AppMenu {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.createMenu();
    }

    createMenu() {
        const menuTemplate = [
            {
                label: `Launcher Mods v${app.getVersion()}`,
                submenu: [
                    this.createUpdateMenuItem(),
                    this.createExitMenuItem(),
                    { type: 'separator' },
                    this.createSocialMediaSubmenu()
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }

    createUpdateMenuItem() {
        return {
            label: 'Verificar Atualizações',
            click: () => {
                this.checkForUpdates();
            }
        };
    }

    createExitMenuItem() {
        return {
            label: 'Sair',
            click: () => {
                app.quit();
                this.logAction('Apertou no sair.');
            }
        };
    }

    createSocialMediaSubmenu() {
        return {
            label: 'Redes Sociais',
            submenu: [
                this.createSocialMediaItem('YouTube', 'https://www.youtube.com/@renildomarcio'),
                this.createSocialMediaItem('GitHub', 'https://github.com/psycodeliccircus')
            ]
        };
    }

    createSocialMediaItem(label, url) {
        return {
            label,
            click: () => {
                shell.openExternal(url);
                this.logAction(`Apertou no ${label.toLowerCase()}.`);
            }
        };
    }

    checkForUpdates() {
        autoUpdater.checkForUpdates();
        this.logAction('Apertou no autoUpdater.');
    }

    logAction(message) {
        log.log(message);
    }
}

module.exports = AppMenu;
