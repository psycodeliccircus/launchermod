let mods = [];
const modsPerPage = 10;
let currentPage = 1;

// Mapeamento de imagens para cada jogo
const gameImages = {
    'ETS2': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/6126a8c3005e0305691e1612c2687063.png',
    'ats': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/c542f9de6ff5f021f1946ddbe8c39c97.md.png',
    'gta5': 'https://chevereto.renildomarcio.com.br/images/2024/09/28/16eac7ff051e1f71d8d1f3d8c1b8de7f.md.png',
    // Adicione mais jogos e caminhos de imagem conforme necessário
};

// Carrega os mods do backend
async function loadMods() {
    try {
        const response = await fetch('https://api.renildomarcio.com.br/backend/get_mods.php');
        const data = await response.json();
        mods = Array.isArray(data) && data.length > 0 ? data : [];
        displayMods();
        if (mods.length > 0) {
            createPagination();
        }
    } catch (error) {
        displayErrorMessage('Erro ao carregar os mods. Tente novamente mais tarde.');
    }
}

// Exibe os mods na tabela
function displayMods() {
    const modList = document.getElementById('modList');
    modList.innerHTML = ''; // Limpa a tabela

    const start = (currentPage - 1) * modsPerPage;
    const end = start + modsPerPage;
    const paginatedMods = mods.slice(start, end);

    if (paginatedMods.length === 0) {
        displayErrorMessage('Nenhum mod disponível no momento.');
        return;
    }

    paginatedMods.forEach(mod => {
        const row = document.createElement('tr');

        // Verificar se existe uma imagem para o jogo
        const gameImage = gameImages[mod.game] || 'https://chevereto.renildomarcio.com.br/images/2024/09/28/07f8d8b3a02baab83b45f8f191e95006.md.png'; // Imagem padrão se não encontrar

        row.innerHTML = `
            <td>
                <img src="${gameImage}" alt="${mod.game}" style="width: 50px; height: auto;">
            </td>
            <td>${mod.game}</td>
            <td>${mod.name}</td>
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

        // Evento de clique no link de download
        const downloadLink = row.querySelector('.download-link');
        const progressBarContainer = row.querySelector('.progress');
        const progressBar = row.querySelector('.progress-bar');

        downloadLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            startDownload(mod.download_link, downloadLink, progressBarContainer, progressBar);
        });

        modList.appendChild(row);
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
        progressBar.textContent = 'Download Completo!'; 

        // Oculta a barra após 5 segundos
        setTimeout(() => {
            progressBarContainer.style.display = 'none'; 
        }, 5000);
    });
}

// Exibe uma mensagem de erro
function displayErrorMessage(message) {
    const modList = document.getElementById('modList');
    modList.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-danger">${message}</td>
        </tr>
    `;
}

// Cria a paginação
function createPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Limpa a paginação existente

    const totalPages = Math.ceil(mods.length / modsPerPage);
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botão "Anterior"
    ul.appendChild(createPaginationButton('«', currentPage === 1, () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    }));

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        ul.appendChild(createPaginationButton(i, i === currentPage, () => {
            currentPage = i;
            updatePagination();
        }));
    }

    // Botão "Próximo"
    ul.appendChild(createPaginationButton('»', currentPage === totalPages, () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
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

// Atualiza a exibição de mods e a paginação
function updatePagination() {
    createPagination();
    displayMods();
}

// Chama a função de carregar mods quando estiver na página de mods
if (window.location.pathname.endsWith('mods.html')) {
    loadMods();
}
