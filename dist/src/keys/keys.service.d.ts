import { ApiKey } from './api-key.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class KeysService {
    private repo;
    constructor(repo: Repository<ApiKey>);
    hashKey(plain: string): string;
    countActiveKeys(user: User): Promise<number>;
    createKey(owner: User, name: string, permissions: string[], expiryToken: '1H' | '1D' | '1M' | '1Y'): Promise<{
        id: string;
        api_key: string;
        expires_at: string;
    }>;
    rolloverKey(user: User, expiredKeyId: string, expiryToken: '1H' | '1D' | '1M' | '1Y'): Promise<{
        id: string;
        api_key: string;
        expires_at: string;
    }>;
    findByHashed(hashed: string): Promise<ApiKey | null>;
    revoke(id: string, owner: User): Promise<{
        success: boolean;
    }>;
    listForUser(owner: User): Promise<ApiKey[]>;
}
