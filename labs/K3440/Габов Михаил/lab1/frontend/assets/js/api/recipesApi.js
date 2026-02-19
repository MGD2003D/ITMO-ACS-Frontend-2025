import { http } from '../utils/http.js';

export const recipesApi = {
    async getRecipes(filters = {}) {
        const params = new URLSearchParams();

        if (filters.ingredient) params.append('ingredient', filters.ingredient);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.userId) params.append('userId', filters.userId);

        const query = params.toString();
        return await http.get(`/recipes${query ? '?' + query : ''}`);
    },

    async getRecipeById(id) {
        return await http.get(`/recipes/${id}`);
    },

    async createRecipe(data) {
        return await http.post('/recipes', data);
    },

    async updateRecipe(id, data) {
        return await http.put(`/recipes/${id}`, data);
    },

    async deleteRecipe(id) {
        return await http.delete(`/recipes/${id}`);
    },

    async getIngredients() {
        return await http.get('/ingredients');
    },

    async createIngredient(name) {
        return await http.post('/ingredients', { name });
    }
};
