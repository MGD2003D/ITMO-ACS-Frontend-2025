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
exports.UsersController = void 0;
const tsoa_1 = require("tsoa");
const data_source_1 = require("../data-source");
const models_1 = require("../models");
const user_dto_1 = require("../dtos/user.dto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class LoginDto {
}
let UsersController = class UsersController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.userRepo = data_source_1.AppDataSource.getRepository(models_1.User);
    }
    toUserResponseDto(user) {
        const { password } = user, rest = __rest(user, ["password"]);
        return rest;
    }
    createUser(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(requestBody.password, 10);
            const user = this.userRepo.create(Object.assign(Object.assign({}, requestBody), { password: hashedPassword }));
            const savedUser = yield this.userRepo.save(user);
            this.setStatus(201);
            return this.toUserResponseDto(savedUser);
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userRepo.find();
            return users.map(user => this.toUserResponseDto(user));
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findOneBy({ id: userId });
            if (!user) {
                this.setStatus(404);
                throw new Error("User not found");
            }
            return this.toUserResponseDto(user);
        });
    }
    updateUser(userId, requestBody, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToUpdate = yield this.userRepo.findOneBy({ id: userId });
            if (request.user.id !== userId) {
                this.setStatus(403);
                throw new Error("You are not authorized to update this profile");
            }
            if (!userToUpdate) {
                this.setStatus(404);
                throw new Error("User not found");
            }
            if (requestBody.password) {
                requestBody.password = yield bcryptjs_1.default.hash(requestBody.password, 10);
            }
            Object.assign(userToUpdate, requestBody);
            const updatedUser = yield this.userRepo.save(userToUpdate);
            return this.toUserResponseDto(updatedUser);
        });
    }
    deleteUser(userId, request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.user.id !== userId) {
                this.setStatus(403);
                throw new Error("You are not authorized to update this profile");
            }
            const result = yield this.userRepo.delete(userId);
            if (!result.affected) {
                this.setStatus(404);
                throw new Error("User not found");
            }
            return { success: true };
        });
    }
    loginUser(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.JWT_SECRET) {
                this.setStatus(500);
                throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file");
            }
            const { email, password } = requestBody;
            const user = yield this.userRepo.findOne({ where: { email } });
            if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
                this.setStatus(401);
                throw new Error("Invalid credentials");
            }
            const payload = { userId: user.id };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
            return { token };
        });
    }
    searchUser(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id && !email) {
                this.setStatus(400);
                throw new Error("id or email query param required");
            }
            let user = null;
            if (id) {
                user = yield this.userRepo.findOneBy({ id: Number(id) });
            }
            else if (email) {
                user = yield this.userRepo.findOneBy({ email });
            }
            if (!user) {
                this.setStatus(404);
                throw new Error("Not found");
            }
            return this.toUserResponseDto(user);
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)(),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserCreateDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.NoSecurity)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, tsoa_1.Get)("/{userId}"),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, tsoa_1.Put)("/{userId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.UserUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, tsoa_1.Delete)("/{userId}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, tsoa_1.Post)("/login"),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "loginUser", null);
__decorate([
    (0, tsoa_1.Get)("/search/by"),
    (0, tsoa_1.NoSecurity)(),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUser", null);
exports.UsersController = UsersController = __decorate([
    (0, tsoa_1.Route)("users"),
    (0, tsoa_1.Tags)("Users"),
    (0, tsoa_1.Security)("jwt")
], UsersController);
