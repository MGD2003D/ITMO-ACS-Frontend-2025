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
exports.CommentController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const comment_dto_1 = require("../dtos/comment.dto");
const rabbitmq_config_1 = require("../rabbitmq-config");
let CommentController = class CommentController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.commentRepo = data_source_1.AppDataSource.getRepository(models_1.Comment);
    }
    createComment(requestBody, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = request.user.id;
            const newCommentData = {
                content: requestBody.content,
                recipeId: requestBody.recipeId,
                userId: userId,
            };
            const comment = this.commentRepo.create(newCommentData);
            yield this.commentRepo.save(comment);
            this.setStatus(201);
            try {
                const channel = (0, rabbitmq_config_1.getRabbitMQChannel)();
                const queue = 'interactions_events';
                const msg = {
                    type: 'CommentCreated',
                    data: {
                        commentId: comment.id,
                        content: comment.content,
                        userId: comment.userId,
                        recipeId: comment.recipeId
                    }
                };
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
                console.log(`[Interactions Service] Sent message to ${queue}:`, msg);
            }
            catch (error) {
                console.error('[Interactions Service] Failed to send RabbitMQ message:', error);
            }
            return this.toCommentResponseDto(comment);
        });
    }
    getCommentsByRecipe(recipeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.commentRepo.find({
                where: { recipeId: recipeId },
                order: { createdAt: 'ASC' }
            });
            return comments.map(this.toCommentResponseDto);
        });
    }
    deleteComment(commentId, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this.commentRepo.findOneBy({ id: commentId });
            if (!comment) {
                this.setStatus(404);
                throw new Error("Comment not found");
            }
            if (comment.userId !== request.user.id) {
                this.setStatus(403);
                throw new Error("User is not authorized to delete this comment");
            }
            const result = yield this.commentRepo.delete(commentId);
            if (result.affected === 0) {
                this.setStatus(404);
                throw new Error("Comment not found during deletion");
            }
            return { success: true };
        });
    }
    toCommentResponseDto(comment) {
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                id: comment.userId,
                username: `user_${comment.userId}`,
                avatarUrl: undefined,
            },
        };
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_dto_1.CommentCreateDto, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "createComment", null);
__decorate([
    (0, tsoa_1.NoSecurity)(),
    (0, tsoa_1.Get)(),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getCommentsByRecipe", null);
__decorate([
    (0, tsoa_1.Delete)("/{commentId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "deleteComment", null);
exports.CommentController = CommentController = __decorate([
    (0, tsoa_1.Route)("comments"),
    (0, tsoa_1.Tags)("Comments"),
    (0, tsoa_1.Security)("jwt")
], CommentController);
