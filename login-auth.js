// Écoute de la soumission du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // J'empêche le rechargement de la page

    // Récupération des valeurs saisies
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

    // Cacher le message d'erreur au début
    errorDiv.classList.add('d-none');

    // Vérification des identifiants (Simulation)
    if (email === 'user@bankai.com' && password === 'user123') {
        window.location.href = 'dashboard-user.html';
    } 
    else if (email === 'admin@bankai.com' && password === 'admin123') {
        window.location.href = 'dashboard-admin.html';
    } 
    else {
        errorDiv.classList.remove('d-none');
    }
});