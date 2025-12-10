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
exports.TransactionDto = exports.DepositStatusDto = exports.BalanceResponseDto = exports.TransferResponseDto = exports.TransferDto = exports.DepositResponseDto = exports.DepositDto = exports.ApiKeyListItemDto = exports.RolloverDto = exports.CreateKeyResponseDto = exports.CreateKeyDto = exports.AuthResponseDto = exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserResponseDto {
    id;
    email;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
class AuthResponseDto {
    accessToken;
    user;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserResponseDto }),
    __metadata("design:type", UserResponseDto)
], AuthResponseDto.prototype, "user", void 0);
class CreateKeyDto {
    name;
    permissions;
    expiry;
}
exports.CreateKeyDto = CreateKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Production API Key',
        description: 'A descriptive name for the API key',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['read', 'deposit', 'transfer'],
        description: 'Array of permissions: read, deposit, transfer',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateKeyDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1Y',
        enum: ['1H', '1D', '1M', '1Y'],
        description: 'Expiry duration: 1H (hour), 1D (day), 1M (month), 1Y (year)',
    }),
    (0, class_validator_1.IsEnum)(['1H', '1D', '1M', '1Y']),
    __metadata("design:type", String)
], CreateKeyDto.prototype, "expiry", void 0);
class CreateKeyResponseDto {
    statusCode;
    id;
    api_key;
    expires_at;
}
exports.CreateKeyResponseDto = CreateKeyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 201 }),
    __metadata("design:type", Number)
], CreateKeyResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], CreateKeyResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        description: 'The API key - store this securely, it will not be shown again',
    }),
    __metadata("design:type", String)
], CreateKeyResponseDto.prototype, "api_key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T12:00:00.000Z' }),
    __metadata("design:type", String)
], CreateKeyResponseDto.prototype, "expires_at", void 0);
class RolloverDto {
    expired_key_id;
    expiry;
}
exports.RolloverDto = RolloverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID of the expired API key to rollover',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RolloverDto.prototype, "expired_key_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1Y',
        enum: ['1H', '1D', '1M', '1Y'],
    }),
    (0, class_validator_1.IsEnum)(['1H', '1D', '1M', '1Y']),
    __metadata("design:type", String)
], RolloverDto.prototype, "expiry", void 0);
class ApiKeyListItemDto {
    id;
    name;
    permissions;
    expiresAt;
    revoked;
    createdAt;
}
exports.ApiKeyListItemDto = ApiKeyListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], ApiKeyListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Production API Key' }),
    __metadata("design:type", String)
], ApiKeyListItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['read', 'deposit', 'transfer'] }),
    __metadata("design:type", Array)
], ApiKeyListItemDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T12:00:00.000Z' }),
    __metadata("design:type", String)
], ApiKeyListItemDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ApiKeyListItemDto.prototype, "revoked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-10T12:00:00.000Z' }),
    __metadata("design:type", String)
], ApiKeyListItemDto.prototype, "createdAt", void 0);
class DepositDto {
    amount;
}
exports.DepositDto = DepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50000,
        description: 'Amount in kobo/cents (50000 = ₦500 or $500)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100, { message: 'Amount must be at least 100 kobo (₦1)' }),
    __metadata("design:type", Number)
], DepositDto.prototype, "amount", void 0);
class DepositResponseDto {
    statusCode;
    reference;
    authorization_url;
}
exports.DepositResponseDto = DepositResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 201 }),
    __metadata("design:type", Number)
], DepositResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], DepositResponseDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://checkout.paystack.com/abc123' }),
    __metadata("design:type", String)
], DepositResponseDto.prototype, "authorization_url", void 0);
class TransferDto {
    wallet_number;
    amount;
}
exports.TransferDto = TransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Recipient wallet ID',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferDto.prototype, "wallet_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10000,
        description: 'Amount in kobo/cents (10000 = ₦100 or $100)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100, { message: 'Amount must be at least 100 kobo (₦1)' }),
    __metadata("design:type", Number)
], TransferDto.prototype, "amount", void 0);
class TransferResponseDto {
    status;
    message;
}
exports.TransferResponseDto = TransferResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'success' }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Transfer completed' }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "message", void 0);
class BalanceResponseDto {
    balance;
}
exports.BalanceResponseDto = BalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150000, description: 'Balance in kobo/cents' }),
    __metadata("design:type", Number)
], BalanceResponseDto.prototype, "balance", void 0);
class DepositStatusDto {
    reference;
    status;
    amount;
}
exports.DepositStatusDto = DepositStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], DepositStatusDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'success', enum: ['pending', 'success', 'failed'] }),
    __metadata("design:type", String)
], DepositStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    __metadata("design:type", Number)
], DepositStatusDto.prototype, "amount", void 0);
class TransactionDto {
    type;
    amount;
    status;
    reference;
    createdAt;
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'deposit', enum: ['deposit', 'transfer', 'fee'] }),
    __metadata("design:type", String)
], TransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'success', enum: ['pending', 'success', 'failed'] }),
    __metadata("design:type", String)
], TransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], TransactionDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-10T12:00:00.000Z' }),
    __metadata("design:type", String)
], TransactionDto.prototype, "createdAt", void 0);
//# sourceMappingURL=dto.js.map