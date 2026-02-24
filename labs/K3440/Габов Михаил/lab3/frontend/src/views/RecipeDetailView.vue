<template>
  <div class="container py-4">
    <!-- Alerts -->
    <div v-if="alertMsg" :class="`alert alert-${alertType} alert-dismissible`" role="alert">
      {{ alertMsg }}
      <button type="button" class="btn-close" @click="alertMsg = ''"></button>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <div class="mt-3"><RouterLink to="/recipes" class="btn btn-success">Back to Recipes</RouterLink></div>
    </div>

    <template v-else-if="recipe">
      <div class="recipe-detail-header">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1>{{ recipe.title }}</h1>
            <p class="text-muted">
              by {{ recipe.user?.username || 'Unknown' }} &bull;
              {{ formatDate(recipe.createdAt) }}
            </p>
          </div>
          <span class="badge fs-6" :class="difficultyClass">{{ recipe.difficulty || 'N/A' }}</span>
        </div>

        <p class="lead">{{ recipe.description }}</p>

        <div class="mt-3 d-flex gap-2 flex-wrap">
          <RouterLink v-if="isOwner" :to="`/recipes/${recipe.id}/edit`" class="btn btn-outline-primary">
            <i class="bi bi-pencil me-1"></i>Edit
          </RouterLink>
          <button
            v-if="isAuthenticated && !isOwner"
            class="btn"
            :class="isFavorited ? 'btn-success' : 'btn-outline-success'"
            :disabled="favoriteLoading"
            @click="toggleFav"
          >
            <i :class="isFavorited ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'" class="me-1"></i>
            {{ isFavorited ? 'Saved' : 'Save' }}
          </button>
          <RouterLink to="/recipes" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Back
          </RouterLink>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header d-flex align-items-center">
              <h5 class="mb-0"><i class="bi bi-basket me-2"></i>Ingredients</h5>
            </div>
            <div class="card-body">
              <ul v-if="recipe.recipeIngredients?.length" class="ingredient-list">
                <li v-for="ri in recipe.recipeIngredients" :key="ri.id">
                  <strong>{{ ri.ingredient?.name || 'Unknown' }}</strong>
                  <span v-if="ri.amount" class="text-muted">{{ ri.amount }}</span>
                </li>
              </ul>
              <p v-else class="text-muted">No ingredients listed</p>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <h4><i class="bi bi-list-ol me-2"></i>Instructions</h4>
          <template v-if="recipe.steps?.length">
            <div
              v-for="step in sortedSteps"
              :key="step.stepNumber"
              class="step-item"
            >
              <span class="step-number">{{ step.stepNumber }}</span>
              <div class="step-content">
                <div>{{ step.description }}</div>
                <img v-if="step.imageUrl" :src="step.imageUrl" class="img-fluid mt-2 rounded step-image" :alt="`Step ${step.stepNumber}`" />
              </div>
            </div>
          </template>
          <p v-else class="text-muted">No instructions provided</p>
        </div>
      </div>

      <!-- Comments -->
      <div class="mt-5">
        <h4><i class="bi bi-chat-dots me-2"></i>Comments</h4>
        <CommentSection :recipe-id="recipe.id" @alert="onAlert" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CommentSection from '../components/CommentSection.vue'
import { useRecipes } from '../composables/useRecipes'
import { useInteractions } from '../composables/useInteractions'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const store = useAuthStore()
const { recipe, loading, error, fetchRecipe } = useRecipes()
const { toggleFavorite, checkFavorited } = useInteractions()

const isAuthenticated = computed(() => store.isAuthenticated)
const currentUserId = computed(() => store.currentUser?.id)
const isOwner = computed(() => recipe.value && currentUserId.value === recipe.value.user?.id)

const isFavorited = ref(false)
const favoriteLoading = ref(false)
const alertMsg = ref('')
const alertType = ref('success')

const difficultyClass = computed(() => {
  switch (recipe.value?.difficulty) {
    case 'easy': return 'bg-success'
    case 'medium': return 'bg-warning'
    case 'hard': return 'bg-danger'
    default: return 'bg-secondary'
  }
})

const sortedSteps = computed(() =>
  recipe.value?.steps ? [...recipe.value.steps].sort((a, b) => a.stepNumber - b.stepNumber) : []
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function toggleFav() {
  favoriteLoading.value = true
  try {
    isFavorited.value = await toggleFavorite(recipe.value.id, isFavorited.value)
    showAlert('success', isFavorited.value ? 'Saved to favorites!' : 'Removed from favorites')
  } catch {
    showAlert('danger', 'Failed to update favorites')
  } finally {
    favoriteLoading.value = false
  }
}

function showAlert(type, msg) {
  alertType.value = type
  alertMsg.value = msg
  setTimeout(() => { alertMsg.value = '' }, 4000)
}

function onAlert({ type, message }) {
  showAlert(type, message)
}

onMounted(async () => {
  await fetchRecipe(route.params.id)
  if (isAuthenticated.value && !isOwner.value && recipe.value) {
    isFavorited.value = await checkFavorited(recipe.value.id, currentUserId.value)
  }
})
</script>
