"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bodyParser = __importStar(require("body-parser"));
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
    });
    app.enableCors({
        origin: [
            'https://www.your-frontend-domain.com',
            'https://smellable-iris-nondeterministic.ngrok-free.dev',
            'http://localhost:4200'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        if (req.originalUrl === '/wallet/paystack/webhook') {
            bodyParser.raw({ type: 'application/json' })(req, res, next);
        }
        else {
            next();
        }
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Mini Auth & Payment API')
        .setDescription('A NestJS API providing Google OAuth authentication, JWT tokens, API key management, and wallet operations with Paystack integration')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addApiKey({
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for service authentication',
    }, 'api-key')
        .addApiKey({
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'API Key with "ApiKey " prefix',
    }, 'api-key-bearer')
        .addTag('Authentication', 'Google OAuth endpoints')
        .addTag('API Keys', 'Manage API keys for service authentication')
        .addTag('Wallet', 'Wallet operations including deposits, transfers, and balance')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT || 3000);
    console.log('Server started on port', process.env.PORT || 3000);
    console.log(`Swagger docs available at http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map