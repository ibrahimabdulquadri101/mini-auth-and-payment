import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // redirect to Google
  @Get('google')
  @UseGuards(NestAuthGuard('google'))
  async googleAuth() {
    // handled by passport
  }

  @Get('google/callback')
  @UseGuards(NestAuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    const user = req.user;
    // passport put created/fetched user on req.user
    const token = await this.authService.login(user);
    console.log(token)
    // return JSON with token
    return token;
  }
}
