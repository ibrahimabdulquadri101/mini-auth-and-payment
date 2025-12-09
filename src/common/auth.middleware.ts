import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';
import { ApiKey } from '../keys/api-key.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService, private dataSource: DataSource) {}

  async use(req: Request & { auth?: any }, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];

      // Try Bearer token (our internal JWT)
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length);
        try {
          const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
          const userRepo = this.dataSource.getRepository(User);
          const user = await userRepo.findOne({ where: { id: payload.sub }, relations: ['wallet'] });
          if (user) {
            req.auth = { type: 'user', user, payload };
          } else {
            req.auth = null;
          }
        } catch {
          req.auth = null;
        }
        // fall-through (do not call next here; finally will)
      }

      // API Key support
      let apiKeyPlain: string | null = null;
      if (req.headers['x-api-key']) {
        apiKeyPlain = String(req.headers['x-api-key']);
      } else if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('ApiKey ')) {
        apiKeyPlain = authHeader.slice('ApiKey '.length);
      }

      if (apiKeyPlain) {
        const salt = process.env.API_KEY_SALT || 'dev_salt';
        const hashed = createHmac('sha256', salt).update(apiKeyPlain).digest('hex');
        const keyRepo = this.dataSource.getRepository(ApiKey);
        const apiKey = await keyRepo.findOne({ where: { hashedKey: hashed }, relations: ['owner'] });
        if (apiKey && !apiKey.revoked) {
          if (!apiKey.expiresAt || new Date(apiKey.expiresAt) > new Date()) {
            req.auth = { type: 'service', apiKey, owner: apiKey.owner };
          } else {
            req.auth = null; // expired
          }
        }
      }
    } catch (err) {
      req.auth = null;
    } finally {
      next();
    }
  }
}
