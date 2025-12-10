import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}


export class CreateKeyDto {
  @ApiProperty({
    example: 'Production API Key',
    description: 'A descriptive name for the API key',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ['read', 'deposit', 'transfer'],
    description: 'Array of permissions: read, deposit, transfer',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  permissions: string[];

  @ApiProperty({
    example: '1Y',
    enum: ['1H', '1D', '1M', '1Y'],
    description: 'Expiry duration: 1H (hour), 1D (day), 1M (month), 1Y (year)',
  })
  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: '1H' | '1D' | '1M' | '1Y';
}

export class CreateKeyResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    description: 'The API key - store this securely, it will not be shown again',
  })
  api_key: string;

  @ApiProperty({ example: '2025-12-10T12:00:00.000Z' })
  expires_at: string;
}

export class RolloverDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the expired API key to rollover',
  })
  @IsString()
  @IsNotEmpty()
  expired_key_id: string;

  @ApiProperty({
    example: '1Y',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsEnum(['1H', '1D', '1M', '1Y'])
  expiry: '1H' | '1D' | '1M' | '1Y';
}

export class ApiKeyListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Production API Key' })
  name: string;

  @ApiProperty({ example: ['read', 'deposit', 'transfer'] })
  permissions: string[];

  @ApiProperty({ example: '2025-12-10T12:00:00.000Z' })
  expiresAt: string;

  @ApiProperty({ example: false })
  revoked: boolean;

  @ApiProperty({ example: '2024-12-10T12:00:00.000Z' })
  createdAt: string;
}

// src/wallets/dto/deposit.dto.ts
export class DepositDto {
  @ApiProperty({
    example: 50000,
    description: 'Amount in kobo/cents (50000 = ₦500 or $500)',
  })
  @IsNumber()
  @Min(100, { message: 'Amount must be at least 100 kobo (₦1)' })
  amount: number;
}

export class DepositResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' })
  reference: string;

  @ApiProperty({ example: 'https://checkout.paystack.com/abc123' })
  authorization_url: string;
}

// src/wallets/dto/transfer.dto.ts
export class TransferDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Recipient wallet ID',
  })
  @IsString()
  @IsNotEmpty()
  wallet_number: string;

  @ApiProperty({
    example: 10000,
    description: 'Amount in kobo/cents (10000 = ₦100 or $100)',
  })
  @IsNumber()
  @Min(100, { message: 'Amount must be at least 100 kobo (₦1)' })
  amount: number;
}

export class TransferResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Transfer completed' })
  message: string;
}

// src/wallets/dto/balance.dto.ts
export class BalanceResponseDto {
  @ApiProperty({ example: 150000, description: 'Balance in kobo/cents' })
  balance: number;
}

// src/wallets/dto/deposit-status.dto.ts
export class DepositStatusDto {
  @ApiProperty({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' })
  reference: string;

  @ApiProperty({ example: 'success', enum: ['pending', 'success', 'failed'] })
  status: string;

  @ApiProperty({ example: 50000 })
  amount: number;
}

// src/wallets/dto/transaction.dto.ts
export class TransactionDto {
  @ApiProperty({ example: 'deposit', enum: ['deposit', 'transfer', 'fee'] })
  type: string;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: 'success', enum: ['pending', 'success', 'failed'] })
  status: string;

  @ApiProperty({ example: 'ref_123e4567-e89b-12d3-a456-426614174000' })
  reference: string;

  @ApiProperty({ example: '2024-12-10T12:00:00.000Z' })
  createdAt: string;
}