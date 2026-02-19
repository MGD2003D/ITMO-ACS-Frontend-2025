import { renderNavbar } from '../components/navbar.js';
import { createRecipeCard } from '../components/recipeCard.js';
import { recipesApi } from '../api/recipesApi.js';
import { ui } from '../utils/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();
    await loadRecipes();
});

async function loadRecipes() {
    const container = document.getElementById('recipes-container');
    ui.showLoading(container);

    try {
        const recipes = await recipesApi.getRecipes();

        if (recipes.length === 0) {
            ui.showEmpty(container, 'No recipes found. Be the first to create one!');
            return;
        }

        container.innerHTML = '';
        recipes.slice(0, 6).forEach(recipe => {
            const card = createRecipeCard(recipe);
            container.appendChild(card);
        });

        if (recipes.length > 6) {
            const moreLink = document.createElement('div');
            moreLink.className = 'col-12 text-center mt-3';
            moreLink.innerHTML = `
                <a href="/recipes.html" class="btn btn-success">View All Recipes</a>
            `;
            container.appendChild(moreLink);
        }
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
