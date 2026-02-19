import { ui } from '../utils/ui.js';
import { auth } from '../utils/auth.js';

export function createRecipeCard(recipe, options = {}) {
    const { showActions = false, showRemoveFavorite = false, onEdit, onDelete, onRemoveFavorite } = options;
    const isOwner = auth.getCurrentUserId() === recipe.user?.id;

    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';

    const difficultyIcon = getDifficultyIcon(recipe.difficulty);

    card.innerHTML = `
        <div class="card recipe-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">${escapeHtml(recipe.title)}</h5>
                    <span class="badge ${ui.getDifficultyBadgeClass(recipe.difficulty)}">
                        ${difficultyIcon} ${recipe.difficulty || 'N/A'}
                    </span>
                </div>
                <p class="card-text recipe-description">${escapeHtml(truncateText(recipe.description, 100))}</p>
                <div class="recipe-meta">
                    <span class="recipe-author">
                        <i class="bi bi-person"></i>
                        ${escapeHtml(recipe.user?.username || 'Unknown')}
                    </span>
                    <span class="recipe-date">
                        <i class="bi bi-calendar3"></i>
                        ${ui.formatDate(recipe.createdAt)}
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <div class="d-flex justify-content-between align-items-center">
                    <a href="/recipe-detail.html?id=${recipe.id}" class="btn btn-success btn-sm">
                        <i class="bi bi-arrow-right me-1"></i>View
                    </a>
                    ${showRemoveFavorite ? `
                        <button class="btn btn-outline-danger btn-sm remove-fav-btn" title="Remove from saved">
                            <i class="bi bi-bookmark-x"></i>
                        </button>
                    ` : showActions && isOwner ? `
                        <div class="d-flex gap-1">
                            <button class="btn btn-outline-secondary btn-sm edit-btn" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm delete-btn" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    if (showRemoveFavorite && onRemoveFavorite) {
        const removeFavBtn = card.querySelector('.remove-fav-btn');
        if (removeFavBtn) {
            removeFavBtn.addEventListener('click', () => onRemoveFavorite(recipe.id));
        }
    }

    if (showActions && isOwner) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        if (editBtn && onEdit) {
            editBtn.addEventListener('click', () => onEdit(recipe.id));
        }

        if (deleteBtn && onDelete) {
            deleteBtn.addEventListener('click', () => onDelete(recipe.id));
        }
    }

    return card;
}

function getDifficultyIcon(difficulty) {
    switch (difficulty) {
        case 'easy': return '<i class="bi bi-emoji-smile"></i>';
        case 'medium': return '<i class="bi bi-emoji-neutral"></i>';
        case 'hard': return '<i class="bi bi-emoji-expressionless"></i>';
        default: return '';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
