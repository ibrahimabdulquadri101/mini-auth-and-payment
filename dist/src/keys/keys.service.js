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
exports.KeysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_key_entity_1 = require("./api-key.entity");
const typeorm_2 = require("typeorm");
const id_utils_1 = require("../utils/id.utils");
const crypto_1 = require("crypto");
const expiry_util_1 = require("../utils/expiry.util");
const typeorm_3 = require("typeorm");
let KeysService = class KeysService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    hashKey(plain) {
        const salt = process.env.API_KEY_SALT || 'dev_salt';
        return (0, crypto_1.createHmac)('sha256', salt).update(plain).digest('hex');
    }
    async countActiveKeys(user) {
        const now = new Date();
        try {
            return await this.repo.count({
                where: {
                    owner: { id: user.id },
                    revoked: false,
                    expiresAt: (0, typeorm_3.MoreThan)(now),
                },
            });
        }
        catch {
            const keys = await this.repo.find({
                where: { owner: { id: user.id }, revoked: false },
            });
            return keys.filter(k => !k.expiresAt || k.expiresAt > now).length;
        }
    }
    async createKey(owner, name, permissions, expiryToken) {
        if (!permissions || permissions.length === 0) {
            throw new common_1.BadRequestException('Permissions required');
        }
        const activeCount = await this.countActiveKeys(owner);
        if (activeCount >= 5) {
            throw new common_1.ConflictException('Maximum of 5 active keys allowed');
        }
        const plain = (0, id_utils_1.generateApiKey)();
        const hashed = this.hashKey(plain);
        const expiresAt = (0, expiry_util_1.computeExpiry)(expiryToken);
        const apiKey = this.repo.create({
            name,
            hashedKey: hashed,
            permissions,
            expiresAt,
            owner,
        });
        await this.repo.save(apiKey);
        return {
            id: apiKey.id,
            api_key: plain,
            expires_at: apiKey.expiresAt.toISOString(),
        };
    }
    async rolloverKey(user, expiredKeyId, expiryToken) {
        const key = await this.repo.findOne({
            where: { id: expiredKeyId },
            relations: ['owner'],
        });
        if (!key)
            throw new common_1.BadRequestException('Key not found');
        if (key.owner.id !== user.id)
            throw new common_1.BadRequestException('Not owner');
        const now = new Date();
        if (!key.expiresAt || key.expiresAt > now) {
            throw new common_1.BadRequestException('Key is not expired');
        }
        const activeCount = await this.countActiveKeys(user);
        if (activeCount >= 5) {
            throw new common_1.ConflictException('Maximum active keys reached');
        }
        return this.createKey(user, key.name, key.permissions, expiryToken);
    }
    async findByHashed(hashed) {
        return this.repo.findOne({
            where: { hashedKey: hashed },
            relations: ['owner'],
        });
    }
    async revoke(id, owner) {
        const key = await this.repo.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!key)
            throw new common_1.BadRequestException('Key not found');
        if (key.owner.id !== owner.id)
            throw new common_1.BadRequestException('Not your key');
        key.revoked = true;
        await this.repo.save(key);
        return { success: true };
    }
    async listForUser(owner) {
        return this.repo.find({
            where: { owner: { id: owner.id } },
            relations: ['owner'],
        });
    }
};
exports.KeysService = KeysService;
exports.KeysService = KeysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KeysService);
//# sourceMappingURL=keys.service.js.map