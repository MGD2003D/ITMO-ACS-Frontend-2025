<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Edit Recipe</h1>
      <RouterLink :to="`/recipes/${route.params.id}`" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Back
      </RouterLink>
    </div>

    <div v-if="pageLoading" class="loading-spinner">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="pageError" class="alert alert-danger">
      {{ pageError }}
      <div class="mt-3"><RouterLink to="/my-recipes" class="btn btn-success">Back to My Recipes</RouterLink></div>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Title *</label>
                <input v-model="form.title" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Description *</label>
                <textarea v-model="form.description" class="form-control" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Difficulty</label>
                <select v-model="form.difficulty" class="form-select">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Steps -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Steps</h5>
              <button type="button" class="btn btn-success btn-sm" @click="addStep">
                <i class="bi bi-plus-lg me-1"></i>Add Step
              </button>
            </div>
            <div class="card-body">
              <div v-for="(step, idx) in steps" :key="step.id" class="step-item mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
                  <span class="step-number">{{ idx + 1 }}</span>
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="removeStep(idx)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <textarea
                  v-model="step.description"
                  class="form-control step-description mb-2"
                  rows="2"
                  required
                  @paste="onPaste($event, idx)"
                ></textarea>
                <ImageUpload v-model="step.imageUrl" />
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Ingredients</h5>
              <button type="button" class="btn btn-success btn-sm" @click="addIngredient">
                <i class="bi bi-plus-lg me-1"></i>Add
              </button>
            </div>
            <div class="card-body">
              <div v-for="(ing, idx) in ingredients" :key="ing.id" class="mb-3 p-2 border rounded">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="ingredient-input-wrapper flex-grow-1">
                    <input
                      v-model="ing.name"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Ingredient name..."
                      autocomplete="off"
                      @input="onIngredientInput(idx)"
                      @blur="closeDropdown(idx)"
                      @focus="onIngredientInput(idx)"
                    />
                    <div v-if="ing.showDropdown && ing.suggestions.length" class="ingredient-autocomplete">
                      <div
                        v-for="s in ing.suggestions"
                        :key="s.key"
                        class="ingredient-autocomplete-item"
                        :class="{ 'create-new': s.isNew }"
                        @mousedown.prevent="selectIngredient(idx, s)"
                      >{{ s.label }}</div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="removeIngredient(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
                <input v-model="ing.amount" type="text" class="form-control form-control-sm" placeholder="Amount" />
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-success w-100" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImageUpload from '../components/ImageUpload.vue'
import { useRecipes } from '../composables/useRecipes'
import { recipesApi } from '../api/recipesApi'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const store = useAuthStore()
const { updateRecipe } = useRecipes()

const form = ref({ title: '', description: '', difficulty: 'easy' })
const steps = ref([])
const ingredients = ref([])
const availableIngredients = ref([])

const pageLoading = ref(true)
const pageError = ref('')
const error = ref('')
const submitting = ref(false)

let stepId = 0
let ingId = 0

function addStep() {
  steps.value.push({ id: ++stepId, description: '', imageUrl: null })
}

function removeStep(idx) {
  steps.value.splice(idx, 1)
}

function addIngredient() {
  ingredients.value.push({ id: ++ingId, name: '', amount: '', dbId: null, suggestions: [], showDropdown: false })
}

function removeIngredient(idx) {
  ingredients.value.splice(idx, 1)
}

function onIngredientInput(idx) {
  const ing = ingredients.value[idx]
  const query = ing.name.trim().toLowerCase()
  ing.dbId = null
  if (!query) { ing.showDropdown = false; return }
  const matches = availableIngredients.value.filter(a => a.name.toLowerCase().includes(query))
  const exactMatch = availableIngredients.value.find(a => a.name.toLowerCase() === query)
  const suggestions = matches.slice(0, 8).map(a => ({ key: a.id, label: a.name, id: a.id, isNew: false }))
  if (!exactMatch && query.length > 0) {
    suggestions.push({ key: 'new', label: `+ Create "${ing.name.trim()}"`, isNew: true, name: ing.name.trim() })
  }
  ing.suggestions = suggestions
  ing.showDropdown = suggestions.length > 0
}

function selectIngredient(idx, s) {
  const ing = ingredients.value[idx]
  ing.name = s.isNew ? s.name : s.label
  ing.dbId = s.isNew ? null : s.id
  ing.showDropdown = false
}

function closeDropdown(idx) {
  setTimeout(() => { ingredients.value[idx].showDropdown = false }, 150)
}

async function onPaste(event, idx) {
  const items = event.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const dataUrl = await processImage(item.getAsFile())
      if (dataUrl) steps.value[idx].imageUrl = dataUrl
      return
    }
  }
}

function processImage(file) {
  return new Promise((resolve) => {
    if (!file) { resolve(null); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = () => resolve(null)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

async function handleSubmit() {
  error.value = ''
  if (steps.value.length === 0) { error.value = 'Please add at least one step'; return }

  submitting.value = true
  try {
    const resolvedIngredients = []
    for (const ing of ingredients.value) {
      if (!ing.name.trim()) continue
      let id = ing.dbId
      if (!id) {
        const existing = availableIngredients.value.find(a => a.name.toLowerCase() === ing.name.trim().toLowerCase())
        if (existing) { id = existing.id }
        else {
          const created = await recipesApi.createIngredient(ing.name.trim())
          id = created.id
          availableIngredients.value.push(created)
        }
      }
      resolvedIngredients.push({ id, amount: ing.amount })
    }

    await updateRecipe(route.params.id, {
      title: form.value.title,
      description: form.value.description,
      difficulty: form.value.difficulty,
      steps: steps.value.map((s, i) => ({
        stepNumber: i + 1,
        description: s.description,
        ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
      })),
      ingredients: resolvedIngredients,
    })
    router.push(`/recipes/${route.params.id}`)
  } catch (e) {
    error.value = e.message || 'Failed to save changes'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    availableIngredients.value = await recipesApi.getIngredients().catch(() => [])
    const recipe = await recipesApi.getRecipeById(route.params.id)

    if (recipe.user?.id !== store.currentUser?.id) {
      pageError.value = "You don't have permission to edit this recipe."
      return
    }

    form.value = { title: recipe.title, description: recipe.description, difficulty: recipe.difficulty || 'easy' }

    const sorted = [...(recipe.steps || [])].sort((a, b) => a.stepNumber - b.stepNumber)
    steps.value = sorted.map(s => ({ id: ++stepId, description: s.description, imageUrl: s.imageUrl || null }))
    if (steps.value.length === 0) addStep()

    ingredients.value = (recipe.recipeIngredients || []).map(ri => ({
      id: ++ingId,
      name: ri.ingredient?.name || '',
      amount: ri.amount || '',
      dbId: ri.ingredient?.id || null,
      suggestions: [],
      showDropdown: false,
    }))
  } catch (e) {
    pageError.value = 'Failed to load recipe.'
  } finally {
    pageLoading.value = false
  }
})
</script>
