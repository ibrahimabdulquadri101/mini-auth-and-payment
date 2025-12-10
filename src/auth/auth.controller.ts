// import { Controller, Get, Req, UseGuards } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   // redirect to Google
//   @Get('google')
//   @UseGuards(NestAuthGuard('google'))
//   async googleAuth() {
//     // handled by passport
//   }

//   @Get('google/callback')
//   @UseGuards(NestAuthGuard('google'))
//   async googleAuthRedirect(@Req() req: any) {
//     const user = req.user;
//     // passport put created/fetched user on req.user
//     const token = await this.authService.login(user);
//     console.log(token)
//     // return JSON with token
//     return token;
//   }
// }

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthResponseDto } from '../../dto/dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(NestAuthGuard('google'))
  @ApiOperation({ 
    summary: 'Initiate Google OAuth login',
    description: 'Redirects to Google OAuth consent screen'
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google' })
  async googleAuth() {
    // handled by passport
  }

  @Get('google/callback')
  @UseGuards(NestAuthGuard('google'))
  @ApiOperation({ 
    summary: 'Google OAuth callback',
    description: 'Handles the callback from Google and returns JWT token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully authenticated',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async googleAuthRedirect(@Req() req: any) {
    const user = req.user;
    const token = await this.authService.login(user);
    console.log(token);
    return token;
  }
}
