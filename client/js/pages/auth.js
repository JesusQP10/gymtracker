console.log('auth.js cargado');

// ── Formularios ──
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// ── Enlaces para alternar entre formularios ──
const enlaceRegistro = document.querySelector('#a-registro a');
const enlaceInicio = document.querySelector('#a-inicio a');

// ── Inputs del LOGIN ──
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ── Inputs del REGISTRO ──
const nombreInput = document.getElementById('nombre');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const confirmPasswordInput = document.getElementById('confirm-password');

// ── Alternar entre formularios ──
enlaceRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

enlaceInicio.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// ── Validación del LOGIN ──
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (emailInput.value.trim() === '') {
        alert('El campo de correo electrónico no puede estar vacío.');
        return;
    }
    if (passwordInput.value.trim() === '') {
        alert('El campo de contraseña no puede estar vacío.');
        return;
    }

    console.log('Login correcto');
});

// ── Validación del REGISTRO ──
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (nombreInput.value.trim() === '') {
        alert('El nombre no puede estar vacío.');
        return;
    }
    if (registerEmailInput.value.trim() === '') {
        alert('El correo electrónico no puede estar vacío.');
        return;
    }
    if (registerPasswordInput.value.trim().length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (registerPasswordInput.value !== confirmPasswordInput.value) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    console.log('Registro correcto');
});
