import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private users;
    private jwt;
    constructor(users: UsersService, jwt: JwtService);
    validateOrCreateGoogleUser(email: string, displayName: string, googleId: string): Promise<import("../users/user.entity").User>;
    login(user: any): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
        };
    }>;
}
