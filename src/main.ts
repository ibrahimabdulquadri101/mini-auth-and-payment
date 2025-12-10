// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import * as express from 'express';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     bodyParser: true,
//   });
//   // Important: allow raw body for Paystack webhook path
//   // We'll register the raw body parser for webhook route via express middleware
//   app.use('/wallet/paystack/webhook', express.raw({ type: '*/*' }));

//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       forbidNonWhitelisted: false,
//     }),
//   );
//   await app.listen(process.env.PORT || 3000);
//   console.log('Server started on port', process.env.PORT || 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // CRITICAL: Disable default body parser
  })
   app.enableCors({
    origin: [
      'https://www.your-frontend-domain.com', // Your main frontend domain
      'https://smellable-iris-nondeterministic.ngrok-free.dev', // The specific ngrok URL
      'http://localhost:4200' // Your local development server (e.g., Angular/React)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // If you are using cookies or authorization headers
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Important: allow raw body for Paystack webhook path
    app.use((req, res, next) => {
    if (req.originalUrl === '/wallet/paystack/webhook') {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      next();
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Mini Auth & Payment API')
    .setDescription(
      'A NestJS API providing Google OAuth authentication, JWT tokens, API key management, and wallet operations with Paystack integration'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for service authentication',
      },
      'api-key',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'API Key with "ApiKey " prefix',
      },
      'api-key-bearer',
    )
    .addTag('Authentication', 'Google OAuth endpoints')
    .addTag('API Keys', 'Manage API keys for service authentication')
    .addTag('Wallet', 'Wallet operations including deposits, transfers, and balance')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log('Server started on port', process.env.PORT || 3000);
  console.log(`Swagger docs available at http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();