let dlcs = [];
const dlcsPerPage = 10;
let currentDLCPage = 1;

// Mapeamento de imagens para cada jogo
const gameImages = {
    'ETS2': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/6126a8c3005e0305691e1612c2687063.png',
    'ats': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/c542f9de6ff5f021f1946ddbe8c39c97.md.png',
    'gta5': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/16eac7ff051e1f71d8d1f3d8c1b8de7f.md.png',
    'FiveM': 'https://chevereto.renildomarcio.com.br/images/2024/09/29/0d9e69bf39b71a6f2792b7ed1fbb8d18.md.png',
    // Adicione mais jogos e caminhos de imagem conforme necessário
};

// Carrega os DLCs do backend
async function loadDLCS() {
    try {
        const response = await fetch('https://api.renildomarcio.com.br/backend/get_dlcs.php');
        const data = await response.json();
        dlcs = Array.isArray(data) && data.length > 0 ? data : [];
        displayDLCS();
        if (dlcs.length > 0) {
            createDLCPagination();
        }
    } catch (error) {
        displayErrorMessage(translations[currentLanguage].errorLoadingDLCS);
    }
}

// Exibe os DLCs na tabela
function displayDLCS() {
    const dlcList = document.getElementById('dlcList');
    dlcList.innerHTML = ''; // Limpa a tabela

    const start = (currentDLCPage - 1) * dlcsPerPage;
    const end = start + dlcsPerPage;
    const paginatedDLCS = dlcs.slice(start, end);

    if (paginatedDLCS.length === 0) {
        displayErrorMessage(translations[currentLanguage].noDLCS);
        return;
    }

    paginatedDLCS.forEach(dlc => {
        const row = document.createElement('tr');

        // Verificar se existe uma imagem para o jogo
        const gameImage = gameImages[dlc.game] || 'https://chevereto.renildomarcio.com.br/images/2024/09/28/07f8d8b3a02baab83b45f8f191e95006.md.png'; // Imagem padrão se não encontrar

        row.innerHTML = `
            <td>
                <img src="${gameImage}" alt="${dlc.name}" style="width: 50px; height: auto;" class="img-tooltip" data-toggle="tooltip" data-placement="top" title="${dlc.name}">
            </td>
            <td>${dlc.name}</td>
            <td>
                <a href="#" class="report download-link">
                    <i class="bx bx-cloud-download"></i>
                    <span>${translations[currentLanguage].download}</span>
                </a>
                <div class="progress mt-2" style="display: none;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
            </td>
        `;

        // Evento de clique no link de download
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
    progressBarContainer.style.display = ''; 
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
        progressBar.textContent = translations[currentLanguage].downloadComplete; 

        // Oculta a barra após 5 segundos
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
            <td colspan="3" class="text-center text-danger">${message}</td>
        </tr>
    `;
}

// Cria a paginação
function createDLCPagination() {
    const pagination = document.getElementById('dlcPagination');
    pagination.innerHTML = ''; // Limpa a paginação existente

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

// Cria um item de botão da paginação
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
    displayDLCS();
}

// Chama a função de carregar DLCs quando estiver na página de DLCs
if (window.location.pathname.endsWith('dlcs.html')) {
    loadDLCS();
}
