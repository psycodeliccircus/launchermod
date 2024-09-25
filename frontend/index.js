const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
    });
});

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

// Manter o evento de redimensionamento
window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
});

// Manter o código de alternância de tema
const toggler = document.getElementById('theme-toggle');

// Carregar o estado do tema do armazenamento local ao carregar a página
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggler.checked = true; // Marcar o toggle se o tema for escuro
}

toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark'); // Salvar o estado no armazenamento local
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light'); // Salvar o estado no armazenamento local
    }
});

// Definindo a versão
const version = '1.2.6';

// Atualizando o conteúdo do elemento com a versão
document.getElementById('version-number').textContent = version;
