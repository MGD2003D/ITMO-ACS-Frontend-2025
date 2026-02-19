import { renderNavbar } from '../components/navbar.js';
import { recipesApi } from '../api/recipesApi.js';
import { interactionsApi } from '../api/interactionsApi.js';
import { authApi } from '../api/authApi.js';
import { auth } from '../utils/auth.js';
import { ui } from '../utils/ui.js';

let currentRecipe = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        window.location.href = '/recipes.html';
        return;
    }

    await loadRecipe(recipeId);
    await loadComments(recipeId);

    setupCommentForm(recipeId);
});

async function loadRecipe(recipeId) {
    const container = document.getElementById('recipe-content');
    ui.showLoading(container);

    try {
        const recipe = await recipesApi.getRecipeById(recipeId);
        currentRecipe = recipe;

        const isOwner = auth.getCurrentUserId() === recipe.user?.id;
        const isLoggedIn = auth.isAuthenticated();

        container.innerHTML = `
            <div class="recipe-detail-header">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1>${escapeHtml(recipe.title)}</h1>
                        <p class="text-muted">
                            by ${escapeHtml(recipe.user?.username || 'Unknown')} |
                            ${ui.formatDate(recipe.createdAt)}
                        </p>
                    </div>
                    <span class="badge ${ui.getDifficultyBadgeClass(recipe.difficulty)} fs-6">
                        ${recipe.difficulty || 'N/A'}
                    </span>
                </div>

                <p class="lead">${escapeHtml(recipe.description)}</p>

                <div class="mt-3">
                    ${isOwner ? `
                        <a href="/recipe-edit.html?id=${recipe.id}" class="btn btn-outline-primary me-2">
                            <i class="bi bi-pencil"></i> Edit
                        </a>
                    ` : ''}
                    ${isLoggedIn && !isOwner ? `
                        <button class="btn btn-outline-success" id="favorite-btn">
                            <i class="bi bi-bookmark"></i> Save
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-basket"></i> Ingredients</h5>
                        </div>
                        <div class="card-body">
                            ${recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? `
                                <ul class="ingredient-list">
                                    ${recipe.recipeIngredients.map(ri => `
                                        <li>
                                            <strong>${escapeHtml(ri.ingredient?.name || 'Unknown')}</strong>
                                            ${ri.amount ? `- ${escapeHtml(ri.amount)}` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p class="text-muted">No ingredients listed</p>'}
                        </div>
                    </div>
                </div>

                <div class="col-md-8">
                    <h4><i class="bi bi-list-ol"></i> Instructions</h4>
                    ${recipe.steps && recipe.steps.length > 0 ? `
                        ${recipe.steps
                            .sort((a, b) => a.stepNumber - b.stepNumber)
                            .map(step => `
                                <div class="step-item">
                                    <span class="step-number">${step.stepNumber}</span>
                                    <div class="step-content">
                                    <div>${escapeHtml(step.description)}</div>
                                    ${step.imageUrl ? `<img src="${escapeHtml(step.imageUrl)}" class="img-fluid mt-2 rounded step-image" alt="Step ${step.stepNumber}">` : ''}
                                    </div>

                                </div>  
                            `).join('')}
                    ` : '<p class="text-muted">No instructions provided</p>'}
                </div>
            </div>
        `;

        // Show comments section
        document.getElementById('comments-section').style.display = 'block';

        // если залогинен, показывать форму под комментарии
        if (isLoggedIn) {
            document.getElementById('comment-form-container').style.display = 'block';
        }

        // Setup favorite button
        if (isLoggedIn && !isOwner) {
            setupFavoriteButton(recipeId);
        }
    } catch (error) {
        console.error('Failed to load recipe:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Failed to load recipe. The recipe may not exist or the server may be unavailable.
                <br><br>
                <a href="/recipes.html" class="btn btn-primary">Back to Recipes</a>
            </div>
        `;
    }
}

async function loadComments(recipeId) {
    const container = document.getElementById('comments-container');

    try {
        const comments = await interactionsApi.getCommentsByRecipe(recipeId);
        const currentUserId = auth.getCurrentUserId();

        if (comments.length === 0) {
            container.innerHTML = '<p class="text-muted">No comments yet. Be the first to comment!</p>';
            return;
        }

        // поиск username для комментариев
        const uniqueUserIds = [...new Set(comments.map(c => c.user?.id))];
        const usersMap = {};
        await Promise.all(uniqueUserIds.map(async (uid) => {
            try {
                const user = await authApi.getUserById(uid);
                usersMap[uid] = user.username;
            } catch (e) {
                usersMap[uid] = `user_${uid}`;
            }
        }));

        container.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <span class="comment-author">${escapeHtml(usersMap[comment.user?.id] || 'Anonymous')}</span>
                        <span class="comment-date ms-2">${ui.formatDate(comment.createdAt)}</span>
                    </div>
                    ${currentUserId == comment.user?.id ? `
                        <button class="btn btn-sm btn-outline-danger delete-comment-btn" data-id="${comment.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="mb-0 mt-2">${escapeHtml(comment.content)}</p>
            </div>
        `).join('');

        // Add delete handlers
        container.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const commentId = btn.dataset.id;
                await deleteComment(commentId, recipeId);
            });
        });
    } catch (error) {
        console.error('Failed to load comments:', error);
        container.innerHTML = '<p class="text-muted">Failed to load comments.</p>';
    }
}

function setupCommentForm(recipeId) {
    const form = document.getElementById('comment-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const textInput = document.getElementById('comment-text');
        const text = textInput.value.trim();

        if (!text) return;

        try {
            await interactionsApi.addComment(recipeId, text);
            textInput.value = '';
            ui.showSuccess('Comment added!');
            await loadComments(recipeId);
        } catch (error) {
            console.error('Failed to add comment:', error);
            ui.showError('Failed to add comment. Please try again.');
        }
    });
}

async function deleteComment(commentId, recipeId) {
    try {
        await interactionsApi.deleteComment(commentId);
        ui.showSuccess('Comment deleted!');
        await loadComments(recipeId);
    } catch (error) {
        console.error('Failed to delete comment:', error);
        ui.showError('Failed to delete comment. Please try again.');
    }
}

async function setupFavoriteButton(recipeId) {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;

    let isFavorited = false;

    try {
        const favorites = await interactionsApi.getFavoritesByRecipe(recipeId);
        const userId = auth.getCurrentUserId();
        isFavorited = favorites.some(f => f.userId == userId);
    } catch (e) {
        // ignore — just show as not favorited
    }

    updateFavoriteButton(btn, isFavorited);

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
            if (isFavorited) {
                await interactionsApi.removeFromFavorites(Number(recipeId));
                isFavorited = false;
                ui.showSuccess('Removed from saved');
            } else {
                await interactionsApi.addToFavorites(Number(recipeId));
                isFavorited = true;
                ui.showSuccess('Saved!');
            }
            updateFavoriteButton(btn, isFavorited);
        } catch (e) {
            ui.showError('Failed to update favorites');
        }
        btn.disabled = false;
    });
}

function updateFavoriteButton(btn, isFavorited) {
    if (isFavorited) {
        btn.innerHTML = '<i class="bi bi-bookmark-fill"></i> Saved';
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success');
    } else {
        btn.innerHTML = '<i class="bi bi-bookmark"></i> Save';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-outline-success');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
