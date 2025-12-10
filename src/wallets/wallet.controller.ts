import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PermissionGuard } from '../common/permission.guard';
import { Permissions } from '../common/permissions.decorator';
import { AnyAuthGuard } from '../common/guards';
import * as crypto from 'crypto';

class DepositDto {
  amount: number;
}
class TransferDto {
  wallet_number: string;
  amount: number;
}

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

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
  async webhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    try {
      // Log received webhook
      this.logger.log('Webhook received');

      // raw body exists in req.body as Buffer because express.raw used
      const raw = req.body; // Buffer

      if (!raw) {
        this.logger.error('No raw body in webhook request');
        return { status: false };
      }

      // Verify signature
      const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
      if (!secret) {
        this.logger.error('PAYSTACK_WEBHOOK_SECRET not configured');
        return { status: false };
      }

      const computed = crypto
        .createHmac('sha512', secret)
        .update(raw)
        .digest('hex');

      if (computed !== signature) {
        this.logger.error('Signature mismatch', {
          computed,
          received: signature,
        });
        return { status: false };
      }

      // Parse and process payload
      const payload = JSON.parse(raw.toString());
      this.logger.log('Webhook payload:', JSON.stringify(payload, null, 2));

      const result = await this.ws.handleWebhook(payload);
      this.logger.log('Webhook processed successfully', result);

      return result;
    } catch (error) {
      this.logger.error('Webhook error:', error);
      // Still return 200 to Paystack to avoid retries
      return { status: false, error: error.message };
    }
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
