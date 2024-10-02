document.addEventListener("DOMContentLoaded", function () {
    fetchAvisos();
});

function fetchAvisos() {
    fetch('https://api.renildomarcio.com.br/backend/getAvisos.php')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const ultAvisoVisto = localStorage.getItem('ultimoAvisoVisto');
                
                // Filtrar avisos mais novos
                const novosAvisos = data.filter(aviso => aviso.id > ultAvisoVisto);
                
                if (novosAvisos.length > 0) {
                    displayAvisos(novosAvisos);
                    document.getElementById('avisosContainer').style.display = 'block'; // Mostrar container se houver novos avisos
                }
            }
        })
        .catch(error => console.error('Erro ao carregar avisos:', error));
}

function displayAvisos(avisos) {
    const avisosContainer = document.getElementById('avisosContainer');
    avisosContainer.innerHTML = ''; // Limpar avisos antigos

    avisos.forEach(aviso => {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-dark alert-dismissible fade show';
        alertDiv.role = 'alert';
        
        alertDiv.innerHTML = `
            <strong>${aviso.titulo}</strong><hr>${aviso.mensagem}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;

        // Salvar o ID do aviso quando o usuário fechar
        alertDiv.querySelector('.close').addEventListener('click', () => {
            localStorage.setItem('ultimoAvisoVisto', aviso.id);
        });

        avisosContainer.appendChild(alertDiv);
    });
}
