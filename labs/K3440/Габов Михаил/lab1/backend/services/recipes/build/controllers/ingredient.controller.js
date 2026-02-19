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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const ingredient_dto_1 = require("../dtos/ingredient.dto");
let IngredientController = class IngredientController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.repo = data_source_1.AppDataSource.getRepository(models_1.Ingredient);
    }
    createIngredient(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const ingredient = this.repo.create(requestBody);
            yield this.repo.save(ingredient);
            this.setStatus(201);
            return this.toIngredientDto(ingredient);
        });
    }
    getAllIngredients() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.repo.find();
            return items.map(this.toIngredientDto);
        });
    }
    getIngredientById(ingredientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ingredient = yield this.repo.findOneBy({ id: ingredientId });
            if (!ingredient) {
                this.setStatus(404);
                throw new Error("Ingredient not found");
            }
            return this.toIngredientDto(ingredient);
        });
    }
    updateIngredient(ingredientId, requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const ingredient = yield this.repo.preload(Object.assign({ id: ingredientId }, requestBody));
            if (!ingredient) {
                this.setStatus(404);
                throw new Error("Ingredient not found");
            }
            yield this.repo.save(ingredient);
            return this.toIngredientDto(ingredient);
        });
    }
    deleteIngredient(ingredientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.delete(ingredientId);
            if (result.affected === 0) {
                this.setStatus(404);
                throw new Error("Ingredient not found");
            }
            return { success: true };
        });
    }
    toIngredientDto(ingredient) {
        return {
            id: ingredient.id,
            name: ingredient.name
        };
    }
};
exports.IngredientController = IngredientController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingredient_dto_1.IngredientCreateDto]),
    __metadata("design:returntype", Promise)
], IngredientController.prototype, "createIngredient", null);
__decorate([
    (0, tsoa_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngredientController.prototype, "getAllIngredients", null);
__decorate([
    (0, tsoa_1.Get)("/{ingredientId}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IngredientController.prototype, "getIngredientById", null);
__decorate([
    (0, tsoa_1.Put)("/{ingredientId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ingredient_dto_1.IngredientUpdateDto]),
    __metadata("design:returntype", Promise)
], IngredientController.prototype, "updateIngredient", null);
__decorate([
    (0, tsoa_1.Delete)("/{ingredientId}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IngredientController.prototype, "deleteIngredient", null);
exports.IngredientController = IngredientController = __decorate([
    (0, tsoa_1.Route)("ingredients"),
    (0, tsoa_1.Tags)("Ingredients")
], IngredientController);
