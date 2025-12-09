import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const email = profile.emails[0].value;
      const displayName = profile.displayName;
      const googleId = profile.id;

      // your method to create or fetch user
      const user = await this.authService.validateOrCreateGoogleUser(email, displayName, googleId);

      // MUST pass null as first argument
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
}
