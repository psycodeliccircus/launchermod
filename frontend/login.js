document.getElementById('loginBtn')?.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    fetch('https://api.renildomarcio.com.br/backend/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `username=${username}&password=${password}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Salvar usuário e senha no localStorage se "lembrar de mim" estiver marcado
            if (rememberMe) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
            } else {
                // Limpar o localStorage se "lembrar de mim" não estiver marcado
                localStorage.removeItem('username');
                localStorage.removeItem('password');
            }

            // Redireciona para a página de mods
            window.location.href = 'mods.html'; 
        } else {
            // Utiliza o SweetAlert2 para exibir a mensagem de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
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
            text: 'Houve um problema ao tentar fazer login. Tente novamente mais tarde.',
            confirmButtonText: 'Ok'
        });
    });
});

// Para preencher os campos de entrada automaticamente
window.onload = function() {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true; // Marca a opção se o usuário estiver salvo
    }
    if (savedPassword) {
        document.getElementById('password').value = savedPassword;
    }
};