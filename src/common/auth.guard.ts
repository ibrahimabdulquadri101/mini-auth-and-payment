import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private allowed: ('user'|'service'|'any')[] = ['user']) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<any>();
    const auth = req.auth;
    if (!auth) {
      throw new ForbiddenException('Unauthorized');
    }

    if (this.allowed.includes('any')) return true;
    if (this.allowed.includes(auth.type)) return true;
    if (this.allowed.includes('user') && auth.type === 'user') return true;
    throw new ForbiddenException('Forbidden for this credential type');
  }
}