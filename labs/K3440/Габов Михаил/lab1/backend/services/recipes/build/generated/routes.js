"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const recipe_controller_1 = require("./../controllers/recipe.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const ingredient_controller_1 = require("./../controllers/ingredient.controller");
const authMiddleware_1 = require("./../middleware/authMiddleware");
const expressAuthenticationRecasted = authMiddleware_1.expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "RecipeStepResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "stepNumber": { "dataType": "double", "required": true },
            "description": { "dataType": "string", "required": true },
            "imageUrl": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IngredientResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeIngredientResponseDto": {
        "dataType": "refObject",
        "properties": {
            "amount": { "dataType": "string", "required": true },
            "ingredient": { "ref": "IngredientResponseDto", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeDetailResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "title": { "dataType": "string", "required": true },
            "description": { "dataType": "string", "required": true },
            "difficulty": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "user": { "dataType": "nestedObjectLiteral", "nestedProperties": { "username": { "dataType": "string", "required": true }, "id": { "dataType": "double", "required": true } }, "required": true },
            "steps": { "dataType": "array", "array": { "dataType": "refObject", "ref": "RecipeStepResponseDto" }, "required": true },
            "recipeIngredients": { "dataType": "array", "array": { "dataType": "refObject", "ref": "RecipeIngredientResponseDto" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeIngredientCreateDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "amount": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeStepCreateDto": {
        "dataType": "refObject",
        "properties": {
            "stepNumber": { "dataType": "double", "required": true },
            "description": { "dataType": "string", "required": true },
            "imageUrl": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeCreateDto": {
        "dataType": "refObject",
        "properties": {
            "title": { "dataType": "string", "required": true },
            "description": { "dataType": "string", "required": true },
            "difficulty": { "dataType": "string", "required": true },
            "ingredients": { "dataType": "array", "array": { "dataType": "refObject", "ref": "RecipeIngredientCreateDto" } },
            "steps": { "dataType": "array", "array": { "dataType": "refObject", "ref": "RecipeStepCreateDto" } },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeListResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "title": { "dataType": "string", "required": true },
            "description": { "dataType": "string", "required": true },
            "difficulty": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "user": { "dataType": "nestedObjectLiteral", "nestedProperties": { "username": { "dataType": "string", "required": true }, "id": { "dataType": "double", "required": true } }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecipeUpdateDto": {
        "dataType": "refObject",
        "properties": {
            "title": { "dataType": "string" },
            "description": { "dataType": "string" },
            "difficulty": { "dataType": "string" },
            "steps": { "dataType": "array", "array": { "dataType": "refObject", "ref": "RecipeStepCreateDto" } },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IngredientDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IngredientCreateDto": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IngredientUpdateDto": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsRecipeController_createRecipe = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "RecipeCreateDto" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.post('/recipes', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController)), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController.prototype.createRecipe)), function RecipeController_createRecipe(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecipeController_createRecipe, request, response });
                const controller = new recipe_controller_1.RecipeController();
                yield templateService.apiHandler({
                    methodName: 'createRecipe',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 201,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsRecipeController_getRecipes = {
        ingredient: { "in": "query", "name": "ingredient", "dataType": "string" },
        difficulty: { "in": "query", "name": "difficulty", "dataType": "string" },
    };
    app.get('/recipes', ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController)), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController.prototype.getRecipes)), function RecipeController_getRecipes(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecipeController_getRecipes, request, response });
                const controller = new recipe_controller_1.RecipeController();
                yield templateService.apiHandler({
                    methodName: 'getRecipes',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsRecipeController_getRecipeById = {
        recipeId: { "in": "path", "name": "recipeId", "required": true, "dataType": "double" },
    };
    app.get('/recipes/:recipeId', ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController)), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController.prototype.getRecipeById)), function RecipeController_getRecipeById(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecipeController_getRecipeById, request, response });
                const controller = new recipe_controller_1.RecipeController();
                yield templateService.apiHandler({
                    methodName: 'getRecipeById',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsRecipeController_updateRecipe = {
        recipeId: { "in": "path", "name": "recipeId", "required": true, "dataType": "double" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "RecipeUpdateDto" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.put('/recipes/:recipeId', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController)), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController.prototype.updateRecipe)), function RecipeController_updateRecipe(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecipeController_updateRecipe, request, response });
                const controller = new recipe_controller_1.RecipeController();
                yield templateService.apiHandler({
                    methodName: 'updateRecipe',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsRecipeController_deleteRecipe = {
        recipeId: { "in": "path", "name": "recipeId", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.delete('/recipes/:recipeId', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController)), ...((0, runtime_1.fetchMiddlewares)(recipe_controller_1.RecipeController.prototype.deleteRecipe)), function RecipeController_deleteRecipe(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecipeController_deleteRecipe, request, response });
                const controller = new recipe_controller_1.RecipeController();
                yield templateService.apiHandler({
                    methodName: 'deleteRecipe',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIngredientController_createIngredient = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "IngredientCreateDto" },
    };
    app.post('/ingredients', ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController)), ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController.prototype.createIngredient)), function IngredientController_createIngredient(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientController_createIngredient, request, response });
                const controller = new ingredient_controller_1.IngredientController();
                yield templateService.apiHandler({
                    methodName: 'createIngredient',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 201,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIngredientController_getAllIngredients = {};
    app.get('/ingredients', ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController)), ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController.prototype.getAllIngredients)), function IngredientController_getAllIngredients(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientController_getAllIngredients, request, response });
                const controller = new ingredient_controller_1.IngredientController();
                yield templateService.apiHandler({
                    methodName: 'getAllIngredients',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIngredientController_getIngredientById = {
        ingredientId: { "in": "path", "name": "ingredientId", "required": true, "dataType": "double" },
    };
    app.get('/ingredients/:ingredientId', ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController)), ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController.prototype.getIngredientById)), function IngredientController_getIngredientById(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientController_getIngredientById, request, response });
                const controller = new ingredient_controller_1.IngredientController();
                yield templateService.apiHandler({
                    methodName: 'getIngredientById',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIngredientController_updateIngredient = {
        ingredientId: { "in": "path", "name": "ingredientId", "required": true, "dataType": "double" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "IngredientUpdateDto" },
    };
    app.put('/ingredients/:ingredientId', ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController)), ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController.prototype.updateIngredient)), function IngredientController_updateIngredient(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientController_updateIngredient, request, response });
                const controller = new ingredient_controller_1.IngredientController();
                yield templateService.apiHandler({
                    methodName: 'updateIngredient',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIngredientController_deleteIngredient = {
        ingredientId: { "in": "path", "name": "ingredientId", "required": true, "dataType": "double" },
    };
    app.delete('/ingredients/:ingredientId', ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController)), ...((0, runtime_1.fetchMiddlewares)(ingredient_controller_1.IngredientController.prototype.deleteIngredient)), function IngredientController_deleteIngredient(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientController_deleteIngredient, request, response });
                const controller = new ingredient_controller_1.IngredientController();
                yield templateService.apiHandler({
                    methodName: 'deleteIngredient',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return function runAuthenticationMiddleware(request, response, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                // keep track of failed auth attempts so we can hand back the most
                // recent one.  This behavior was previously existing so preserving it
                // here
                const failedAttempts = [];
                const pushAndRethrow = (error) => {
                    failedAttempts.push(error);
                    throw error;
                };
                const secMethodOrPromises = [];
                for (const secMethod of security) {
                    if (Object.keys(secMethod).length > 1) {
                        const secMethodAndPromises = [];
                        for (const name in secMethod) {
                            secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow));
                        }
                        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                        secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                            .then(users => { return users[0]; }));
                    }
                    else {
                        for (const name in secMethod) {
                            secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow));
                        }
                    }
                }
                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                try {
                    request['user'] = yield Promise.any(secMethodOrPromises);
                    // Response was sent in middleware, abort
                    if (response.writableEnded) {
                        return;
                    }
                    next();
                }
                catch (err) {
                    // Show most recent error as response
                    const error = failedAttempts.pop();
                    error.status = error.status || 401;
                    // Response was sent in middleware, abort
                    if (response.writableEnded) {
                        return;
                    }
                    next(error);
                }
                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            });
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
