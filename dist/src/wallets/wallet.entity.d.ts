import { User } from '../users/user.entity';
import { Transaction } from './transaction.entity';
export declare class Wallet {
    id: string;
    balance: number;
    owner: User;
    transactions: Transaction[];
    createdAt: Date;
}
