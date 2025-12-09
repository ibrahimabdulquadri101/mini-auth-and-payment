import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Important: allow raw body for Paystack webhook path
  // We'll register the raw body parser for webhook route via express middleware
  app.use('/wallet/paystack/webhook', express.raw({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  await app.listen(process.env.PORT || 3000);
  console.log('Server started on port', process.env.PORT || 3000);
}
bootstrap();
