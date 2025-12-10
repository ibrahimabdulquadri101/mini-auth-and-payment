// import { Controller, Post, UseGuards, Req, Body, Get, Param } from '@nestjs/common';
// import { KeysService } from './keys.service';
// import { Permissions } from '../common/permissions.decorator';
// import { UserGuard } from '../common/guards';

// class CreateKeyDto {
//   name: string;
//   permissions: string[];
//   expiry: '1H'|'1D'|'1M'|'1Y';
// }

// class RolloverDto {
//   expired_key_id: string;
//   expiry: '1H'|'1D'|'1M'|'1Y';
// }

// @Controller('keys')
// export class KeysController {
//   constructor(private keys: KeysService) {}

//   @UseGuards(UserGuard())
//   @Post('create')
//   async create(@Body() body: CreateKeyDto, @Req() req: any) {
//     const user = req.auth.user;
//     const res = await this.keys.createKey(user, body.name, body.permissions, body.expiry);
//     console.log('BODY PERMISSIONS:', body.permissions);
//     return { statusCode: 201, ...res };
//   }

//   @UseGuards(UserGuard())
//   @Post('rollover')
//   async rollover(@Body() body: RolloverDto, @Req() req: any) {
//     const user = req.auth.user;
//     const res = await this.keys.rolloverKey(user, body.expired_key_id, body.expiry);
//     return { statusCode: 201, ...res };
//   }

//   @UseGuards(UserGuard())
//   @Get('list')
//   async list(@Req() req: any) {
//     return this.keys.listForUser(req.auth.user);
//   }

//   @UseGuards(UserGuard())
//   @Post('revoke/:id')
//   async revoke(@Param('id') id: string, @Req() req: any) {
//     return this.keys.revoke(id, req.auth.user);
//   }
// }


import { 
  Controller, 
  Post, 
  UseGuards, 
  Req, 
  Body, 
  Get, 
  Param 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { KeysService } from './keys.service';
import { UserGuard } from '../common/guards';
import { 
  CreateKeyDto, 
  CreateKeyResponseDto, 
  RolloverDto,
  ApiKeyListItemDto 
} from '../../dto/dto';

@ApiTags('API Keys')
@ApiBearerAuth('JWT-auth')
@Controller('keys')
export class KeysController {
  constructor(private keys: KeysService) {}

  @UseGuards(UserGuard())
  @Post('create')
  @ApiOperation({ 
    summary: 'Create a new API key',
    description: 'Creates a new API key with specified permissions. Maximum 5 active keys per user.'
  })
  @ApiBody({ type: CreateKeyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'API key created successfully',
    type: CreateKeyResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid permissions or request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  @ApiResponse({ status: 409, description: 'Maximum of 5 active keys reached' })
  async create(@Body() body: CreateKeyDto, @Req() req: any) {
    const user = req.auth.user;
    const res = await this.keys.createKey(user, body.name, body.permissions, body.expiry);
    return { statusCode: 201, ...res };
  }

  @UseGuards(UserGuard())
  @Post('rollover')
  @ApiOperation({ 
    summary: 'Rollover an expired API key',
    description: 'Creates a new API key to replace an expired one with the same permissions'
  })
  @ApiBody({ type: RolloverDto })
  @ApiResponse({ 
    status: 201, 
    description: 'New API key created',
    type: CreateKeyResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Key not found, not expired, or not owned by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  @ApiResponse({ status: 409, description: 'Maximum active keys reached' })
  async rollover(@Body() body: RolloverDto, @Req() req: any) {
    const user = req.auth.user;
    const res = await this.keys.rolloverKey(user, body.expired_key_id, body.expiry);
    return { statusCode: 201, ...res };
  }

  @UseGuards(UserGuard())
  @Get('list')
  @ApiOperation({ 
    summary: 'List all API keys',
    description: 'Returns all API keys for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of API keys',
    type: [ApiKeyListItemDto] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  async list(@Req() req: any) {
    return this.keys.listForUser(req.auth.user);
  }

  @UseGuards(UserGuard())
  @Post('revoke/:id')
  @ApiOperation({ 
    summary: 'Revoke an API key',
    description: 'Permanently revokes an API key'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API key revoked',
    schema: { example: { success: true } }
  })
  @ApiResponse({ status: 400, description: 'Key not found or not owned by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  async revoke(@Param('id') id: string, @Req() req: any) {
    return this.keys.revoke(id, req.auth.user);
  }
}