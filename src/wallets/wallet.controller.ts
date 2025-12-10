// import {
//   Controller,
//   Post,
//   Body,
//   Req,
//   UseGuards,
//   Get,
//   Param,
//   Headers,
//   HttpCode,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
// import { WalletService } from './wallet.service';
// import { PermissionGuard } from '../common/permission.guard';
// import { Permissions } from '../common/permissions.decorator';
// import {
//   DepositDto,
//   DepositResponseDto,
//   TransferDto,
//   TransferResponseDto,
//   BalanceResponseDto,
//   DepositStatusDto,
//   TransactionDto,
// } from '../../dto/dto';
// import * as crypto from 'crypto';

// @ApiTags('Wallet')
// @Controller('wallet')
// export class WalletController {
//   private readonly logger = new Logger(WalletController.name);

//   constructor(private ws: WalletService) {}

//   @UseGuards(PermissionGuard)
//   @Permissions('deposit')
//   @Post('deposit')
//   @ApiBearerAuth('JWT-auth')
//   @ApiSecurity('api-key')
//   @ApiOperation({
//     summary: 'Initialize a deposit',
//     description: 'Creates a pending deposit transaction and returns Paystack payment URL',
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Deposit initialized successfully',
//     type: DepositResponseDto,
//   })
//   @ApiResponse({ status: 400, description: 'Invalid amount' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async deposit(@Body() body: DepositDto, @Req() req: any) {
//     this.logger.log('Deposit request received:', JSON.stringify(body));
//     this.logger.log('Amount type:', typeof body.amount);
//     this.logger.log('Amount value:', body.amount);
    
//     const auth = req.auth;
//     if (!auth) throw new Error('Unauthorized');
//     const user = auth.type === 'user' ? auth.user : auth.owner;
//     const res = await this.ws.initDeposit(user, body.amount);
//     return { statusCode: 201, ...res };
//   }

//   @HttpCode(200)
//   @Post('paystack/webhook')
//   @ApiOperation({
//     summary: 'Paystack webhook endpoint',
//     description: 'Receives payment notifications from Paystack',
//   })
//   @ApiResponse({ status: 200, description: 'Webhook processed' })
//   async webhook(
//     @Req() req: any,
//     @Headers('x-paystack-signature') signature: string,
//   ) {
//     try {
//       this.logger.log('========================================');
//       this.logger.log('🔔 WEBHOOK RECEIVED');
//       this.logger.log('========================================');

//       const raw = req.body;

//       if (!raw) {
//         this.logger.error('❌ No raw body in webhook request');
//         this.logger.error('req.body type:', typeof req.body);
//         this.logger.error('req.body:', req.body);
//         return { status: false };
//       }

//       this.logger.log('✅ Raw body received, length:', raw.length);

//       const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
//       if (!secret) {
//         this.logger.error('❌ PAYSTACK_WEBHOOK_SECRET not configured');
//         return { status: false };
//       }

//       this.logger.log('✅ Secret found');

//       const computed = crypto
//         .createHmac('sha512', secret)
//         .update(raw)
//         .digest('hex');

//       this.logger.log('🔐 Signature verification:');
//       this.logger.log('  Computed:', computed);
//       this.logger.log('  Received:', signature);

//       if (computed !== signature) {
//         this.logger.error('❌ Signature mismatch!');
//         this.logger.warn('⚠️ Processing anyway for debugging...');
//         // Don't return false yet, let's see the payload
//       } else {
//         this.logger.log('✅ Signature verified!');
//       }

//       const payload = JSON.parse(raw.toString());
//       this.logger.log('📦 Webhook payload:');
//       this.logger.log(JSON.stringify(payload, null, 2));

//       const result = await this.ws.handleWebhook(payload);
//       this.logger.log('✅ Webhook processed:', result);
//       this.logger.log('========================================');

//       return result;
//     } catch (error) {
//       this.logger.error('========================================');
//       this.logger.error('❌ WEBHOOK ERROR:', error.message);
//       this.logger.error('Stack:', error.stack);
//       this.logger.error('========================================');
//       return { status: false, error: error.message };
//     }
//   }

//   @UseGuards(PermissionGuard)
//   @Permissions('read')
//   @Get('deposit/:reference/status')
//   @ApiBearerAuth('JWT-auth')
//   @ApiSecurity('api-key')
//   @ApiOperation({
//     summary: 'Check deposit status',
//     description: 'Get the status of a deposit by reference',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Deposit status retrieved',
//     type: DepositStatusDto,
//   })
//   @ApiResponse({ status: 404, description: 'Deposit not found' })
//   async depositStatus(@Param('reference') reference: string) {
//     return this.ws.getDepositStatus(reference);
//   }

//   @UseGuards(PermissionGuard)
//   @Permissions('read')
//   @Get('balance')
//   @ApiBearerAuth('JWT-auth')
//   @ApiSecurity('api-key')
//   @ApiOperation({
//     summary: 'Get wallet balance',
//     description: 'Returns the current wallet balance in kobo/cents',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Balance retrieved successfully',
//     type: BalanceResponseDto,
//   })
//   async balance(@Req() req: any) {
//     const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
//     return this.ws.getBalance(user);
//   }

