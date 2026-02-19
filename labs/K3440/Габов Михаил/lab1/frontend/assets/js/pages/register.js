import { renderNavbar } from '../components/navbar.js';
import { authApi } from '../api/authApi.js';
import { auth } from '../utils/auth.js';
import { ui } from '../utils/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    // Redirect if already logged in
    if (auth.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('d-none');

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            showError('Username must be at least 3 characters');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            await authApi.register(username, email, password);
            ui.showSuccess('Registration successful! Please login.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
