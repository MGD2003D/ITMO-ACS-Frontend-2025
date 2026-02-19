import { renderNavbar } from '../components/navbar.js';
import { authApi } from '../api/authApi.js';
import { auth } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    if (auth.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('d-none');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const response = await authApi.login(email, password);
            auth.setToken(response.token);
            window.location.href = '/';
        } catch (error) {
            showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }
});
