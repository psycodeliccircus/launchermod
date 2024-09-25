let mods = [];
const modsPerPage = 10;
let currentPage = 1;

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
        console.error('Erro ao buscar mods:', error);
        displayErrorMessage('Erro ao carregar os mods. Tente novamente mais tarde.');
    }
}

function displayMods() {
    const modList = document.getElementById('modList');
    modList.innerHTML = ''; // Limpa a tabela

    const start = (currentPage - 1) * modsPerPage;
    const end = start + modsPerPage;
    const paginatedMods = mods.slice(start, end);

    if (paginatedMods.length === 0) {
        const emptyMessage = document.createElement('tr');
        emptyMessage.innerHTML = '<td colspan="3" style="text-align: center;">Nenhum mod disponível no momento.</td>';
        modList.appendChild(emptyMessage);
        return;
    }

    paginatedMods.forEach(mod => {
        const row = document.createElement('tr');

        const gameCell = document.createElement('td');
        gameCell.textContent = mod.game;
        row.appendChild(gameCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = mod.name;
        row.appendChild(nameCell);

        const downloadCell = document.createElement('td');
        const downloadLink = document.createElement('a');
        downloadLink.href = mod.download_link;
        downloadLink.className = 'report';
        downloadLink.innerHTML = `
            <i class="bx bx-cloud-download"></i>
            <span>Download</span>
        `;
        downloadCell.appendChild(downloadLink);
        row.appendChild(downloadCell);

        modList.appendChild(row);
    });
}

function displayErrorMessage(message) {
    const modList = document.getElementById('modList');
    modList.innerHTML = ''; // Limpa a tabela

    const errorMessage = document.createElement('tr');
    errorMessage.innerHTML = `<td colspan="3" style="text-align: center; color: red;">${message}</td>`;
    modList.appendChild(errorMessage);
}

function createPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Limpa a paginação existente

    const totalPages = Math.ceil(mods.length / modsPerPage);

    // Criando a estrutura de navegação
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Page navigation example');

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-cente';

    // Botão "Anterior"
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevButton = document.createElement('a');
    prevButton.className = 'page-link';
    prevButton.href = '#';
    prevButton.textContent = '&laquo;';
    prevButton.setAttribute('tabindex', '-1');
    prevButton.setAttribute('aria-disabled', currentPage === 1);
    prevButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
    prevItem.appendChild(prevButton);
    ul.appendChild(prevItem);

    // Números das páginas
    for (let i = 1; i <= totalPages; i++) {
        ul.appendChild(createPageItem(i, i === currentPage));
    }

    // Botão "Próximo"
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextButton = document.createElement('a');
    nextButton.className = 'page-link';
    nextButton.href = '#';
    nextButton.textContent = '&raquo;';
    nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
    nextItem.appendChild(nextButton);
    ul.appendChild(nextItem);

    // Adiciona a lista à navegação
    nav.appendChild(ul);
    pagination.appendChild(nav);
}

function createPageItem(pageNumber, isActive) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${isActive ? 'active' : ''}`;
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = pageNumber;
    pageLink.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = pageNumber;
        updatePagination();
    });
    pageItem.appendChild(pageLink);
    return pageItem;
}

function updatePagination() {
    createPagination();
    displayMods();
}

// Chama loadMods apenas na página de mods
if (window.location.pathname.endsWith('mods.html')) {
    loadMods();
}
