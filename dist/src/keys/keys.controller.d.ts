import { KeysService } from './keys.service';
import { CreateKeyDto, RolloverDto } from '../../dto/dto';
export declare class KeysController {
    private keys;
    constructor(keys: KeysService);
    create(body: CreateKeyDto, req: any): Promise<{
        id: string;
        api_key: string;
        expires_at: string;
        statusCode: number;
    }>;
    rollover(body: RolloverDto, req: any): Promise<{
        id: string;
        api_key: string;
        expires_at: string;
        statusCode: number;
    }>;
    list(req: any): Promise<import("./api-key.entity").ApiKey[]>;
    revoke(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
