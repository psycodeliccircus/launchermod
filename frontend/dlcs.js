let dlcs = [];
const dlcsPerPage = 10; // Número de DLCs por página
let currentDLCPage = 1; // Página atual dos DLCs

async function loadDLCs() {
    try {
        const response = await fetch('https://api.renildomarcio.com.br/backend/get_dlcs.php');
        const data = await response.json();
        dlcs = Array.isArray(data) && data.length > 0 ? data : []; // Armazena todos os DLCs
        displayDLCs();
        createDLCPagination();
    } catch (error) {
        console.error('Erro ao buscar DLCs:', error);
        displayErrorMessage('Erro ao carregar DLCs. Tente novamente mais tarde.');
    }
}

function displayDLCs() {
    const dlcList = document.getElementById('dlcList');
    dlcList.innerHTML = ''; // Limpa a lista de DLCs

    const start = (currentDLCPage - 1) * dlcsPerPage;
    const end = start + dlcsPerPage;
    const paginatedDLCs = dlcs.slice(start, end);

    if (paginatedDLCs.length === 0) {
        const emptyMessage = document.createElement('tr');
        emptyMessage.innerHTML = '<td colspan="2" style="text-align: center;">Nenhum DLC disponível no momento.</td>';
        dlcList.appendChild(emptyMessage);
        return;
    }

    paginatedDLCs.forEach(dlc => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = dlc.name; // Acessa o campo 'name'
        row.appendChild(nameCell);

        const downloadCell = document.createElement('td');
        const downloadLink = document.createElement('a');
        downloadLink.href = dlc.download_link; // Define o link para download
        downloadLink.className = 'report'; // Adiciona a classe para estilo

        downloadLink.innerHTML = `
            <i class="bx bx-cloud-download"></i>
            <span>Download</span>
        `;

        downloadCell.appendChild(downloadLink);
        row.appendChild(downloadCell);

        dlcList.appendChild(row);
    });
}

function displayErrorMessage(message) {
    const dlcList = document.getElementById('dlcList');
    dlcList.innerHTML = ''; // Limpa a lista de DLCs

    const errorMessage = document.createElement('tr');
    errorMessage.innerHTML = `<td colspan="2" style="text-align: center; color: red;">${message}</td>`;
    dlcList.appendChild(errorMessage);
}

function createDLCPagination() {
    const pagination = document.getElementById('dlcPagination');
    pagination.innerHTML = ''; // Limpa a paginação existente

    // Verifique se há DLCs
    if (dlcs.length === 0) {
        const noDLCSMessage = document.createElement('div');
        noDLCSMessage.textContent = 'Nenhum DLC disponível no momento.';
        pagination.appendChild(noDLCSMessage);
        return; // Não crie mais elementos de paginação se não houver DLCs
    }

    const totalPages = Math.ceil(dlcs.length / dlcsPerPage);

    // Criando a estrutura de navegação
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Page navigation example');

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botão "Anterior"
    createPageButton('«', currentDLCPage === 1, () => {
        if (currentDLCPage > 1) {
            currentDLCPage--;
            updateDLCPagination();
        }
    }, ul);

    // Números das páginas
    for (let i = 1; i <= totalPages; i++) {
        createPageItem(i, i === currentDLCPage, ul);
    }

    // Botão "Próximo"
    createPageButton('»', currentDLCPage === totalPages, () => {
        if (currentDLCPage < totalPages) {
            currentDLCPage++;
            updateDLCPagination();
        }
    }, ul);

    // Adiciona a lista à navegação
    nav.appendChild(ul);
    pagination.appendChild(nav);
}

function createPageItem(pageNumber, isActive, ul) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${isActive ? 'active' : ''}`;
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = pageNumber;
    pageLink.addEventListener('click', (event) => {
        event.preventDefault();
        currentDLCPage = pageNumber;
        updateDLCPagination();
    });
    pageItem.appendChild(pageLink);
    ul.appendChild(pageItem);
}

function createPageButton(label, isDisabled, onClick, ul) {
    const item = document.createElement('li');
    item.className = `page-item ${isDisabled ? 'disabled' : ''}`;
    const button = document.createElement('a');
    button.className = 'page-link';
    button.href = '#';
    button.textContent = label;
    button.setAttribute('tabindex', '-1');
    button.setAttribute('aria-disabled', isDisabled);
    button.addEventListener('click', (event) => {
        event.preventDefault();
        if (!isDisabled) {
            onClick();
        }
    });
    item.appendChild(button);
    ul.appendChild(item);
}

function updateDLCPagination() {
    createDLCPagination();
    displayDLCs();
}

// Chama loadDLCs apenas na página de DLCs
if (window.location.pathname.endsWith('dlcs.html')) {
    loadDLCs();
}
