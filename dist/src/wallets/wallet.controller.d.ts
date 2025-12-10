import { WalletService } from './wallet.service';
import { DepositDto, TransferDto } from '../../dto/dto';
export declare class WalletController {
    private ws;
    private readonly logger;
    constructor(ws: WalletService);
    deposit(body: DepositDto, req: any): Promise<{
        reference: string | undefined;
        authorization_url: any;
        statusCode: number;
    }>;
    webhook(req: any, signature: string): Promise<{
        status: boolean;
        error?: undefined;
    } | {
        status: boolean;
        error: any;
    }>;
    depositStatus(reference: string): Promise<{
        reference: string | undefined;
        status: "success" | "pending" | "failed";
        amount: number;
    }>;
    balance(req: any): Promise<{
        balance: number;
    }>;
    transfer(body: TransferDto, req: any): Promise<{
        status: string;
        message: string;
    }>;
    transactions(req: any): Promise<{
        type: "deposit" | "transfer" | "fee";
        amount: number;
        status: "success" | "pending" | "failed";
        reference: string | undefined;
        createdAt: Date;
    }[]>;
}
