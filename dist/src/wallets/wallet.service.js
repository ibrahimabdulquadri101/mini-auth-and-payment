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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_entity_1 = require("./wallet.entity");
const transaction_entity_1 = require("./transaction.entity");
const typeorm_2 = require("typeorm");
const id_utils_1 = require("../utils/id.utils");
const axios_1 = __importDefault(require("axios"));
let WalletService = WalletService_1 = class WalletService {
    walletRepo;
    txRepo;
    dataSource;
    logger = new common_1.Logger(WalletService_1.name);
    constructor(walletRepo, txRepo, dataSource) {
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.dataSource = dataSource;
    }
    async ensureWallet(user) {
        const repo = this.dataSource.getRepository(wallet_entity_1.Wallet);
        let wallet = await repo.findOne({ where: { owner: { id: user.id } } });
        if (!wallet) {
            wallet = repo.create({
                owner: user,
                balance: 0,
            });
            await repo.save(wallet);
        }
        return wallet;
    }
    async initDeposit(user, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        const wallet = await this.ensureWallet(user);
        const reference = (0, id_utils_1.generateReference)();
        const tx = this.txRepo.create({
            type: 'deposit',
            amount,
            status: 'pending',
            reference,
            wallet,
        });
        await this.txRepo.save(tx);
        const PAYSTACK = process.env.PAYSTACK_SECRET_KEY;
        const resp = await axios_1.default.post('https://api.paystack.co/transaction/initialize', {
            email: user.email,
            amount,
            reference,
        }, {
            headers: { Authorization: `Bearer ${PAYSTACK}` },
        });
        const authUrl = resp.data.data.authorization_url;
        const payRef = resp.data.data.reference;
        if (payRef && payRef !== reference) {
            tx.reference = payRef;
            await this.txRepo.save(tx);
        }
        return { reference: tx.reference, authorization_url: authUrl };
    }
    async handleWebhook(payload) {
        try {
            this.logger.log('========================================');
            this.logger.log('🔧 WEBHOOK HANDLER START');
            this.logger.log('========================================');
            this.logger.log('📌 Event type:', payload.event);
            if (payload.event !== 'charge.success') {
                this.logger.log(`⏭️ Ignoring event: ${payload.event}`);
                return { status: true };
            }
            const data = payload.data;
            const reference = data.reference;
            const status = data.status;
            const amount = data.amount;
            this.logger.log('📊 Transaction details:');
            this.logger.log(`  Reference: ${reference}`);
            this.logger.log(`  Status: ${status}`);
            this.logger.log(`  Amount: ${amount}`);
            if (!reference) {
                this.logger.error('❌ No reference in payload');
                return { status: false };
            }
            return await this.dataSource.transaction(async (manager) => {
                this.logger.log('🔍 Searching for transaction...');
                const tx = await manager
                    .getRepository(transaction_entity_1.Transaction)
                    .createQueryBuilder('tx')
                    .leftJoinAndSelect('tx.wallet', 'wallet')
                    .where('tx.reference = :reference', { reference })
                    .getOne();
                if (!tx) {
                    this.logger.warn(`⚠️ Transaction not found: ${reference}`);
                    return { status: true };
                }
                this.logger.log(`✅ Found transaction:`);
                this.logger.log(`  ID: ${tx.id}`);
                this.logger.log(`  Current status: ${tx.status}`);
                this.logger.log(`  Amount: ${tx.amount}`);
                this.logger.log(`  Wallet ID: ${tx.wallet?.id}`);
                if (tx.status === 'success') {
                    this.logger.log('⏭️ Transaction already processed');
                    return { status: true };
                }
                if (status === 'success' && tx.wallet) {
                    this.logger.log('💰 Processing successful payment...');
                    const wallet = await manager
                        .getRepository(wallet_entity_1.Wallet)
                        .createQueryBuilder('wallet')
                        .setLock('pessimistic_write')
                        .where('wallet.id = :id', { id: tx.wallet.id })
                        .getOne();
                    if (!wallet) {
                        this.logger.error('❌ Wallet not found');
                        throw new common_1.NotFoundException('Wallet not found');
                    }
                    const oldBalance = Number(wallet.balance);
                    const newBalance = oldBalance + Number(tx.amount);
                    this.logger.log('💳 Balance update:');
                    this.logger.log(`  Old: ${oldBalance}`);
                    this.logger.log(`  Add: ${tx.amount}`);
                    this.logger.log(`  New: ${newBalance}`);
                    wallet.balance = newBalance;
                    tx.status = 'success';
                    await manager.save(transaction_entity_1.Transaction, tx);
                    await manager.save(wallet_entity_1.Wallet, wallet);
                    this.logger.log('✅ Transaction successful!');
                    this.logger.log('========================================');
                    return { status: true };
                }
                else {
                    this.logger.log('❌ Payment failed, marking transaction as failed');
                    tx.status = 'failed';
                    await manager.save(transaction_entity_1.Transaction, tx);
                    this.logger.log('========================================');
                    return { status: true };
                }
            });
        }
        catch (error) {
            this.logger.error('========================================');
            this.logger.error('❌ WEBHOOK HANDLER ERROR:', error.message);
            this.logger.error('Stack:', error.stack);
            this.logger.error('========================================');
            throw error;
        }
    }
    async getDepositStatus(reference) {
        const tx = await this.txRepo.findOne({ where: { reference } });
        if (!tx)
            throw new common_1.NotFoundException('Not found');
        return { reference: tx.reference, status: tx.status, amount: tx.amount };
    }
    async getBalance(user) {
        const wallet = await this.ensureWallet(user);
        return { balance: Number(wallet.balance) };
    }
    async getTransactions(user, limit = 20, offset = 0) {
        const wallet = await this.ensureWallet(user);
        const txs = await this.txRepo.find({
            where: { wallet: { id: wallet.id } },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return txs.map((t) => ({
            type: t.type,
            amount: Number(t.amount),
            status: t.status,
            reference: t.reference,
            createdAt: t.createdAt,
        }));
    }
    async transfer(user, wallet_number, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        const senderWallet = await this.ensureWallet(user);
        return this.dataSource.transaction(async (manager) => {
            const s = await manager.getRepository(wallet_entity_1.Wallet).findOne({
                where: { id: senderWallet.id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!s)
                throw new common_1.NotFoundException('Sender wallet not found');
            if (Number(s.balance) < amount)
                throw new common_1.BadRequestException('Insufficient balance');
            const recipient = await manager.getRepository(wallet_entity_1.Wallet).findOne({
                where: { id: wallet_number },
                lock: { mode: 'pessimistic_write' },
            });
            if (!recipient)
                throw new common_1.NotFoundException('Recipient not found');
            if (recipient.id === s.id)
                throw new common_1.BadRequestException('Cannot transfer to the same wallet');
            s.balance = Number(s.balance) - amount;
            recipient.balance = Number(recipient.balance) + amount;
            const debitTx = manager
                .getRepository(transaction_entity_1.Transaction)
                .create({ type: 'transfer', amount, status: 'success', wallet: s });
            const creditTx = manager
                .getRepository(transaction_entity_1.Transaction)
                .create({
                type: 'transfer',
                amount,
                status: 'success',
                wallet: recipient,
            });
            await manager.save([s, recipient]);
            await manager.save([debitTx, creditTx]);
            return { status: 'success', message: 'Transfer completed' };
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletService);
//# sourceMappingURL=wallet.service.js.map