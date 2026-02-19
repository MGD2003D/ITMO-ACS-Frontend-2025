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
exports.FavoriteController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const favorite_dto_1 = require("../dtos/favorite.dto");
const rabbitmq_config_1 = require("../rabbitmq-config");
let FavoriteController = class FavoriteController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.favRepo = data_source_1.AppDataSource.getRepository(models_1.Favorite);
    }
    createFavorite(requestBody, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = request.user.id;
            const favorite = this.favRepo.create({
                userId: userId,
                recipeId: requestBody.recipeId
            });
            yield this.favRepo.save(favorite);
            this.setStatus(201);
            try {
                const channel = (0, rabbitmq_config_1.getRabbitMQChannel)();
                const queue = 'interactions_events';
                const msg = {
                    type: 'FavoriteCreated',
                    data: {
                        userId: favorite.userId,
                        recipeId: favorite.recipeId
                    }
                };
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
                console.log(`[Interactions Service] Sent message to ${queue}:`, msg);
            }
            catch (error) {
                console.error('[Interactions Service] Failed to send RabbitMQ message:', error);
            }
            return favorite;
        });
    }
    deleteFavorite(recipeId, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = request.user.id;
            const result = yield this.favRepo.delete({ userId, recipeId });
            if (result.affected === 0) {
                this.setStatus(404);
                throw new Error("Favorite not found");
            }
            return { success: true };
        });
    }
};
exports.FavoriteController = FavoriteController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [favorite_dto_1.FavoriteCreateDto, Object]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "createFavorite", null);
__decorate([
    (0, tsoa_1.Delete)(),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "deleteFavorite", null);
exports.FavoriteController = FavoriteController = __decorate([
    (0, tsoa_1.Route)("favorites"),
    (0, tsoa_1.Tags)("Favorites"),
    (0, tsoa_1.Security)("jwt")
], FavoriteController);
