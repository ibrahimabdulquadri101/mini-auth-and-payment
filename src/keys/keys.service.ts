import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from './api-key.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { generateApiKey } from '../utils/id.utils';
import { createHmac } from 'crypto';
import { computeExpiry } from '../utils/expiry.util';
import { MoreThan } from 'typeorm';

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(ApiKey) private repo: Repository<ApiKey>,
  ) {}

  // Hash API Key
  hashKey(plain: string): string {
    const salt = process.env.API_KEY_SALT || 'dev_salt';
    return createHmac('sha256', salt).update(plain).digest('hex');
  }

  // Count active keys (strict TS safe)
  async countActiveKeys(user: User): Promise<number> {
    const now = new Date();

    try {
      // Prefer TypeORM filtering by date
      return await this.repo.count({
        where: {
          owner: { id: user.id },
          revoked: false,
          expiresAt: MoreThan(now),
        },
      });
    } catch {
      // Fallback when DB doesn't support timestamp compare (SQLite)
      const keys = await this.repo.find({
        where: { owner: { id: user.id }, revoked: false },
      });

      return keys.filter(k => !k.expiresAt || k.expiresAt > now).length;
    }
  }

  // Create API Key
  async createKey(
    owner: User,
    name: string,
    permissions: string[],
    expiryToken: '1H' | '1D' | '1M' | '1Y',
  ) {
    if (!permissions || permissions.length === 0) {
      throw new BadRequestException('Permissions required');
    }

    const activeCount = await this.countActiveKeys(owner);
    if (activeCount >= 5) {
      throw new ConflictException('Maximum of 5 active keys allowed');
    }

    const plain = generateApiKey();
    const hashed = this.hashKey(plain);
    const expiresAt = computeExpiry(expiryToken);

    const apiKey = this.repo.create({
      name,
      hashedKey: hashed,
      permissions,
      expiresAt,
      owner,
    });

    await this.repo.save(apiKey);

    return {
      id: apiKey.id,
      api_key: plain,
      expires_at: apiKey.expiresAt!.toISOString(),
    };
  }

  // Rollover old expired key into a new one
  async rolloverKey(
    user: User,
    expiredKeyId: string,
    expiryToken: '1H' | '1D' | '1M' | '1Y',
  ) {
    const key = await this.repo.findOne({
      where: { id: expiredKeyId },
      relations: ['owner'],
    });

    if (!key) throw new BadRequestException('Key not found');
    if (key.owner.id !== user.id) throw new BadRequestException('Not owner');

    const now = new Date();

    // FIX for "possibly null"
    if (!key.expiresAt || key.expiresAt > now) {
      throw new BadRequestException('Key is not expired');
    }

    const activeCount = await this.countActiveKeys(user);
    if (activeCount >= 5) {
      throw new ConflictException('Maximum active keys reached');
    }

    return this.createKey(user, key.name, key.permissions, expiryToken);
  }

  // Find by hashed key
  async findByHashed(hashed: string) {
    return this.repo.findOne({
      where: { hashedKey: hashed },
      relations: ['owner'],
    });
  }

  // Revoke key
  async revoke(id: string, owner: User) {
    const key = await this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!key) throw new BadRequestException('Key not found');
    if (key.owner.id !== owner.id) throw new BadRequestException('Not your key');

    key.revoked = true;
    await this.repo.save(key);

    return { success: true };
  }

  // List all user keys
  async listForUser(owner: User) {
    return this.repo.find({
      where: { owner: { id: owner.id } },
      relations: ['owner'],
    });
  }
}
