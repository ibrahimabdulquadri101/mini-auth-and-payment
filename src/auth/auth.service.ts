import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateOrCreateGoogleUser(email: string, displayName: string, googleId: string) {
    const user = await this.users.createIfNotExists(email, displayName, googleId);
    return user;
  }

  async login(user) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    return { accessToken: token, user: { id: user.id, email: user.email } };
  }
}
