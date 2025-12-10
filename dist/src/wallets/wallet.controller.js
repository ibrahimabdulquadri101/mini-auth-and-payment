"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const permission_guard_1 = require("../common/permission.guard");
const permissions_decorator_1 = require("../common/permissions.decorator");
const dto_1 = require("../../dto/dto");
const crypto = __importStar(require("crypto"));
let WalletController = WalletController_1 = class WalletController {
    ws;
    logger = new common_1.Logger(WalletController_1.name);
    constructor(ws) {
        this.ws = ws;
    }
    async deposit(body, req) {
        this.logger.log('Deposit request received:', JSON.stringify(body));
        this.logger.log('Amount type:', typeof body.amount);
        this.logger.log('Amount value:', body.amount);
        const auth = req.auth;
        if (!auth)
            throw new Error('Unauthorized');
        const user = auth.type === 'user' ? auth.user : auth.owner;
        const res = await this.ws.initDeposit(user, body.amount);
        return { statusCode: 201, ...res };
    }
    async webhook(req, signature) {
        try {
            this.logger.log('========================================');
            this.logger.log('🔔 WEBHOOK RECEIVED');
            this.logger.log('========================================');
            let raw = req.body;
            let payload;
            if (Buffer.isBuffer(raw)) {
                this.logger.log('✅ Raw buffer received, length:', raw.length);
                const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
                if (!secret) {
                    this.logger.error('❌ PAYSTACK_WEBHOOK_SECRET not configured');
                    return { status: false };
                }
                const computed = crypto
                    .createHmac('sha512', secret)
                    .update(raw)
                    .digest('hex');
                this.logger.log('🔐 Signature verification:');
                this.logger.log('  Computed:', computed);
                this.logger.log('  Received:', signature);
                if (computed !== signature) {
                    this.logger.error('❌ Signature mismatch!');
                    return { status: false };
                }
                this.logger.log('✅ Signature verified!');
                payload = JSON.parse(raw.toString());
            }
            else if (typeof raw === 'object') {
                this.logger.warn('⚠️ Body already parsed as JSON - signature verification skipped');
                payload = raw;
            }
            else {
                this.logger.error('❌ Invalid body type:', typeof raw);
                return { status: false };
            }
            this.logger.log('📦 Webhook payload:');
            this.logger.log(JSON.stringify(payload, null, 2));
            const result = await this.ws.handleWebhook(payload);
            this.logger.log('✅ Webhook processed:', result);
            this.logger.log('========================================');
            return result;
        }
        catch (error) {
            this.logger.error('========================================');
            this.logger.error('❌ WEBHOOK ERROR:', error.message);
            this.logger.error('Stack:', error.stack);
            this.logger.error('========================================');
            return { status: false, error: error.message };
        }
    }
    async depositStatus(reference) {
        return this.ws.getDepositStatus(reference);
    }
    async balance(req) {
        const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
        return this.ws.getBalance(user);
    }
    async transfer(body, req) {
        const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
        return this.ws.transfer(user, body.wallet_number, body.amount);
    }
    async transactions(req) {
        const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
        return this.ws.getTransactions(user);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('deposit'),
    (0, common_1.Post)('deposit'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialize a deposit',
        description: 'Creates a pending deposit transaction and returns Paystack payment URL',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Deposit initialized successfully',
        type: dto_1.DepositResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid amount' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DepositDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deposit", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('paystack/webhook'),
    (0, swagger_1.ApiOperation)({
        summary: 'Paystack webhook endpoint',
        description: 'Receives payment notifications from Paystack',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "webhook", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('read'),
    (0, common_1.Get)('deposit/:reference/status'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check deposit status',
        description: 'Get the status of a deposit by reference',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Deposit status retrieved',
        type: dto_1.DepositStatusDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deposit not found' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "depositStatus", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('read'),
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet balance',
        description: 'Returns the current wallet balance in kobo/cents',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Balance retrieved successfully',
        type: dto_1.BalanceResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "balance", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('transfer'),
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer funds',
        description: 'Transfer money from your wallet to another wallet',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer completed successfully',
        type: dto_1.TransferResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid amount or insufficient balance' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Recipient wallet not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TransferDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('read'),
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction history',
        description: 'Returns a list of all transactions for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transactions retrieved successfully',
        type: [dto_1.TransactionDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transactions", null);
exports.WalletController = WalletController = WalletController_1 = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map