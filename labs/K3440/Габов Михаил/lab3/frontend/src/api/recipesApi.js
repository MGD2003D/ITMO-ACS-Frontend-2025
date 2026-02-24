import { http } from './http'

export const recipesApi = {
  getRecipes(filters = {}) {
    const params = new URLSearchParams()
    if (filters.ingredient) params.append('ingredient', filters.ingredient)
    if (filters.difficulty) params.append('difficulty', filters.difficulty)
    if (filters.userId) params.append('userId', filters.userId)
    const query = params.toString()
    return http.get(`/recipes${query ? '?' + query : ''}`)
  },
  getRecipeById: (id) => http.get(`/recipes/${id}`),
  createRecipe: (data) => http.post('/recipes', data),
  updateRecipe: (id, data) => http.put(`/recipes/${id}`, data),
  deleteRecipe: (id) => http.delete(`/recipes/${id}`),
  getIngredients: () => http.get('/ingredients'),
  createIngredient: (name) => http.post('/ingredients', { name }),
}
