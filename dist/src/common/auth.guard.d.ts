import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthGuard implements CanActivate {
    private allowed;
    constructor(allowed?: ('user' | 'service' | 'any')[]);
    canActivate(context: ExecutionContext): boolean;
}
