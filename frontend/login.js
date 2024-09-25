document.getElementById('loginBtn')?.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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