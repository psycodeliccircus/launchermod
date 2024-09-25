const { app, Menu } = require('electron');
const path = require('path');
const { shell } = require('electron'); // Adicione isso para abrir links no navegador

class AppMenu {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.createMenu();
    }

    createMenu() {
        const menuTemplate = [
            {
                label: 'Launcher Mods',
                submenu: [
                    {
                        label: 'Mostrar',
                        click: () => {
                            this.mainWindow.mainWindow.show();
                        }
                    },
                    {
                        label: 'Sair',
                            click: () => {
                            app.quit();
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
                                }
                            },
                            {
                                label: 'GitHub',
                                click: () => {
                                    shell.openExternal('https://github.com/psycodeliccircus'); // Substitua pela sua URL
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
