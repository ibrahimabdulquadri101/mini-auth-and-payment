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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const keys_service_1 = require("./keys.service");
const guards_1 = require("../common/guards");
const dto_1 = require("../../dto/dto");
let KeysController = class KeysController {
    keys;
    constructor(keys) {
        this.keys = keys;
    }
    async create(body, req) {
        const user = req.auth.user;
        const res = await this.keys.createKey(user, body.name, body.permissions, body.expiry);
        return { statusCode: 201, ...res };
    }
    async rollover(body, req) {
        const user = req.auth.user;
        const res = await this.keys.rolloverKey(user, body.expired_key_id, body.expiry);
        return { statusCode: 201, ...res };
    }
    async list(req) {
        return this.keys.listForUser(req.auth.user);
    }
    async revoke(id, req) {
        return this.keys.revoke(id, req.auth.user);
    }
};
exports.KeysController = KeysController;
__decorate([
    (0, common_1.UseGuards)((0, guards_1.UserGuard)()),
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new API key',
        description: 'Creates a new API key with specified permissions. Maximum 5 active keys per user.'
    }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateKeyDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'API key created successfully',
        type: dto_1.CreateKeyResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid permissions or request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Maximum of 5 active keys reached' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateKeyDto, Object]),
    __metadata("design:returntype", Promise)
], KeysController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, guards_1.UserGuard)()),
    (0, common_1.Post)('rollover'),
    (0, swagger_1.ApiOperation)({
        summary: 'Rollover an expired API key',
        description: 'Creates a new API key to replace an expired one with the same permissions'
    }),
    (0, swagger_1.ApiBody)({ type: dto_1.RolloverDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'New API key created',
        type: dto_1.CreateKeyResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Key not found, not expired, or not owned by user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Maximum active keys reached' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RolloverDto, Object]),
    __metadata("design:returntype", Promise)
], KeysController.prototype, "rollover", null);
__decorate([
    (0, common_1.UseGuards)((0, guards_1.UserGuard)()),
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all API keys',
        description: 'Returns all API keys for the authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of API keys',
        type: [dto_1.ApiKeyListItemDto]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT required' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeysController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)((0, guards_1.UserGuard)()),
    (0, common_1.Post)('revoke/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke an API key',
        description: 'Permanently revokes an API key'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API key revoked',
        schema: { example: { success: true } }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Key not found or not owned by user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KeysController.prototype, "revoke", null);
exports.KeysController = KeysController = __decorate([
    (0, swagger_1.ApiTags)('API Keys'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('keys'),
    __metadata("design:paramtypes", [keys_service_1.KeysService])
], KeysController);
//# sourceMappingURL=keys.controller.js.map