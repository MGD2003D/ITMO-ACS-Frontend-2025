import { ref } from 'vue'
import { recipesApi } from '../api/recipesApi'

export function useRecipes() {
  const recipes = ref([])
  const recipe = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchRecipes(filters = {}) {
    loading.value = true
    error.value = null
    try {
      recipes.value = await recipesApi.getRecipes(filters)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipe(id) {
    loading.value = true
    error.value = null
    try {
      recipe.value = await recipesApi.getRecipeById(id)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createRecipe(data) {
    return await recipesApi.createRecipe(data)
  }

  async function updateRecipe(id, data) {
    return await recipesApi.updateRecipe(id, data)
  }

  async function deleteRecipe(id) {
    await recipesApi.deleteRecipe(id)
  }

  return { recipes, recipe, loading, error, fetchRecipes, fetchRecipe, createRecipe, updateRecipe, deleteRecipe }
}