//   @UseGuards(PermissionGuard)
//   @Permissions('transfer')
//   @Post('transfer')
//   @ApiBearerAuth('JWT-auth')
//   @ApiSecurity('api-key')
//   @ApiOperation({
//     summary: 'Transfer funds',
//     description: 'Transfer money from your wallet to another wallet',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Transfer completed successfully',
//     type: TransferResponseDto,
//   })
//   @ApiResponse({ status: 400, description: 'Invalid amount or insufficient balance' })
//   @ApiResponse({ status: 404, description: 'Recipient wallet not found' })
//   async transfer(@Body() body: TransferDto, @Req() req: any) {
//     const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
//     return this.ws.transfer(user, body.wallet_number, body.amount);
//   }

//   @UseGuards(PermissionGuard)
//   @Permissions('read')
//   @Get('transactions')
//   @ApiBearerAuth('JWT-auth')
//   @ApiSecurity('api-key')
//   @ApiOperation({
//     summary: 'Get transaction history',
//     description: 'Returns a list of all transactions for the authenticated user',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Transactions retrieved successfully',
//     type: [TransactionDto],
//   })
//   async transactions(@Req() req: any) {
//     const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
//     return this.ws.getTransactions(user);
//   }
// }

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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { PermissionGuard } from '../common/permission.guard';
import { Permissions } from '../common/permissions.decorator';
import {
  DepositDto,
  DepositResponseDto,
  TransferDto,
  TransferResponseDto,
  BalanceResponseDto,
  DepositStatusDto,
  TransactionDto,
} from '../../dto/dto';
import * as crypto from 'crypto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private ws: WalletService) {}

  @UseGuards(PermissionGuard)
  @Permissions('deposit')
  @Post('deposit')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Initialize a deposit',
    description: 'Creates a pending deposit transaction and returns Paystack payment URL',
  })
  @ApiResponse({
    status: 201,
    description: 'Deposit initialized successfully',
    type: DepositResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deposit(@Body() body: DepositDto, @Req() req: any) {
    this.logger.log('Deposit request received:', JSON.stringify(body));
    this.logger.log('Amount type:', typeof body.amount);
    this.logger.log('Amount value:', body.amount);
    
    const auth = req.auth;
    if (!auth) throw new Error('Unauthorized');
    const user = auth.type === 'user' ? auth.user : auth.owner;
    const res = await this.ws.initDeposit(user, body.amount);
    return { statusCode: 201, ...res };
  }

  @HttpCode(200)
  @Post('paystack/webhook')
  @ApiOperation({
    summary: 'Paystack webhook endpoint',
    description: 'Receives payment notifications from Paystack',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async webhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    try {
      this.logger.log('========================================');
      this.logger.log('🔔 WEBHOOK RECEIVED');
      this.logger.log('========================================');

      let raw = req.body;
      let payload;

      // Handle both Buffer (raw) and Object (already parsed) formats
      if (Buffer.isBuffer(raw)) {
        this.logger.log('✅ Raw buffer received, length:', raw.length);
        
        const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
        if (!secret) {
          this.logger.error('❌ PAYSTACK_WEBHOOK_SECRET not configured');
          return { status: false };
        }

        const computed = crypto
          .createHmac('sha512', secret)
          .update(raw)
          .digest('hex');

        this.logger.log('🔐 Signature verification:');
        this.logger.log('  Computed:', computed);
        this.logger.log('  Received:', signature);

        if (computed !== signature) {
          this.logger.error('❌ Signature mismatch!');
          return { status: false };
        }

        this.logger.log('✅ Signature verified!');
        payload = JSON.parse(raw.toString());
      } else if (typeof raw === 'object') {
        // Body was already parsed as JSON (fallback)
        this.logger.warn('⚠️ Body already parsed as JSON - signature verification skipped');
        payload = raw;
      } else {
        this.logger.error('❌ Invalid body type:', typeof raw);
        return { status: false };
      }

      this.logger.log('📦 Webhook payload:');
      this.logger.log(JSON.stringify(payload, null, 2));

      const result = await this.ws.handleWebhook(payload);
      this.logger.log('✅ Webhook processed:', result);
      this.logger.log('========================================');

      return result;
    } catch (error) {
      this.logger.error('========================================');
      this.logger.error('❌ WEBHOOK ERROR:', error.message);
      this.logger.error('Stack:', error.stack);
      this.logger.error('========================================');
      return { status: false, error: error.message };
    }
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('deposit/:reference/status')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Check deposit status',
    description: 'Get the status of a deposit by reference',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit status retrieved',
    type: DepositStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  async depositStatus(@Param('reference') reference: string) {
    return this.ws.getDepositStatus(reference);
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('balance')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Get wallet balance',
    description: 'Returns the current wallet balance in kobo/cents',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
  })
  async balance(@Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.getBalance(user);
  }

  @UseGuards(PermissionGuard)
  @Permissions('transfer')
  @Post('transfer')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Transfer funds',
    description: 'Transfer money from your wallet to another wallet',
  })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
    type: TransferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid amount or insufficient balance' })
  @ApiResponse({ status: 404, description: 'Recipient wallet not found' })
  async transfer(@Body() body: TransferDto, @Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.transfer(user, body.wallet_number, body.amount);
  }

  @UseGuards(PermissionGuard)
  @Permissions('read')
  @Get('transactions')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Returns a list of all transactions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [TransactionDto],
  })
  async transactions(@Req() req: any) {
    const user = req.auth.type === 'user' ? req.auth.user : req.auth.owner;
    return this.ws.getTransactions(user);
  }
}