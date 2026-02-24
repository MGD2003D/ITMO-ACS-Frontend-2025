<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>My Recipes</h1>
      <RouterLink to="/recipes/create" class="btn btn-success">
        <i class="bi bi-plus-lg me-1"></i>New Recipe
      </RouterLink>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'created' }" @click="tab = 'created'">
          <i class="bi bi-journal-richtext me-1"></i>Created
          <span class="badge bg-secondary ms-1">{{ createdRecipes.length }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'saved' }" @click="tab = 'saved'">
          <i class="bi bi-bookmark me-1"></i>Saved
          <span class="badge bg-secondary ms-1">{{ savedRecipes.length }}</span>
        </button>
      </li>
    </ul>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <template v-else>
      <!-- Created -->
      <div v-if="tab === 'created'">
        <div v-if="createdRecipes.length === 0" class="empty-state">
          <i class="bi bi-journal-plus"></i>
          <h4>No recipes yet</h4>
          <p>Share your first recipe with the community!</p>
          <RouterLink to="/recipes/create" class="btn btn-success">Create Recipe</RouterLink>
        </div>
        <div v-else class="row g-4">
          <div v-for="recipe in createdRecipes" :key="recipe.id" class="col-md-6 col-lg-4">
            <RecipeCard :recipe="recipe" show-edit @delete="confirmDelete(recipe)" />
          </div>
        </div>
      </div>

      <!-- Saved -->
      <div v-if="tab === 'saved'">
        <div v-if="savedRecipes.length === 0" class="empty-state">
          <i class="bi bi-bookmark-x"></i>
          <h4>No saved recipes</h4>
          <p>Browse recipes and save the ones you like!</p>
          <RouterLink to="/recipes" class="btn btn-success">Browse Recipes</RouterLink>
        </div>
        <div v-else class="row g-4">
          <div v-for="recipe in savedRecipes" :key="recipe.id" class="col-md-6 col-lg-4">
            <RecipeCard :recipe="recipe" show-remove-favorite @remove-favorite="removeFavorite(recipe.id)" />
          </div>
        </div>
      </div>
    </template>

    <!-- Delete modal -->
    <div v-if="deleteTarget" class="modal d-block" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Recipe</h5>
            <button type="button" class="btn-close" @click="deleteTarget = null"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete <strong>{{ deleteTarget.title }}</strong>?
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" @click="doDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecipeCard from '../components/RecipeCard.vue'
import { useRecipes } from '../composables/useRecipes'
import { useInteractions } from '../composables/useInteractions'
import { recipesApi } from '../api/recipesApi'
import { useAuthStore } from '../stores/auth'

const store = useAuthStore()
const { deleteRecipe } = useRecipes()
const { getFavoritesByUser } = useInteractions()

const tab = ref('created')
const loading = ref(false)
const createdRecipes = ref([])
const savedRecipes = ref([])
const deleteTarget = ref(null)

async function loadData() {
  loading.value = true
  try {
    const userId = store.currentUser?.id
    createdRecipes.value = await recipesApi.getRecipes({ userId })

    const favorites = await getFavoritesByUser()
    savedRecipes.value = favorites.map(f => f.recipe).filter(Boolean)
  } catch (e) {
    console.error('Failed to load recipes:', e)
  } finally {
    loading.value = false
  }
}

function confirmDelete(recipe) {
  deleteTarget.value = recipe
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteRecipe(deleteTarget.value.id)
    createdRecipes.value = createdRecipes.value.filter(r => r.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    console.error('Failed to delete:', e)
  }
}

async function removeFavorite(recipeId) {
  try {
    const { interactionsApi } = await import('../api/interactionsApi')
    await interactionsApi.removeFromFavorites(Number(recipeId))
    savedRecipes.value = savedRecipes.value.filter(r => r.id !== recipeId)
  } catch (e) {
    console.error('Failed to remove favorite:', e)
  }
}

onMounted(loadData)
</script>
