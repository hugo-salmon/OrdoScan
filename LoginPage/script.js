const notyf = new Notyf({
    duration: 5000,
    position: {
        x: 'right',
        y: 'top',
    }
});

const containerLogin = document.getElementById("container-login");
        containerLogin.addEventListener("click", () => {
            // Affiche la notification de connexion
            notyf.success('Connecté avec succès. Redirection en cours...');

            // Attends 3 secondes avant de rediriger
            setTimeout(() => {
                window.location.replace("../ScannerPage/index.html");
            }, 3000);
        });