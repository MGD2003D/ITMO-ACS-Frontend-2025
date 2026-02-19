import { renderNavbar } from '../components/navbar.js';
import { auth } from '../utils/auth.js';
import { authApi } from '../api/authApi.js';
import { ui } from '../utils/ui.js';

renderNavbar();

if (!auth.requireAuth()) {
    // redirect to login
}

const userId = auth.getCurrentUserId();

const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileJoined = document.getElementById('profile-joined');

const profileForm = document.getElementById('profile-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const bioInput = document.getElementById('bio');
const avatarUrlInput = document.getElementById('avatarUrl');

const passwordForm = document.getElementById('password-form');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');

let currentUserData = null;

async function loadProfile() {
    try {
        const user = await authApi.getUserById(userId);
        currentUserData = user;

        profileName.textContent = user.username;
        profileEmail.textContent = user.email;
        if (user.createdAt) {
            profileJoined.textContent = `Joined ${ui.formatDate(user.createdAt)}`;
        }

        if (user.avatarUrl) {
            profileAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar">`;
        }

        usernameInput.value = user.username || '';
        emailInput.value = user.email || '';
        bioInput.value = user.bio || '';
        avatarUrlInput.value = user.avatarUrl || '';
    } catch (err) {
        ui.showError('Failed to load profile');
    }
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {};
    const newUsername = usernameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newBio = bioInput.value.trim();
    const newAvatarUrl = avatarUrlInput.value.trim();

    if (newUsername !== currentUserData.username) data.username = newUsername;
    if (newEmail !== currentUserData.email) data.email = newEmail;
    if (newBio !== (currentUserData.bio || '')) data.bio = newBio;
    if (newAvatarUrl !== (currentUserData.avatarUrl || '')) data.avatarUrl = newAvatarUrl;

    if (Object.keys(data).length === 0) {
        ui.showAlert('No changes to save', 'info');
        return;
    }

    try {
        const updated = await authApi.updateUser(userId, data);
        currentUserData = updated;

        profileName.textContent = updated.username;
        profileEmail.textContent = updated.email;
        if (updated.avatarUrl) {
            profileAvatar.innerHTML = `<img src="${updated.avatarUrl}" alt="Avatar">`;
        } else {
            profileAvatar.innerHTML = '<i class="bi bi-person-fill"></i>';
        }

        ui.showSuccess('Profile updated successfully');
    } catch (err) {
        ui.showError(err.message || 'Failed to update profile');
    }
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
        ui.showError('Passwords do not match');
        return;
    }

    try {
        await authApi.updateUser(userId, { password: newPassword });
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        ui.showSuccess('Password updated successfully');
    } catch (err) {
        ui.showError(err.message || 'Failed to update password');
    }
});

loadProfile();
