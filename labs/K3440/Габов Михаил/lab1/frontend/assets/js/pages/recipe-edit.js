import { renderNavbar } from '../components/navbar.js';
import { recipesApi } from '../api/recipesApi.js';
import { auth } from '../utils/auth.js';
import { ui } from '../utils/ui.js';

let currentRecipe = null;
let stepCounter = 0;
let ingredientCounter = 0;
let availableIngredients = [];

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    // Require authentication
    if (!auth.requireAuth()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        window.location.href = '/my-recipes.html';
        return;
    }

    await loadIngredients();
    await loadRecipe(recipeId);
});

async function loadIngredients() {
    try {
        availableIngredients = await recipesApi.getIngredients();
    } catch (error) {
        console.error('Failed to load ingredients:', error);
        availableIngredients = [];
    }
}

async function loadRecipe(recipeId) {
    const container = document.getElementById('form-container');
    ui.showLoading(container);

    try {
        currentRecipe = await recipesApi.getRecipeById(recipeId);

        // Check ownership
        if (currentRecipe.user?.id !== auth.getCurrentUserId()) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    You don't have permission to edit this recipe.
                    <br><br>
                    <a href="/my-recipes.html" class="btn btn-primary">Back to My Recipes</a>
                </div>
            `;
            return;
        }

        renderForm();
    } catch (error) {
        console.error('Failed to load recipe:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Failed to load recipe.
                <br><br>
                <a href="/my-recipes.html" class="btn btn-primary">Back to My Recipes</a>
            </div>
        `;
    }
}

function renderForm() {
    const container = document.getElementById('form-container');

    container.innerHTML = `
        <form id="recipe-form">
            <div class="row">
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Basic Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="title" class="form-label">Title *</label>
                                <input type="text" class="form-control" id="title" value="${escapeHtml(currentRecipe.title)}" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description *</label>
                                <textarea class="form-control" id="description" rows="3" required>${escapeHtml(currentRecipe.description)}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="difficulty" class="form-label">Difficulty</label>
                                <select class="form-select" id="difficulty">
                                    <option value="easy" ${currentRecipe.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                                    <option value="medium" ${currentRecipe.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="hard" ${currentRecipe.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Steps</h5>
                            <button type="button" class="btn btn-sm btn-success" id="add-step-btn">
                                <i class="bi bi-plus"></i> <span class="d-none d-sm-inline">Add Step</span>
                            </button>
                        </div>
                        <div class="card-body">
                            <div id="steps-container">
                                <!-- Steps will be added here -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Ingredients</h5>
                            <button type="button" class="btn btn-sm btn-success" id="add-ingredient-btn">
                                <i class="bi bi-plus"></i> <span class="d-none d-sm-inline">Add</span>
                            </button>
                        </div>
                        <div class="card-body">
                            <div id="ingredients-container">
                                <!-- Ingredients will be added here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="error-message" class="alert alert-danger d-none"></div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success btn-lg" id="submit-btn">Save Changes</button>
                <a href="/recipe-detail.html?id=${currentRecipe.id}" class="btn btn-outline-secondary btn-lg">Cancel</a>
            </div>
        </form>
    `;

    setupEventListeners();
    loadExistingSteps();
    loadExistingIngredients();
}

function setupEventListeners() {
    document.getElementById('add-step-btn').addEventListener('click', () => addStep());
    document.getElementById('add-ingredient-btn').addEventListener('click', () => addIngredient());
    document.getElementById('recipe-form').addEventListener('submit', handleSubmit);
}

function loadExistingSteps() {
    if (currentRecipe.steps && currentRecipe.steps.length > 0) {
        const sortedSteps = [...currentRecipe.steps].sort((a, b) => a.stepNumber - b.stepNumber);
        sortedSteps.forEach(step => {
            addStep(step.description, step.imageUrl);
        });
    } else {
        addStep();
    }
}

function loadExistingIngredients() {
    if (currentRecipe.recipeIngredients && currentRecipe.recipeIngredients.length > 0) {
        currentRecipe.recipeIngredients.forEach(ri => {
            addIngredient(ri.ingredient?.name || '', ri.amount || '', ri.ingredient?.id);
        });
    }
}

// ==================== Image Processing ====================

