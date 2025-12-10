export declare class UserResponseDto {
    id: string;
    email: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: UserResponseDto;
}
export declare class CreateKeyDto {
    name: string;
    permissions: string[];
    expiry: '1H' | '1D' | '1M' | '1Y';
}
export declare class CreateKeyResponseDto {
    statusCode: number;
    id: string;
    api_key: string;
    expires_at: string;
}
export declare class RolloverDto {
    expired_key_id: string;
    expiry: '1H' | '1D' | '1M' | '1Y';
}
export declare class ApiKeyListItemDto {
    id: string;
    name: string;
    permissions: string[];
    expiresAt: string;
    revoked: boolean;
    createdAt: string;
}
export declare class DepositDto {
    amount: number;
}
export declare class DepositResponseDto {
    statusCode: number;
    reference: string;
    authorization_url: string;
}
export declare class TransferDto {
    wallet_number: string;
    amount: number;
}
export declare class TransferResponseDto {
    status: string;
    message: string;
}
export declare class BalanceResponseDto {
    balance: number;
}
export declare class DepositStatusDto {
    reference: string;
    status: string;
    amount: number;
}
export declare class TransactionDto {
    type: string;
    amount: number;
    status: string;
    reference: string;
    createdAt: string;
}
