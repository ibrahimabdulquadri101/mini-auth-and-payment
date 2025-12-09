import { Controller, Post, Body, Req, UseGuards, Get, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PermissionGuard } from '../common/permission.guard';
import { Permissions } from '../common/permissions.decorator';
import { AnyAuthGuard } from '../common/guards';

class DepositDto { amount: number; }
class TransferDto { wallet_number: string; amount: number; }

@Controller('wallet')
export class WalletController {
  constructor(private ws: WalletService) {}

  // deposit init
  @UseGuards(PermissionGuard)
  @Permissions('deposit')
  @Post('deposit')
  async deposit(@Body() body: DepositDto, @Req() req: any) {
    const auth = req.auth;
    if (!auth) throw new Error('Unauthorized');
    const user = auth.type === 'user' ? auth.user : auth.owner;
    const res = await this.ws.initDeposit(user, body.amount);
    return { statusCode: 201, ...res };
  }

  // webhook - raw body handled in main.ts
  @HttpCode(200)
  @Post('paystack/webhook')
  async webhook(@Req() req: any, @Headers('x-paystack-signature') signature: string) {
    // raw body exists in req.body as Buffer because express.raw used
    const raw = req.body; // Buffer
    const computed = require('crypto').createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET).update(raw).digest('hex');
    if (computed !== signature) {
      return { status: false };
    }
    const payload = JSON.parse(raw.toString());
    const result = await this.ws.handleWebhook(payload);
    return result;
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('deposit/:reference/status')
  async depositStatus(@Param('reference') reference: string) {
    return this.ws.getDepositStatus(reference);
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('balance')
  async balance(@Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.getBalance(user);
  }

  @UseGuards(PermissionGuard)
  @Permissions('transfer')
  @Post('transfer')
  async transfer(@Body() body: TransferDto, @Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.transfer(user, body.wallet_number, body.amount);
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('transactions')
  async transactions(@Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.getTransactions(user);
  }
}
