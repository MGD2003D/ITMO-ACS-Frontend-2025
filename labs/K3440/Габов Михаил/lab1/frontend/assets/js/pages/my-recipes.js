import { renderNavbar } from '../components/navbar.js';
import { createRecipeCard } from '../components/recipeCard.js';
import { recipesApi } from '../api/recipesApi.js';
import { interactionsApi } from '../api/interactionsApi.js';
import { auth } from '../utils/auth.js';
import { ui } from '../utils/ui.js';

let deleteModal;
let recipeToDelete = null;
let activeTab = 'created';

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    if (!auth.requireAuth()) {
        return;
    }

    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (recipeToDelete) {
            await deleteRecipe(recipeToDelete);
        }
    });

    // переключение избранное и автор
    document.querySelectorAll('#recipes-tabs .nav-link').forEach(tab => {
        tab.addEventListener('click', async () => {
            document.querySelectorAll('#recipes-tabs .nav-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;

            if (activeTab === 'created') {
                await loadMyRecipes();
            } else {
                await loadSavedRecipes();
            }
        });
    });

    await loadMyRecipes();
});

async function loadMyRecipes() {
    const container = document.getElementById('recipes-container');
    const userId = auth.getCurrentUserId();

    ui.showLoading(container);

    try {
        const recipes = await recipesApi.getRecipes({ userId });

        if (recipes.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-journal-plus"></i>
                        <h4>No recipes yet</h4>
                        <p>You haven't created any recipes. Start by creating your first recipe!</p>
                        <a href="/recipe-create.html" class="btn btn-success">Create Recipe</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe, {
                showActions: true,
                onEdit: (id) => {
                    window.location.href = `/recipe-edit.html?id=${id}`;
                },
                onDelete: (id) => {
                    recipeToDelete = id;
                    deleteModal.show();
                }
            });
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load recipes:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load recipes. Please check if the backend is running.</div>
            </div>
        `;
    }
}

async function loadSavedRecipes() {
    const container = document.getElementById('recipes-container');

    ui.showLoading(container);

    try {
        const favorites = await interactionsApi.getFavoritesByUser();

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-bookmark"></i>
                        <h4>No saved recipes</h4>
                        <p>You haven't saved any recipes yet. Browse recipes and save the ones you like!</p>
                        <a href="/recipes.html" class="btn btn-success">Browse Recipes</a>
                    </div>
                </div>
            `;
            return;
        }

        const recipes = await Promise.all(
            favorites.map(fav => recipesApi.getRecipeById(fav.recipeId).catch(() => null))
        );
        const validRecipes = recipes.filter(r => r !== null);

        if (validRecipes.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-bookmark"></i>
                        <h4>No saved recipes</h4>
                        <p>Your saved recipes are no longer available.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        validRecipes.forEach(recipe => {
            const card = createRecipeCard(recipe, {
                showRemoveFavorite: true,
                onRemoveFavorite: async (id) => {
                    try {
                        await interactionsApi.removeFromFavorites(id);
                        ui.showSuccess('Removed from saved');
                        await loadSavedRecipes();
                    } catch (err) {
                        ui.showError('Failed to remove from saved');
                    }
                }
            });
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load saved recipes:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load saved recipes. Please check if the backend is running.</div>
            </div>
        `;
    }
}

async function deleteRecipe(recipeId) {
    try {
        await recipesApi.deleteRecipe(recipeId);
        deleteModal.hide();
        recipeToDelete = null;
        ui.showSuccess('Recipe deleted successfully!');
        await loadMyRecipes();
    } catch (error) {
        console.error('Failed to delete recipe:', error);
        ui.showError('Failed to delete recipe. Please try again.');
    }
}
