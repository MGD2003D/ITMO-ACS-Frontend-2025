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
exports.FollowController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const follow_dto_1 = require("../dtos/follow.dto");
let FollowController = class FollowController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.foRepo = data_source_1.AppDataSource.getRepository(models_1.Follow);
    }
    createFollow(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = this.foRepo.create(requestBody);
            yield this.foRepo.save(follow);
            this.setStatus(201);
            return follow;
        });
    }
    deleteFollow(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.foRepo.delete({
                followerId,
                followingId,
            });
            if (result.affected === 0) {
                this.setStatus(404);
                throw new Error("Follow relationship not found");
            }
            return { success: true };
        });
    }
};
exports.FollowController = FollowController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [follow_dto_1.FollowCreateDto]),
    __metadata("design:returntype", Promise)
], FollowController.prototype, "createFollow", null);
__decorate([
    (0, tsoa_1.Delete)(),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FollowController.prototype, "deleteFollow", null);
exports.FollowController = FollowController = __decorate([
    (0, tsoa_1.Route)("follows"),
    (0, tsoa_1.Tags)("Follows"),
    (0, tsoa_1.Security)("jwt")
], FollowController);
