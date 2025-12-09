import { Controller, Post, UseGuards, Req, Body, Get, Param } from '@nestjs/common';
import { KeysService } from './keys.service';
import { Permissions } from '../common/permissions.decorator';
import { UserGuard } from '../common/guards';

class CreateKeyDto {
  name: string;
  permissions: string[];
  expiry: '1H'|'1D'|'1M'|'1Y';
}

class RolloverDto {
  expired_key_id: string;
  expiry: '1H'|'1D'|'1M'|'1Y';
}

@Controller('keys')
export class KeysController {
  constructor(private keys: KeysService) {}

  @UseGuards(UserGuard())
  @Post('create')
  async create(@Body() body: CreateKeyDto, @Req() req: any) {
    const user = req.auth.user;
    const res = await this.keys.createKey(user, body.name, body.permissions, body.expiry);
    console.log('BODY PERMISSIONS:', body.permissions);
    return { statusCode: 201, ...res };
  }

  @UseGuards(UserGuard())
  @Post('rollover')
  async rollover(@Body() body: RolloverDto, @Req() req: any) {
    const user = req.auth.user;
    const res = await this.keys.rolloverKey(user, body.expired_key_id, body.expiry);
    return { statusCode: 201, ...res };
  }

  @UseGuards(UserGuard())
  @Get('list')
  async list(@Req() req: any) {
    return this.keys.listForUser(req.auth.user);
  }

  @UseGuards(UserGuard())
  @Post('revoke/:id')
  async revoke(@Param('id') id: string, @Req() req: any) {
    return this.keys.revoke(id, req.auth.user);
  }
}
