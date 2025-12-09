import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Wallet } from '../wallets/wallet.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, relations: ['wallet'] });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['wallet'] });
  }

  async createIfNotExists(email: string, displayName?: string, googleId?: string) {
    let user = await this.findByEmail(email);
    if (!user) {
      user = this.repo.create({ email, displayName, googleId });
      // wallet created lazily in wallet service or via cascade
      await this.repo.save(user);
    }
    return user;
  }
}
