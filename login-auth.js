document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

    errorDiv.classList.add('d-none');

    // Simulation d'identifiants
    if (email === 'user@bankai.com' && password === 'user123') {
        window.location.href = 'dashboard-user.html';
    } 
    else if (email === 'admin@bankai.com' && password === 'admin123') {
        window.location.href = 'dashboard-admin.html';
    } 
    else {
        errorDiv.classList.remove('d-none');
        // Petit effet de secousse pour l'erreur
        document.querySelector('.login-card-v2').animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
    }
});

const btnLogin = document.getElementById('btnTabLogin');
const btnRegister = document.getElementById('btnTabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const mainTitle = document.getElementById('mainTitle');
const subTitle = document.getElementById('subTitle');

// Basculer vers INSCRIPTION
btnRegister.addEventListener('click', () => {
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    mainTitle.innerText = "Créer un compte";
    subTitle.innerText = "Rejoignez l'univers Bankaï";
});

// Basculer vers CONNEXION
btnLogin.addEventListener('click', () => {
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    mainTitle.innerText = "Mon compte";
    subTitle.innerText = "Accédez à votre espace client Bankaï";
});

// Garder ta logique de connexion existante
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

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