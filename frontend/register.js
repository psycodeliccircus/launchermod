document.getElementById('registerBtn')?.addEventListener('click', () => {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    // Verifica se os campos estão vazios
    if (!username || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos.',
            confirmButtonText: 'Ok'
        });
        return; // Não envia os dados se os campos estiverem vazios
    }

    fetch('https://api.renildomarcio.com.br/backend/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `username=${username}&password=${password}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Utiliza SweetAlert2 para mostrar sucesso no registro
            Swal.fire({
                icon: 'success',
                title: 'Cadastro bem-sucedido!',
                text: 'Agora faça login.',
                confirmButtonText: 'Ok'
            }).then(() => {
                // Redireciona para a página de login após o usuário fechar o alerta
                window.location.href = 'login.html';
            });
        } else {
            // Utiliza SweetAlert2 para mostrar mensagem de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro no cadastro',
                text: data.message,
                confirmButtonText: 'Ok'
            });
        }
    })
    .catch(error => {
        // Exibe uma mensagem de erro em caso de falha no fetch
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão!',
            text: 'Houve um problema ao tentar realizar o cadastro. Tente novamente mais tarde.',
            confirmButtonText: 'Ok'
        });
    });
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    // Lógica para logout (opcional)
    window.location.href = 'login.html'; // Redireciona para a página de login
});