function processImage(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Not an image file'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function getImageFromClipboard(e) {
    const items = e.clipboardData?.items;
    if (!items) return null;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            return item.getAsFile();
        }
    }
    return null;
}

async function handleImageAdd(file, stepDiv) {
    if (!file || !file.type.startsWith('image/')) return;

    try {
        const dataUrl = await processImage(file);
        showImagePreview(stepDiv, dataUrl);
    } catch (err) {
        console.error('Failed to process image:', err);
    }
}

function showImagePreview(stepDiv, dataUrl) {
    const dropzone = stepDiv.querySelector('.image-dropzone');
    const previewContainer = stepDiv.querySelector('.image-preview-container');

    dropzone.style.display = 'none';
    previewContainer.innerHTML = `
        <div class="image-preview">
            <img src="${dataUrl}" alt="Step image">
            <button type="button" class="image-remove-btn" title="Remove image">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    previewContainer.dataset.imageUrl = dataUrl;

    previewContainer.querySelector('.image-remove-btn').addEventListener('click', () => {
        previewContainer.innerHTML = '';
        delete previewContainer.dataset.imageUrl;
        dropzone.style.display = '';
    });
}

function setupStepHandlers(stepDiv) {
    const dropzone = stepDiv.querySelector('.image-dropzone');
    const fileInput = stepDiv.querySelector('.image-file-input');
    const textarea = stepDiv.querySelector('.step-description');
    const browseLink = stepDiv.querySelector('.image-browse-link');

    // Paste image from clipboard on textarea
    textarea.addEventListener('paste', (e) => {
        const file = getImageFromClipboard(e);
        if (file) {
            e.preventDefault();
            handleImageAdd(file, stepDiv);
        }
    });

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });

    // Drag & drop on dropzone
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleImageAdd(file, stepDiv);
    });

    // Browse link opens file picker
    browseLink.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            handleImageAdd(fileInput.files[0], stepDiv);
            fileInput.value = '';
        }
    });
}

// ==================== Steps ====================

function addStep(description = '', imageUrl = null) {
    stepCounter++;
    const container = document.getElementById('steps-container');

    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item mb-3';
    stepDiv.dataset.stepId = stepCounter;

    stepDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
            <span class="step-number">${stepCounter}</span>
            <button type="button" class="btn btn-sm btn-outline-danger remove-step-btn">
                <i class="bi bi-trash"></i>
            </button>
        </div>
        <textarea class="form-control step-description" rows="2" placeholder="Describe this step... (Ctrl+V to paste image)" required>${escapeHtml(description)}</textarea>
        <div class="image-dropzone">
            <i class="bi bi-image"></i>
            Drop image here or <a href="#" class="image-browse-link">browse</a>
        </div>
        <input type="file" accept="image/*" class="image-file-input d-none">
        <div class="image-preview-container"></div>
    `;

    stepDiv.querySelector('.remove-step-btn').addEventListener('click', () => {
        stepDiv.remove();
        renumberSteps();
    });

    setupStepHandlers(stepDiv);
    container.appendChild(stepDiv);

    // Auto-resize textarea if pre-filled
    if (description) {
        const textarea = stepDiv.querySelector('.step-description');
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Load existing image if present
    if (imageUrl) {
        showImagePreview(stepDiv, imageUrl);
    }
}

function renumberSteps() {
    const steps = document.querySelectorAll('#steps-container .step-item');
    stepCounter = 0;
    steps.forEach((step, index) => {
        stepCounter = index + 1;
        step.querySelector('.step-number').textContent = stepCounter;
    });
}

// ==================== Ingredients (autocomplete) ====================

function addIngredient(name = '', amount = '', dbId = null) {
    ingredientCounter++;
    const container = document.getElementById('ingredients-container');

    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient-item mb-3 p-2 border rounded';
    ingredientDiv.dataset.ingredientId = ingredientCounter;

    ingredientDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="ingredient-input-wrapper flex-grow-1">
                <input type="text" class="form-control form-control-sm ingredient-name-input"
                       placeholder="Type ingredient name..." autocomplete="off" value="${escapeHtml(name)}">
                <div class="ingredient-autocomplete" style="display:none"></div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-ingredient-btn">
                <i class="bi bi-x"></i>
            </button>
        </div>
        <input type="text" class="form-control form-control-sm ingredient-amount" placeholder="Amount (e.g. 2 cups)" value="${escapeHtml(amount)}">
    `;

    if (dbId) {
        ingredientDiv.querySelector('.ingredient-name-input').dataset.ingredientDbId = dbId;
    }

    ingredientDiv.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
        ingredientDiv.remove();
    });

    setupIngredientAutocomplete(ingredientDiv);
    container.appendChild(ingredientDiv);
}

function setupIngredientAutocomplete(ingredientDiv) {
    const input = ingredientDiv.querySelector('.ingredient-name-input');
    const dropdown = ingredientDiv.querySelector('.ingredient-autocomplete');

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
            dropdown.style.display = 'none';
            delete input.dataset.ingredientDbId;
            return;
        }

        const matches = availableIngredients.filter(ing =>
            ing.name.toLowerCase().includes(query)
        );

        const exactMatch = availableIngredients.find(ing =>
            ing.name.toLowerCase() === query
        );

        let html = matches.slice(0, 8).map(ing =>
            `<div class="ingredient-autocomplete-item" data-id="${ing.id}" data-name="${escapeHtml(ing.name)}">${escapeHtml(ing.name)}</div>`
        ).join('');

        if (!exactMatch && query.length > 0) {
            html += `<div class="ingredient-autocomplete-item create-new" data-name="${escapeHtml(input.value.trim())}">+ Create "${escapeHtml(input.value.trim())}"</div>`;
        }

        if (html) {
            dropdown.innerHTML = html;
            dropdown.style.display = '';

            dropdown.querySelectorAll('.ingredient-autocomplete-item').forEach(item => {
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.value = item.dataset.name;
                    if (item.dataset.id) {
                        input.dataset.ingredientDbId = item.dataset.id;
                    } else {
                        delete input.dataset.ingredientDbId;
                    }
                    dropdown.style.display = 'none';
                });
            });
        } else {
            dropdown.style.display = 'none';
        }

        if (!exactMatch) {
            delete input.dataset.ingredientDbId;
        }
    });

    input.addEventListener('blur', () => {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim()) {
            input.dispatchEvent(new Event('input'));
        }
    });
}

// ==================== Form Submit ====================

async function handleSubmit(e) {
    e.preventDefault();

    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.add('d-none');

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const difficulty = document.getElementById('difficulty').value;

    // Collect steps
    const stepElements = document.querySelectorAll('#steps-container .step-item');
    const steps = Array.from(stepElements).map((el, index) => {
        const previewContainer = el.querySelector('.image-preview-container');
        return {
            stepNumber: index + 1,
            description: el.querySelector('.step-description').value.trim(),
            imageUrl: previewContainer?.dataset.imageUrl || undefined
        };
    }).filter(step => step.description);

    // Collect ingredients
    const ingredientElements = document.querySelectorAll('#ingredients-container .ingredient-item');
    const rawIngredients = Array.from(ingredientElements).map(el => {
        const input = el.querySelector('.ingredient-name-input');
        return {
            name: input.value.trim(),
            dbId: input.dataset.ingredientDbId ? parseInt(input.dataset.ingredientDbId) : null,
            amount: el.querySelector('.ingredient-amount').value.trim()
        };
    }).filter(ing => ing.name);

    // Validation
    if (!title || !description) {
        showError('Please fill in title and description');
        return;
    }

    if (steps.length === 0) {
        showError('Please add at least one step');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        // Resolve ingredient IDs: create new ones if needed
        const ingredients = [];
        for (const ing of rawIngredients) {
            let id = ing.dbId;
            if (!id) {
                const existing = availableIngredients.find(
                    a => a.name.toLowerCase() === ing.name.toLowerCase()
                );
                if (existing) {
                    id = existing.id;
                } else {
                    const created = await recipesApi.createIngredient(ing.name);
                    id = created.id;
                    availableIngredients.push(created);
                }
            }
            ingredients.push({ id, amount: ing.amount });
        }

        await recipesApi.updateRecipe(currentRecipe.id, {
            title,
            description,
            difficulty,
            steps,
            ingredients
        });

        ui.showSuccess('Recipe updated successfully!');
        setTimeout(() => {
            window.location.href = `/recipe-detail.html?id=${currentRecipe.id}`;
        }, 1000);
    } catch (error) {
        console.error('Failed to update recipe:', error);
        showError(error.message || 'Failed to update recipe. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
