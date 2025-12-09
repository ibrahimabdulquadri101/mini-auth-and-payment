import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('permissions', ctx.getHandler()) || [];
    const req = ctx.switchToHttp().getRequest<any>();
    const auth = req.auth;
    if (!auth) throw new UnauthorizedException('Missing authentication');

    // If it's a user JWT, allow (users can do everything per spec)
    if (auth.type === 'user') return true;

    // If service, must have apiKey and required permissions
    if (auth.type === 'service') {
      const perms = auth.apiKey?.permissions || [];
      for (const p of required) {
        if (!perms.includes(p)) throw new ForbiddenException(`Missing permission: ${p}`);
      }
      return true;
    }

    throw new ForbiddenException('Invalid auth type');
  }
}
