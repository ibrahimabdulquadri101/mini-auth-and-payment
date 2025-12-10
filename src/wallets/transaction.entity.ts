import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'deposit' | 'transfer' | 'fee';

  @Column({ type: 'bigint' })
  amount: number; // smallest unit

  @Column()
  status: 'pending' | 'success' | 'failed';
 
  @Column({ nullable: true, unique: true })
  reference?: string;

  @ManyToOne(() => Wallet, w => w.transactions, { nullable: true })
  wallet: Wallet;

  @Column({ type: 'json', nullable: true })
  meta?: any;

  @CreateDateColumn()
  createdAt: Date;
}
