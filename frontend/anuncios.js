let anuncios = []; // Armazenará os anúncios recuperados

document.addEventListener("DOMContentLoaded", function () {
    fetchAnuncios();
});

function fetchAnuncios() {
    fetch('https://api.renildomarcio.com.br/backend/getAnuncios.php')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                anuncios = data; // Armazenar todos os anúncios
                
                mostrarAnuncioAleatorio(); // Mostrar um anúncio aleatório
            }
        })
        .catch(error => console.error('Erro ao carregar anúncios:', error));
}

function mostrarAnuncioAleatorio() {
    const anuncioContainer = document.getElementById('anuncioContainer');
    anuncioContainer.innerHTML = ''; // Limpar o conteúdo antigo

    if (anuncios.length > 0) {
        // Selecionar um índice aleatório
        const indiceAleatorio = Math.floor(Math.random() * anuncios.length);
        const anuncio = anuncios[indiceAleatorio];
        
        const anuncioDiv = document.createElement('div');
        anuncioDiv.className = 'anuncio';
        
        anuncioDiv.innerHTML = `
            <a href="${anuncio.link}" rel="nofollow noopener">
                <img src="${anuncio.imagem}" alt="${anuncio.alt}" style="width: 790px; height: auto;">
            </a>
        `;

        // Salvar o ID do anúncio quando for exibido
        localStorage.setItem('ultimoAnuncioVisto', anuncio.id);

        anuncioContainer.appendChild(anuncioDiv);
        anuncioContainer.style.display = 'block'; // Mostrar o container com o anúncio
    }
}
