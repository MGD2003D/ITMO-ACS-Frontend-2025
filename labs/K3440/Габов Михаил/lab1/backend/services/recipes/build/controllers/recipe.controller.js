"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const recipe_dto_1 = require("../dtos/recipe.dto");
const rabbitmq_config_1 = require("../rabbitmq-config");
const axios_1 = __importDefault(require("axios"));
let RecipeController = class RecipeController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.recipeRepo = data_source_1.AppDataSource.getRepository(models_1.Recipe);
        this.ingRepo = data_source_1.AppDataSource.getRepository(models_1.Ingredient);
        this.riRepo = data_source_1.AppDataSource.getRepository(models_1.RecipeIngredient);
        this.stepRepo = data_source_1.AppDataSource.getRepository(models_1.RecipeStep);
    }
    createRecipe(requestBody, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = request.user.id;
            const { ingredients, steps } = requestBody, recipeData = __rest(requestBody, ["ingredients", "steps"]);
            const recipe = this.recipeRepo.create(Object.assign(Object.assign({}, recipeData), { userId: userId }));
            const savedRecipe = yield this.recipeRepo.save(recipe);
            const savedRecipeIngredients = [];
            const savedSteps = [];
            if (Array.isArray(ingredients)) {
                for (const ingDto of ingredients) {
                    const ingredientEntity = yield this.ingRepo.findOneByOrFail({ id: ingDto.id });
                    const recipeIngredient = this.riRepo.create({
                        recipeId: savedRecipe.id,
                        ingredientId: ingredientEntity.id,
                        amount: ingDto.amount,
                    });
                    const savedRi = yield this.riRepo.save(recipeIngredient);
                    savedRi.ingredient = ingredientEntity;
                    savedRecipeIngredients.push(savedRi);
                }
            }
            if (Array.isArray(steps)) {
                for (const stepDto of steps) {
                    const step = this.stepRepo.create(Object.assign(Object.assign({}, stepDto), { recipe: savedRecipe }));
                    const savedStep = yield this.stepRepo.save(step);
                    savedSteps.push(savedStep);
                }
            }
            try {
                const rabbitMQChannel = (0, rabbitmq_config_1.getRabbitMQChannel)();
                const queue = 'new_recipe_events';
                const msg = JSON.stringify({
                    type: 'RecipeCreated',
                    recipeId: savedRecipe.id,
                    title: savedRecipe.title,
                    userId: savedRecipe.userId,
                });
                rabbitMQChannel.sendToQueue(queue, Buffer.from(msg));
                console.log(`[Recipes Service] Sent message to ${queue}`);
            }
            catch (error) {
                console.error('[Recipes Service] Failed to send message:', error);
            }
            this.setStatus(201);
            const username = yield this.fetchUsername(savedRecipe.userId);
            return {
                id: savedRecipe.id,
                title: savedRecipe.title,
                description: savedRecipe.description,
                difficulty: savedRecipe.difficulty,
                createdAt: savedRecipe.createdAt,
                user: {
                    id: savedRecipe.userId,
                    username: username,
                },
                steps: savedSteps.map(s => ({
                    id: s.id,
                    stepNumber: s.stepNumber,
                    description: s.description,
                    imageUrl: s.imageUrl,
                })),
                recipeIngredients: savedRecipeIngredients.map(ri => ({
                    amount: ri.amount,
                    ingredient: {
                        id: ri.ingredient.id,
                        name: ri.ingredient.name,
                    }
                })),
            };
        });
    }
    getRecipes(ingredient, difficulty) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = this.recipeRepo.createQueryBuilder("r")
                .leftJoin("r.recipeIngredients", "ri")
                .leftJoin("ri.ingredient", "ing");
            if (difficulty)
                qb.andWhere("r.difficulty = :d", { d: difficulty });
            if (ingredient)
                qb.andWhere("ing.name ILIKE :ing", { ing: `%${ingredient}%` });
            const recipes = yield qb.getMany();
            return yield Promise.all(recipes.map(r => this.toRecipeListDto(r)));
        });
    }
    getRecipeById(recipeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipe = yield this.recipeRepo.findOne({
                where: { id: recipeId },
                relations: ["steps", "recipeIngredients", "recipeIngredients.ingredient"],
            });
            if (!recipe) {
                this.setStatus(404);
                throw new Error("Recipe not found");
            }
            return yield this.toRecipeDetailDto(recipe);
        });
    }
    updateRecipe(recipeId, requestBody, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { steps } = requestBody, data = __rest(requestBody, ["steps"]);
            const recipe = yield this.recipeRepo.preload(Object.assign({ id: recipeId }, data));
            if (!recipe) {
                this.setStatus(404);
                throw new Error("Recipe not found");
            }
            if (recipe.userId !== request.user.id) {
                this.setStatus(403);
                throw new Error("User is not authorized to update this recipe");
            }
            yield data_source_1.AppDataSource.transaction((em) => __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(steps)) {
                    yield em.delete(models_1.RecipeStep, { recipe: { id: recipeId } });
                    const newSteps = steps.map((s) => {
                        const step = em.create(models_1.RecipeStep, s);
                        step.recipe = recipe;
                        return step;
                    });
                    recipe.steps = yield em.save(newSteps);
                }
                yield em.save(models_1.Recipe, recipe);
            }));
            const updatedRecipe = yield this.recipeRepo.findOneOrFail({
                where: { id: recipeId },
                relations: ["steps", "recipeIngredients", "recipeIngredients.ingredient"],
            });
            return yield this.toRecipeDetailDto(updatedRecipe);
        });
    }
    deleteRecipe(recipeId, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipe = yield this.recipeRepo.findOneBy({ id: recipeId });
            if (!recipe) {
                this.setStatus(404);
                throw new Error("Recipe not found");
            }
            if (recipe.userId !== request.user.id) {
                this.setStatus(403);
                throw new Error("User is not authorized to delete this recipe");
            }
            const result = yield this.recipeRepo.delete(recipeId);
            if (!result.affected) {
                this.setStatus(404);
                throw new Error("Recipe not found");
            }
            return { success: true };
        });
    }
    fetchUsername(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`http://auth-users-service:3001/users/search/by?id=${userId}`);
                return response.data.username;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`[Recipes Service] Failed to fetch username for userId ${userId}:`, error.message);
                }
                else {
                    console.error(`[Recipes Service] Failed to fetch username for userId ${userId}:`, error);
                }
                return "Unknown User";
            }
        });
    }
    toRecipeDetailDto(recipe) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = yield this.fetchUsername(recipe.userId);
            return {
                id: recipe.id,
                title: recipe.title,
                description: recipe.description,
                difficulty: recipe.difficulty,
                createdAt: recipe.createdAt,
                user: {
                    id: recipe.userId,
                    username: username,
                },
                steps: recipe.steps.map(s => ({
                    id: s.id,
                    stepNumber: s.stepNumber,
                    description: s.description,
                    imageUrl: s.imageUrl,
                })),
                recipeIngredients: recipe.recipeIngredients.map(ri => ({
                    amount: ri.amount,
                    ingredient: {
                        id: ri.ingredient.id,
                        name: ri.ingredient.name,
                    }
                })),
            };
        });
    }
    toRecipeListDto(recipe) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = yield this.fetchUsername(recipe.userId);
            return {
                id: recipe.id,
                title: recipe.title,
                description: recipe.description,
                difficulty: recipe.difficulty,
                createdAt: recipe.createdAt,
                user: {
                    id: recipe.userId,
                    username: username,
                },
            };
        });
    }
};
exports.RecipeController = RecipeController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recipe_dto_1.RecipeCreateDto, Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "createRecipe", null);
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "getRecipes", null);
__decorate([
    (0, tsoa_1.Get)("/{recipeId}"),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "getRecipeById", null);
__decorate([
    (0, tsoa_1.Put)("/{recipeId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, recipe_dto_1.RecipeUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "updateRecipe", null);
__decorate([
    (0, tsoa_1.Delete)("/{recipeId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "deleteRecipe", null);
exports.RecipeController = RecipeController = __decorate([
    (0, tsoa_1.Route)("recipes"),
    (0, tsoa_1.Tags)("Recipes"),
    (0, tsoa_1.Security)("jwt")
], RecipeController);
