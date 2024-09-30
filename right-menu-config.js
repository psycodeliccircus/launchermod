const { ipcMain } = require('electron');
const { app, shell } = require('electron');

module.exports = [
    {
        label: 'Launcher Mods v' + app.getVersion(),
    },
    {
        label: 'Reload',
        role: 'reload',
    },
    {
        label: 'Sair',
        role: 'quit',
    },
    { type: 'separator' },
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
    },
]