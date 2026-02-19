import { http } from '../utils/http.js';

export const interactionsApi = {
    // Likes
    async likeRecipe(recipeId) {
        return await http.post('/likes', { recipeId });
    },

    async unlikeRecipe(likeId) {
        return await http.delete(`/likes/${likeId}`);
    },

    async getLikesByRecipe(recipeId) {
        return await http.get(`/likes?recipeId=${recipeId}`);
    },

    // Favorites
    async addToFavorites(recipeId) {
        return await http.post('/favorites', { recipeId });
    },

    async removeFromFavorites(recipeId) {
        return await http.delete(`/favorites?recipeId=${recipeId}`);
    },

    async getFavoritesByUser() {
        return await http.get('/favorites/my');
    },

    async getFavoritesByRecipe(recipeId) {
        return await http.get(`/favorites?recipeId=${recipeId}`);
    },

    // Comments
    async getCommentsByRecipe(recipeId) {
        return await http.get(`/comments?recipeId=${recipeId}`);
    },

    async addComment(recipeId, text) {
        return await http.post('/comments', { recipeId, content: text });
    },

    async deleteComment(commentId) {
        return await http.delete(`/comments/${commentId}`);
    }
};
