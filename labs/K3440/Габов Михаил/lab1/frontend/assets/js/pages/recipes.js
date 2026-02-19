import { renderNavbar } from '../components/navbar.js';
import { createRecipeCard } from '../components/recipeCard.js';
import { recipesApi } from '../api/recipesApi.js';
import { ui } from '../utils/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    const filterForm = document.getElementById('filter-form');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const ingredientInput = document.getElementById('ingredient-filter');
    const difficultySelect = document.getElementById('difficulty-filter');

    // Load initial recipes
    await loadRecipes();

    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadRecipes();
    });

    clearFiltersBtn.addEventListener('click', async () => {
        ingredientInput.value = '';
        difficultySelect.value = '';
        await loadRecipes();
    });
});

async function loadRecipes() {
    const container = document.getElementById('recipes-container');
    const ingredient = document.getElementById('ingredient-filter').value.trim();
    const difficulty = document.getElementById('difficulty-filter').value;

    ui.showLoading(container);

    try {
        const filters = {};
        if (ingredient) filters.ingredient = ingredient;
        if (difficulty) filters.difficulty = difficulty;

        const recipes = await recipesApi.getRecipes(filters);

        if (recipes.length === 0) {
            ui.showEmpty(container, 'No recipes found matching your criteria.');
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load recipes:', error);
        ui.showError('Failed to load recipes. Please try again later.');
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load recipes. Please check if the backend is running.</div>
            </div>
        `;
    }
}
