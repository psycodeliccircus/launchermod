const { app, Tray, Menu } = require('electron');
const path = require('path');
const { shell } = require('electron');

class AppTray {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.tray = null;
        this.createTray();
    }

    createTray() {
        this.tray = new Tray(path.join(__dirname, 'build/icon.png'));
        
        const contextMenu = Menu.buildFromTemplate([
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
        ]);

        this.tray.setToolTip('Launcher Mods');
        this.tray.setContextMenu(contextMenu);

        // Evento de clique no ícone da bandeja
        this.tray.on('click', () => {
            this.mainWindow.mainWindow.isVisible() ? this.mainWindow.mainWindow.hide() : this.mainWindow.mainWindow.show();
        });
    }
}

module.exports = AppTray;
