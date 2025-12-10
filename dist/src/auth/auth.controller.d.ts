import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: any): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
        };
    }>;
}
