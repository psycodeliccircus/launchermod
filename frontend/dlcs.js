let dlcs = [];
const dlcsPerPage = 10;
let currentDLCPage = 1;

// Carrega os DLCs
async function loadDLCs() {
    try {
        const response = await fetch('https://api.renildomarcio.com.br/backend/get_dlcs.php');
        const data = await response.json();
        dlcs = Array.isArray(data) && data.length > 0 ? data : [];
        displayDLCs();
        if (dlcs.length > 0) {
            createDLCPagination();
        }
    } catch (error) {
        displayErrorMessage('Erro ao carregar DLCs. Tente novamente mais tarde.');
    }
}

// Exibe os DLCs na tabela
function displayDLCs() {
    const dlcList = document.getElementById('dlcList');
    dlcList.innerHTML = ''; // Limpa a lista

    const start = (currentDLCPage - 1) * dlcsPerPage;
    const end = start + dlcsPerPage;
    const paginatedDLCs = dlcs.slice(start, end);

    if (paginatedDLCs.length === 0) {
        displayErrorMessage('Nenhum DLC disponível no momento.');
        return;
    }

    paginatedDLCs.forEach(dlc => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${dlc.name}</td>
            <td>
                <a href="#" class="report download-link">
                    <i class="bx bx-cloud-download"></i>
                    <span>Download</span>
                </a>
                <div class="progress mt-2" style="display: none;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
            </td>
        `;

        const downloadLink = row.querySelector('.download-link');
        const progressBarContainer = row.querySelector('.progress');
        const progressBar = row.querySelector('.progress-bar');

        downloadLink.addEventListener('click', (event) => {
            event.preventDefault();
            startDownload(dlc.download_link, downloadLink, progressBarContainer, progressBar);
        });

        dlcList.appendChild(row);
    });
}

// Lida com a lógica do download
function startDownload(downloadLink, linkElement, progressBarContainer, progressBar) {
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    // Desabilita o link de download
    linkElement.style.pointerEvents = 'none';
    linkElement.style.opacity = '0.5';

    console.log('Iniciando download de:', downloadLink);
    window.electronAPI.startDownload(downloadLink);

    // Atualiza o progresso
    window.electronAPI.onDownloadProgress((progress) => {
        const percent = Math.round(progress.percent);
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
        progressBar.textContent = `${percent}%`;
    });

    // Conclui o download
    window.electronAPI.onDownloadComplete(() => {
        progressBar.className = 'progress-bar progress-bar-striped bg-success';
        progressBar.style.width = '100%';
        progressBar.textContent = 'Download Completo!';

        // Oculta a barra de progresso após 5 segundos
        setTimeout(() => {
            progressBarContainer.style.display = 'none';
        }, 5000);
    });
}

// Exibe uma mensagem de erro
function displayErrorMessage(message) {
    const dlcList = document.getElementById('dlcList');
    dlcList.innerHTML = `
        <tr>
            <td colspan="2" class="text-center text-danger">${message}</td>
        </tr>
    `;
}

// Cria a paginação
function createDLCPagination() {
    const pagination = document.getElementById('dlcPagination');
    pagination.innerHTML = ''; // Limpa a paginação

    const totalPages = Math.ceil(dlcs.length / dlcsPerPage);
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botão "Anterior"
    ul.appendChild(createPaginationButton('«', currentDLCPage === 1, () => {
        if (currentDLCPage > 1) {
            currentDLCPage--;
            updateDLCPagination();
        }
    }));

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        ul.appendChild(createPaginationButton(i, i === currentDLCPage, () => {
            currentDLCPage = i;
            updateDLCPagination();
        }));
    }

    // Botão "Próximo"
    ul.appendChild(createPaginationButton('»', currentDLCPage === totalPages, () => {
        if (currentDLCPage < totalPages) {
            currentDLCPage++;
            updateDLCPagination();
        }
    }));

    nav.appendChild(ul);
    pagination.appendChild(nav);
}

// Cria um item de botão de paginação
function createPaginationButton(text, isDisabledOrActive, onClick) {
    const li = document.createElement('li');
    li.className = `page-item ${isDisabledOrActive ? (typeof text === 'number' ? 'active' : 'disabled') : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = text;
    if (!isDisabledOrActive) {
        a.addEventListener('click', (event) => {
            event.preventDefault();
            onClick();
        });
    }
    li.appendChild(a);
    return li;
}

// Atualiza a exibição de DLCs e a paginação
function updateDLCPagination() {
    createDLCPagination();
    displayDLCs();
}

// Chama a função de carregar DLCs quando a página for carregada
document.addEventListener('DOMContentLoaded', loadDLCs);
