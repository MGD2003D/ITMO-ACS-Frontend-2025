<template>
  <div>
    <section class="hero-section text-center">
      <div class="container">
        <h1>Discover & Share Recipes</h1>
        <p class="lead">Join our community of food lovers. Find inspiration, share your culinary creations.</p>
        <RouterLink to="/recipes" class="btn btn-light btn-lg">Browse Recipes</RouterLink>
      </div>
    </section>

    <div class="container pb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Latest Recipes</h2>
        <RouterLink v-if="showViewAll" to="/recipes" class="btn btn-outline-success">
          View All <i class="bi bi-arrow-right ms-1"></i>
        </RouterLink>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else-if="recipes.length === 0" class="empty-state">
        <i class="bi bi-journal-x"></i>
        <h4>No recipes yet</h4>
        <p>Be the first to add a recipe!</p>
        <RouterLink to="/recipes/create" class="btn btn-success">Add Recipe</RouterLink>
      </div>

      <div v-else class="row g-4">
        <div v-for="recipe in recipes.slice(0, 6)" :key="recipe.id" class="col-md-6 col-lg-4">
          <RecipeCard :recipe="recipe" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import RecipeCard from '../components/RecipeCard.vue'
import { useRecipes } from '../composables/useRecipes'

const { recipes, loading, error, fetchRecipes } = useRecipes()
const showViewAll = computed(() => recipes.value.length > 6)

onMounted(() => fetchRecipes())
</script>
