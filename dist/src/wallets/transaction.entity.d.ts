import { Wallet } from './wallet.entity';
export declare class Transaction {
    id: string;
    type: 'deposit' | 'transfer' | 'fee';
    amount: number;
    status: 'pending' | 'success' | 'failed';
    reference?: string;
    wallet: Wallet;
    meta?: any;
    createdAt: Date;
}
