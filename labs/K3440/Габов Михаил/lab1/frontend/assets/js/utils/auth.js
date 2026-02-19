export const auth = {
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    removeToken() {
        localStorage.removeItem('token');
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                this.removeToken();
                return false;
            }
            return true;
        } catch (e) {
            this.removeToken();
            return false;
        }
    },

    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            throw new Error('Invalid token');
        }
    },

    getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = this.decodeToken(token);
            return {
                id: payload.userId,
                username: payload.username
            };
        } catch (e) {
            return null;
        }
    },

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },

    logout() {
        this.removeToken();
        window.location.href = '/login.html';
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
};
