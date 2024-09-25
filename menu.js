const { app, Menu } = require('electron');
const path = require('path');
const { shell } = require('electron');
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
                label: 'Launcher Mods v' + app.getVersion(),
                submenu: [
                    {
                        label: 'Verificar Atualizações', // Novo botão para verificar atualizações
                        click: () => {
                            autoUpdater.checkForUpdates(); // Chama o método para verificar atualizações manualmente
                            log.log('Apertou no autoUpdater.');
                        }
                    },
                    {
                        label: 'Sair',
                            click: () => {
                            app.quit();
                            log.log('Apertou no sair.');
                        }
                    },
                    { type: 'separator' }, // Separador
                    {
                        label: 'Redes Sociais',
                        submenu: [
                            {
                                label: 'YouTube',
                                click: () => {
                                    shell.openExternal('https://www.youtube.com/@renildomarcio'); // Substitua pela sua URL
                                    log.log('Apertou no youtube.');
                                }
                            },
                            {
                                label: 'GitHub',
                                click: () => {
                                    shell.openExternal('https://github.com/psycodeliccircus'); // Substitua pela sua URL
                                    log.log('Apertou no github.');
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }
}

module.exports = AppMenu;
