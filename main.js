const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Swal = require('sweetalert2');

let mainWindow; // Variável para armazenar a janela principal

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,  // Mantém a segurança ativa
            enableRemoteModule: false // Desabilita o remote (obsoleto)
        }
    });

    mainWindow.maximize();
    mainWindow.setMenu(null); // Remove o menu padrão
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'login.html'));

    const wc = mainWindow.webContents;

    // Prevenir navegação em links externos e abrir no navegador padrão
    wc.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            event.preventDefault();
            shell.openExternal(url); // Abre o link externo no navegador
        }
    });

    // Verificar atualizações assim que a janela for criada
    checkForUpdates();
}

// Função para monitorar o progresso de download
function handleDownloadProgress(progressObj) {
    const message = `Velocidade: ${(progressObj.bytesPerSecond / 1024).toFixed(2)} KB/s - ${Math.floor(progressObj.percent)}% 
    (${(progressObj.transferred / 1024).toFixed(2)} KB de ${(progressObj.total / 1024).toFixed(2)} KB)`;

    // Atualizar a janela do SweetAlert2 com o progresso, se o alerta estiver ativo
    if (Swal.isVisible()) {
        Swal.update({
            title: 'Baixando atualização',
            html: message,
            allowOutsideClick: false,
            showConfirmButton: false, // Remove o botão de confirmação
            onBeforeOpen: () => Swal.showLoading() // Mantém o loading ativo
        });
    }
}

// Função para configurar e checar atualizações
function checkForUpdates() {
    // Configurações do autoUpdater
    autoUpdater.autoDownload = false; // Para solicitar confirmação antes de baixar a atualização

    // Notificação de que está checando por atualizações
    autoUpdater.on('checking-for-update', () => {
        Swal.fire({
            title: 'Verificando atualizações',
            text: 'Aguarde enquanto verificamos se há novas atualizações.',
            allowOutsideClick: false,
            showConfirmButton: false,
            onBeforeOpen: () => Swal.showLoading()
        });
    });

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
            } else {
                Swal.fire({
                    title: 'Atualização cancelada',
                    text: 'Você pode verificar por atualizações mais tarde.',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
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

    // Erro ao verificar atualizações
    autoUpdater.on('error', (err) => {
        console.error('Erro ao verificar atualizações:', err);
        dialog.showErrorBox('Erro ao verificar atualizações', err == null ? "Erro desconhecido" : (err.stack || err).toString());
        Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro ao verificar atualizações. Tente novamente mais tarde.',
            icon: 'error'
        });
    });

    // Sem atualizações disponíveis
    autoUpdater.on('update-not-available', () => {
        Swal.fire({
            title: 'Sem atualizações disponíveis',
            text: 'Você já está usando a versão mais recente.',
            icon: 'info',
            confirmButtonText: 'OK'
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

// Encerrar o aplicativo quando todas as janelas forem fechadas, exceto no macOS
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
