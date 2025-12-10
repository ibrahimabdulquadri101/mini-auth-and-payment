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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const api_key_entity_1 = require("../keys/api-key.entity");
const user_entity_1 = require("../users/user.entity");
let AuthMiddleware = class AuthMiddleware {
    jwt;
    dataSource;
    constructor(jwt, dataSource) {
        this.jwt = jwt;
        this.dataSource = dataSource;
    }
    async use(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                const token = authHeader.slice('Bearer '.length);
                try {
                    const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
                    const userRepo = this.dataSource.getRepository(user_entity_1.User);
                    const user = await userRepo.findOne({ where: { id: payload.sub }, relations: ['wallet'] });
                    if (user) {
                        req.auth = { type: 'user', user, payload };
                    }
                    else {
                        req.auth = null;
                    }
                }
                catch {
                    req.auth = null;
                }
            }
            let apiKeyPlain = null;
            if (req.headers['x-api-key']) {
                apiKeyPlain = String(req.headers['x-api-key']);
            }
            else if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('ApiKey ')) {
                apiKeyPlain = authHeader.slice('ApiKey '.length);
            }
            if (apiKeyPlain) {
                const salt = process.env.API_KEY_SALT || 'dev_salt';
                const hashed = (0, crypto_1.createHmac)('sha256', salt).update(apiKeyPlain).digest('hex');
                const keyRepo = this.dataSource.getRepository(api_key_entity_1.ApiKey);
                const apiKey = await keyRepo.findOne({ where: { hashedKey: hashed }, relations: ['owner'] });
                if (apiKey && !apiKey.revoked) {
                    if (!apiKey.expiresAt || new Date(apiKey.expiresAt) > new Date()) {
                        req.auth = { type: 'service', apiKey, owner: apiKey.owner };
                    }
                    else {
                        req.auth = null;
                    }
                }
            }
        }
        catch (err) {
            req.auth = null;
        }
        finally {
            next();
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, typeorm_1.DataSource])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map