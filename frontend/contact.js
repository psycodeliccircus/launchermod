document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Cria um objeto FormData a partir do formulário
    const formData = new FormData(this);

    // Envia os dados para o backend
    fetch('https://api.renildomarcio.com.br/backend/contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Exibe a mensagem de retorno
        if (data.success) {
            alert(data.message);
            // Opcional: Limpa os campos do formulário após o envio
            this.reset();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar a mensagem.');
    });
});
