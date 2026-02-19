import { http } from '../utils/http.js';

export const authApi = {
    async register(username, email, password) {
        return await http.post('/users', { username, email, password });
    },

    async login(email, password) {
        return await http.post('/users/login', { email, password });
    },

    async getUserById(userId) {
        return await http.get(`/users/search/by?id=${userId}`);
    },

    async updateUser(userId, data) {
        return await http.put(`/users/${userId}`, data);
    }
};
