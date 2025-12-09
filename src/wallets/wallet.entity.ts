import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number; // stored in smallest unit (kobo/cents)

  @OneToOne(() => User, u => u.wallet)
  @JoinColumn()
  owner: User;

  @OneToMany(() => Transaction, t => t.wallet)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
