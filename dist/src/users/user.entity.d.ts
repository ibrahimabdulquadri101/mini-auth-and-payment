import { Wallet } from '../wallets/wallet.entity';
export declare class User {
    id: string;
    email: string;
    displayName: string;
    googleId: string;
    wallet: Wallet;
    createdAt: Date;
}
