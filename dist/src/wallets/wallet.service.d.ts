import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
export declare class WalletService {
    private walletRepo;
    private txRepo;
    private dataSource;
    private readonly logger;
    constructor(walletRepo: Repository<Wallet>, txRepo: Repository<Transaction>, dataSource: DataSource);
    ensureWallet(user: User): Promise<Wallet>;
    initDeposit(user: any, amount: number): Promise<{
        reference: string | undefined;
        authorization_url: any;
    }>;
    handleWebhook(payload: any): Promise<{
        status: boolean;
    }>;
    getDepositStatus(reference: string): Promise<{
        reference: string | undefined;
        status: "success" | "pending" | "failed";
        amount: number;
    }>;
    getBalance(user: any): Promise<{
        balance: number;
    }>;
    getTransactions(user: any, limit?: number, offset?: number): Promise<{
        type: "deposit" | "transfer" | "fee";
        amount: number;
        status: "success" | "pending" | "failed";
        reference: string | undefined;
        createdAt: Date;
    }[]>;
    transfer(user: any, wallet_number: string, amount: number): Promise<{
        status: string;
        message: string;
    }>;
}
