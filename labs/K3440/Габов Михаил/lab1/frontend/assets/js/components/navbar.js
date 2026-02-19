import { auth } from '../utils/auth.js';

export function renderNavbar() {
    const isLoggedIn = auth.isAuthenticated();
    const currentUser = auth.getCurrentUser();
    const currentPath = window.location.pathname;

    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container">
                <a class="navbar-brand" href="/">Recipeo</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${currentPath === '/' || currentPath === '/index.html' ? 'active' : ''}" href="/">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${currentPath === '/recipes.html' ? 'active' : ''}" href="/recipes.html">Recipes</a>
                        </li>
                        ${isLoggedIn ? `
                            <li class="nav-item">
                                <a class="nav-link ${currentPath === '/my-recipes.html' ? 'active' : ''}" href="/my-recipes.html">My Recipes</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${currentPath === '/recipe-create.html' ? 'active' : ''}" href="/recipe-create.html">Create</a>
                            </li>
                        ` : ''}
                    </ul>
                    <ul class="navbar-nav align-items-center">
                        ${isLoggedIn ? `
                            <li class="nav-item">
                                <a class="nav-link ${currentPath === '/profile.html' ? 'active' : ''}" href="/profile.html" id="username-btn"><i class="bi bi-person-circle"></i> ${currentUser?.username || 'Profile'}</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" id="logout-btn">Logout</a>
                            </li>
                        ` : `
                            <li class="nav-item">
                                <a class="nav-link ${currentPath === '/login.html' ? 'active' : ''}" href="/login.html">Login</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${currentPath === '/register.html' ? 'active' : ''}" href="/register.html">Register</a>
                            </li>
                        `}
                    </ul>
                </div>
            </div>
        </nav>
    `;
    // там по какой-то причине не возвращается username, но может статичное и будет лучше

    const navbarContainer = document.getElementById('navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHtml;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                auth.logout();
            });
        };

    }
}
