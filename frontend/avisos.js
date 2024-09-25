document.addEventListener("DOMContentLoaded", function () {
    fetchAvisos();
});

function fetchAvisos() {
    fetch('https://api.renildomarcio.com.br/backend/getAvisos.php')
        .then(response => response.json())
        .then(data => {
            displayAvisos(data);
        })
        .catch(error => console.error('Erro ao carregar avisos:', error));
}

function displayAvisos(avisos) {
    const avisosContainer = document.getElementById('avisosContainer');
    avisosContainer.innerHTML = ''; // Limpar avisos antigos

    if (avisos.length > 0) {
        avisos.forEach(aviso => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-dark alert-dismissible fade show';
            alertDiv.role = 'alert';
            
            alertDiv.innerHTML = `
                <h4 class="alert-heading">${aviso.titulo}</h4>
                <p>${aviso.mensagem}</p>
            `;

            avisosContainer.appendChild(alertDiv);
        });
    } else {
        avisosContainer.style.display = 'none'; // Esconder se não houver avisos
    }
}
