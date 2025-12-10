import { User } from '../users/user.entity';
export declare class ApiKey {
    id: string;
    name: string;
    hashedKey: string;
    permissions: string[];
    expiresAt: Date | null;
    revoked: boolean;
    owner: User;
    createdAt: Date;
}
