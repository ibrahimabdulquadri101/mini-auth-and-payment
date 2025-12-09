import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  displayName: string;

  // You may store googleId if desired
  @Column({ nullable: true })
  googleId: string;

  @OneToOne(() => Wallet, w => w.owner, { cascade: true })
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;
}
