const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Swal = require('sweetalert2');

// Função para criar a janela principal
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,  // Mantém a segurança ativa
            enableRemoteModule: false // Desabilita o remote (obsoleto)
        }
    });

    win.maximize();

    // Remove o menu padrão
    win.setMenu(null);

    // Carrega a página de login ao iniciar
    win.loadFile(path.join(__dirname, 'frontend', 'login.html'));

    const wc = win.webContents;

    // Prevenir navegação em links externos e abrir no navegador padrão
    wc.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            event.preventDefault();
            shell.openExternal(url); // Abre o link externo no navegador
        }
    });

    // Abrir DevTools (opcional)
    // win.webContents.openDevTools();

    // Verificar atualizações assim que a janela for criada
    checkForUpdates(win);
}

// Função para monitorar o progresso de download
function handleDownloadProgress(progressObj) {
    const message = `Velocidade: ${(progressObj.bytesPerSecond / 1024).toFixed(2)} KB/s - ${Math.floor(progressObj.percent)}% 
    (${(progressObj.transferred / 1024).toFixed(2)} KB de ${(progressObj.total / 1024).toFixed(2)} KB)`;

    // Atualizar a janela do SweetAlert2 com o progresso
    Swal.update({
        title: 'Baixando atualização',
        html: message,
        allowOutsideClick: false,
        showConfirmButton: false, // Remove o botão de confirmação
        onBeforeOpen: () => Swal.showLoading() // Mantém o loading ativo
    });
}

// Função para configurar e checar atualizações
function checkForUpdates(win) {
    // Configurações do autoUpdater
    autoUpdater.autoDownload = false; // Para solicitar confirmação antes de baixar a atualização

    // Notificação de nova atualização disponível
    autoUpdater.on('update-available', () => {
        Swal.fire({
            title: 'Nova atualização disponível!',
            text: 'Deseja baixar a atualização agora?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sim, baixar!',
            cancelButtonText: 'Não'
        }).then((result) => {
            if (result.isConfirmed) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    // Monitorar o progresso do download
    autoUpdater.on('download-progress', (progressObj) => {
        handleDownloadProgress(progressObj);
    });
    
    // Atualização já baixada e pronta para instalação
    autoUpdater.on('update-downloaded', () => {
        Swal.fire({
            title: 'Atualização pronta!',
            text: 'A atualização foi baixada. O aplicativo será reiniciado para aplicar a atualização.',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'Reiniciar agora'
        }).then(() => {
            autoUpdater.quitAndInstall(); // Reinicia e instala a nova versão
        });
    });

    // Verificar atualizações automaticamente ao iniciar
    autoUpdater.checkForUpdates().catch(err => {
        console.error('Erro ao verificar atualizações:', err);
        dialog.showErrorBox('Erro ao verificar atualizações', err == null ? "Erro desconhecido" : (err.stack || err).toString());
    });
}

// Evento que é chamado quando o aplicativo está pronto
app.whenReady().then(createWindow);

// Encerrar o aplicativo quando todas as janelas estiverem fechadas, exceto no macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recria a janela no macOS quando o ícone do dock é clicado e não há outras janelas abertas
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
