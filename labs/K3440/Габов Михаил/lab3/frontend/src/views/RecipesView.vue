<template>
  <div class="container py-4">
    <h1 class="mb-4">All Recipes</h1>

    <div class="filter-section">
      <div class="row g-3 align-items-end">
        <div class="col-md-5">
          <label class="form-label">Filter by Ingredient</label>
          <input v-model="filterIngredient" type="text" class="form-control" placeholder="e.g. tomato" @keyup.enter="applyFilters" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Difficulty</label>
          <select v-model="filterDifficulty" class="form-select">
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div class="col-md-3 d-flex gap-2">
          <button class="btn btn-success flex-grow-1" @click="applyFilters">
            <i class="bi bi-search me-1"></i>Search
          </button>
          <button v-if="isFiltered" class="btn btn-outline-secondary" @click="clearFilters">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="recipes.length === 0" class="empty-state">
      <i class="bi bi-search"></i>
      <h4>No recipes found</h4>
      <p>Try different filters or add your own recipe!</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="recipe in recipes" :key="recipe.id" class="col-md-6 col-lg-4">
        <RecipeCard :recipe="recipe" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RecipeCard from '../components/RecipeCard.vue'
import { useRecipes } from '../composables/useRecipes'

const { recipes, loading, error, fetchRecipes } = useRecipes()

const filterIngredient = ref('')
const filterDifficulty = ref('')

const isFiltered = computed(() => filterIngredient.value || filterDifficulty.value)

function applyFilters() {
  fetchRecipes({ ingredient: filterIngredient.value, difficulty: filterDifficulty.value })
}

function clearFilters() {
  filterIngredient.value = ''
  filterDifficulty.value = ''
  fetchRecipes()
}

onMounted(() => fetchRecipes())
</script>
