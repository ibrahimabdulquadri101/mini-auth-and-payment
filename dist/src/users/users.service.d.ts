import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private repo;
    constructor(repo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createIfNotExists(email: string, displayName?: string, googleId?: string): Promise<User>;
}
