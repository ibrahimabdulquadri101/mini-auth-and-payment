import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
export declare class AuthMiddleware implements NestMiddleware {
    private jwt;
    private dataSource;
    constructor(jwt: JwtService, dataSource: DataSource);
    use(req: Request & {
        auth?: any;
    }, res: Response, next: NextFunction): Promise<void>;
}
