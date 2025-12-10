import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { Repository, DataSource } from 'typeorm';
import { generateReference } from '../utils/id.utils';
import axios from 'axios';
import { User } from 'src/users/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  // ensure wallet exists for user (call after user created)
  async ensureWallet(user: User) {
    const repo = this.dataSource.getRepository(Wallet);

    let wallet = await repo.findOne({ where: { owner: { id: user.id } } });

    if (!wallet) {
      wallet = repo.create({
        owner: user,
        balance: 0,
      });
      await repo.save(wallet);
    }

    return wallet;
  }

  // Deposit init (create pending tx & call Paystack)
  async initDeposit(user, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    const wallet = await this.ensureWallet(user);

    const reference = generateReference();
    const tx = this.txRepo.create({
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
      wallet,
    });
    await this.txRepo.save(tx);

    // call Paystack initialize
    const PAYSTACK = process.env.PAYSTACK_SECRET_KEY;
    const resp = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount, // Paystack expects kobo/cents
        reference,
      },
      {
        headers: { Authorization: `Bearer ${PAYSTACK}` },
      },
    );

    // store Paystack returned reference if different (make sure idempotent)
    const authUrl = resp.data.data.authorization_url;
    const payRef = resp.data.data.reference;
    if (payRef && payRef !== reference) {
      tx.reference = payRef;
      await this.txRepo.save(tx);
    }

    return { reference: tx.reference, authorization_url: authUrl };
  }

  // Webhook handler (rawBody already validated by controller)
  async handleWebhook(payload: any) {
    // payload.data.reference
    const data = payload.data;
    const reference = data.reference;
    const status = data.status; // 'success' etc
    const amount = data.amount;

    if (!reference) return { status: false };

    // Idempotent: perform in transaction
    return this.dataSource.transaction(async (manager) => {
      // Step 1: Find transaction with wallet relation (no lock yet)
      const tx = await manager.getRepository(Transaction).findOne({
        where: { reference },
        relations: ['wallet'],
      });
      
      if (!tx) return { status: true }; // ignore unknown
      if (tx.status === 'success') return { status: true }; // already processed

      if (status === 'success') {
        // Step 2: Lock the wallet using raw query or query builder
        const wallet = await manager.getRepository(Wallet)
          .createQueryBuilder('wallet')
          .setLock('pessimistic_write')
          .where('wallet.id = :id', { id: tx.wallet.id })
          .getOne();
        
        if (!wallet) throw new NotFoundException('Wallet not found');
        
        // Step 3: Update transaction status
        tx.status = 'success';
        await manager.save(tx);
        
        // Step 4: Update wallet balance
        wallet.balance = Number(wallet.balance) + Number(tx.amount);
        await manager.save(wallet);
        
        return { status: true };
      } else {
        tx.status = 'failed';
        await manager.save(tx);
        return { status: true };
      }
    });
  }

  async getDepositStatus(reference: string) {
    const tx = await this.txRepo.findOne({ where: { reference } });
    if (!tx) throw new NotFoundException('Not found');
    return { reference: tx.reference, status: tx.status, amount: tx.amount };
  }

  async getBalance(user) {
    const wallet = await this.ensureWallet(user);
    return { balance: Number(wallet.balance) };
  }

  async getTransactions(user, limit = 20, offset = 0) {
    const wallet = await this.ensureWallet(user);
    const txs = await this.txRepo.find({
      where: { wallet: { id: wallet.id } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return txs.map((t) => ({
      type: t.type,
      amount: Number(t.amount),
      status: t.status,
      reference: t.reference,
      createdAt: t.createdAt,
    }));
  }

  // Transfer: atomic, locked
  async transfer(user, wallet_number: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    const senderWallet = await this.ensureWallet(user);

    return this.dataSource.transaction(async (manager) => {
      // lock sender
      const s = await manager.getRepository(Wallet).findOne({
        where: { id: senderWallet.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!s) throw new NotFoundException('Sender wallet not found');
      if (Number(s.balance) < amount)
        throw new BadRequestException('Insufficient balance');

      // find recipient by wallet_number (we'll treat wallet_number as wallet.id here)
      const recipient = await manager.getRepository(Wallet).findOne({
        where: { id: wallet_number },
        lock: { mode: 'pessimistic_write' },
      });
      if (!recipient) throw new NotFoundException('Recipient not found');
      if (recipient.id === s.id)
        throw new BadRequestException('Cannot transfer to the same wallet');

      // perform debit and credit
      s.balance = Number(s.balance) - amount;
      recipient.balance = Number(recipient.balance) + amount;

      const debitTx = manager
        .getRepository(Transaction)
        .create({ type: 'transfer', amount, status: 'success', wallet: s });
      const creditTx = manager.getRepository(Transaction).create({
        type: 'transfer',
        amount,
        status: 'success',
        wallet: recipient,
      });

      await manager.save([s, recipient]);
      await manager.save([debitTx, creditTx]);

      return { status: 'success', message: 'Transfer completed' };
    });
  }
}