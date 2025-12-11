# Mini Auth & Payment API

A production-ready NestJS API featuring Google OAuth authentication, JWT tokens, API key management, and wallet operations with Paystack integration.

## Features

- 🔐 **Google OAuth Authentication** - Secure login via Google
- 🎫 **JWT Token Management** - Stateless authentication
- 🔑 **API Key System** - Service-to-service authentication with granular permissions
- 💰 **Wallet Operations** - Deposits, transfers, and balance management
- 💳 **Paystack Integration** - Payment processing with webhook support
- 📚 **Swagger Documentation** - Interactive API documentation
- 🔒 **Role-Based Access Control** - User and service-level permissions
- 🗄️ **PostgreSQL Database** - Type-safe database operations with TypeORM

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication Methods](#authentication-methods)
- [API Endpoints](#api-endpoints)
- [Webhook Configuration](#webhook-configuration)
- [Development Guide](#development-guide)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn**
- **Google OAuth Credentials** (Client ID & Secret)
- **Paystack Account** (Secret Key & Webhook Secret)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install
```

---

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=wallet_api

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# API Key Configuration
API_KEY_SALT=your_secure_api_key_salt_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

### How to Get Credentials

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

#### Paystack
1. Sign up at [Paystack](https://paystack.com/)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Generate a **Webhook Secret** for signature verification

---

## Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE wallet_api;
\q

# Run the application (TypeORM will auto-sync schema in development)
npm run start:dev
```

> ⚠️ **Note**: `synchronize: true` is enabled for development. **Disable it in production** and use migrations.

---

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start on `http://localhost:3000` (or your configured PORT).

---

## API Documentation

Once the application is running, access the interactive Swagger documentation:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Complete endpoint documentation
- Request/response schemas
- Authentication testing
- Try-it-out functionality

---

## Authentication Methods

### 1. JWT Bearer Token (User Authentication)

Used for user-level operations after Google OAuth login.

```bash
# Header format
Authorization: Bearer <jwt_token>
```

**How to get a JWT token:**
1. Navigate to `/auth/google` in browser
2. Complete Google OAuth flow
3. Receive JWT token in response
4. Use token for subsequent requests

### 2. API Key (Service Authentication)

Used for service-to-service communication with granular permissions.

```bash
# Option 1: Custom header
x-api-key: <your_api_key>

# Option 2: Authorization header
Authorization: ApiKey <your_api_key>
```

**Permissions Available:**
- `read` - View wallet balance and transactions
- `deposit` - Initialize deposits
- `transfer` - Transfer funds between wallets

---

## API Endpoints

### Authentication

#### Google OAuth Login
```http
GET /auth/google
```
Redirects to Google OAuth consent screen.

#### Google OAuth Callback
```http
GET /auth/google/callback
```
Handles OAuth callback and returns JWT token.

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### API Key Management

#### Create API Key
```http
POST /keys/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My Service Key",
  "permissions": ["read", "deposit", "transfer"],
  "expiry": "1M"
}
```

**Expiry Options:** `1H`, `1D`, `1M`, `1Y`

**Response:**
```json
{
  "statusCode": 201,
  "id": "uuid",
  "api_key": "64-character-hex-string",
  "expires_at": "2024-02-15T10:30:00.000Z"
}
```

> ⚠️ **Important**: Store the `api_key` securely. It won't be shown again.

#### List API Keys
```http
GET /keys/list
Authorization: Bearer <jwt_token>
```

#### Revoke API Key
```http
POST /keys/revoke/:id
Authorization: Bearer <jwt_token>
```

#### Rollover Expired Key
```http
POST /keys/rollover
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "expired_key_id": "uuid",
  "expiry": "1M"
}
```

---

### Wallet Operations

#### Initialize Deposit
```http
POST /wallet/deposit
Authorization: Bearer <jwt_token> OR x-api-key: <api_key>
Content-Type: application/json

{
  "amount": 50000
}
```

**Note:** Amount is in kobo (100 kobo = 1 NGN) or cents.

**Response:**
```json
{
  "statusCode": 201,
  "reference": "ref_uuid",
  "authorization_url": "https://checkout.paystack.com/..."
}
```

**Flow:**
1. API creates pending transaction
2. Returns Paystack payment URL
3. User completes payment on Paystack
4. Paystack sends webhook to confirm payment
5. Wallet balance updated automatically

#### Check Deposit Status
```http
GET /wallet/deposit/:reference/status
Authorization: Bearer <jwt_token> OR x-api-key: <api_key>
```

**Response:**
```json
{
  "reference": "ref_uuid",
  "status": "success",
  "amount": 50000
}
```

#### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer <jwt_token> OR x-api-key: <api_key>
```

**Response:**
```json
{
  "balance": 150000
}
```

#### Transfer Funds
```http
POST /wallet/transfer
Authorization: Bearer <jwt_token> OR x-api-key: <api_key>
Content-Type: application/json

{
  "wallet_number": "recipient-wallet-uuid",
  "amount": 10000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Transfer completed"
}
```

#### Get Transaction History
```http
GET /wallet/transactions
Authorization: Bearer <jwt_token> OR x-api-key: <api_key>
```

**Response:**
```json
[
  {
    "type": "deposit",
    "amount": 50000,
    "status": "success",
    "reference": "ref_uuid",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Webhook Configuration

### Paystack Webhook Setup

1. Log in to your Paystack Dashboard
2. Go to **Settings** → **Webhooks**
3. Add webhook URL: `https://yourdomain.com/wallet/paystack/webhook`
4. Copy the **Webhook Secret** to your `.env` file

### Webhook Endpoint
```http
POST /wallet/paystack/webhook
x-paystack-signature: <signature>
```

**Security:** The API automatically verifies webhook signatures using HMAC SHA-512 to ensure requests are from Paystack.

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run start:dev

# Expose local server
ngrok http 3000

# Use the ngrok URL in Paystack webhook settings
# https://your-subdomain.ngrok.io/wallet/paystack/webhook
```

---

## Development Guide

### Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── google.strategy.ts
├── users/               # User management
│   ├── user.entity.ts
│   ├── users.service.ts
│   └── users.module.ts
├── keys/                # API key management
│   ├── api-key.entity.ts
│   ├── keys.controller.ts
│   ├── keys.service.ts
│   └── keys.module.ts
├── wallets/             # Wallet operations
│   ├── wallet.entity.ts
│   ├── transaction.entity.ts
│   ├── wallet.controller.ts
│   ├── wallet.service.ts
│   └── wallet.module.ts
├── common/              # Shared resources
│   ├── auth.middleware.ts
│   ├── auth.guard.ts
│   ├── permission.guard.ts
│   └── permissions.decorator.ts
├── utils/               # Utility functions
│   ├── id.utils.ts
│   └── expiry.util.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry
```

### Adding New Endpoints

1. **Create DTO** in `dto/dto.ts`
2. **Add Controller Method** with decorators
3. **Implement Service Logic**
4. **Add Swagger Documentation** using decorators
5. **Apply Guards** for authentication/authorization

Example:
```typescript
@UseGuards(PermissionGuard)
@Permissions('read')
@Get('example')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Example endpoint' })
@ApiResponse({ status: 200, description: 'Success' })
async example(@Req() req: any) {
  // Implementation
}
```

### Testing API Endpoints

Using **curl**:
```bash
# Get JWT token first
curl -X GET "http://localhost:3000/auth/google"

# Use JWT token
curl -X GET "http://localhost:3000/wallet/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Use API key
curl -X GET "http://localhost:3000/wallet/balance" \
  -H "x-api-key: YOUR_API_KEY"
```

Using **Postman**:
1. Import the OpenAPI spec from `/api/docs-json`
2. Set environment variables for tokens
3. Test endpoints with pre-configured requests

---

## Architecture Overview

### Authentication Flow

```
User → /auth/google → Google OAuth → /auth/google/callback → JWT Token
```

### Deposit Flow

```
User → POST /wallet/deposit → Pending Transaction Created
  → Paystack Initialize → Payment URL
  → User Pays → Paystack Webhook → Transaction Updated → Balance Updated
```

### Security Features

- **Password Hashing**: API keys hashed with HMAC SHA-256
- **JWT Expiration**: 7-day token validity
- **Webhook Verification**: HMAC SHA-512 signature validation
- **Rate Limiting**: Max 5 active API keys per user
- **Transaction Locking**: Pessimistic locking prevents race conditions
- **CORS Protection**: Configurable allowed origins

### Database Schema

**Entities:**
- `User` - User accounts
- `Wallet` - User wallets (1:1 with User)
- `Transaction` - Transaction history
- `ApiKey` - Service authentication keys

**Relationships:**
- User ← 1:1 → Wallet
- Wallet ← 1:N → Transactions
- User ← 1:N → ApiKeys

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

#### 2. Google OAuth Redirect Error
```
Error: redirect_uri_mismatch
```
**Solution:**
- Add callback URL to Google Cloud Console
- Match the exact URL (including http/https)
- Check for trailing slashes

#### 3. Webhook Signature Mismatch
```
Error: Signature mismatch!
```
**Solution:**
- Verify `PAYSTACK_WEBHOOK_SECRET` in `.env`
- Ensure webhook secret matches Paystack dashboard
- Check that raw body parser is configured correctly

#### 4. API Key Not Working
```
Error: Forbidden for this credential type
```
**Solution:**
- Verify API key has required permissions
- Check if key is expired or revoked
- Ensure correct header format (`x-api-key` or `ApiKey`)

#### 5. Insufficient Balance
```
Error: Insufficient balance
```
**Solution:**
- Check wallet balance: `GET /wallet/balance`
- Verify deposit completed: `GET /wallet/deposit/:reference/status`
- Ensure amounts are in smallest unit (kobo/cents)

### Debug Mode

Enable detailed logging:
```typescript
// In app.module.ts
TypeOrmModule.forRoot({
  // ...
  logging: true, // Enable SQL query logging
})
```

### Logs

Check application logs for webhook processing:
```bash
# In development
npm run start:dev

# Watch for:
# 🔔 WEBHOOK RECEIVED
# ✅ Signature verified!
# 💰 Processing successful payment...
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `synchronize: false` in TypeORM config
- [ ] Create database migrations
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Use strong API_KEY_SALT (32+ characters)
- [ ] Configure production database credentials
- [ ] Update Google OAuth callback URLs
- [ ] Update Paystack webhook URL to production domain
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains
- [ ] Set up environment variables securely
- [ ] Enable rate limiting middleware
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
# ... other production values
```

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate API keys regularly** (use rollover endpoint)
3. **Use HTTPS in production** for all endpoints
4. **Validate webhook signatures** (already implemented)
5. **Implement rate limiting** for public endpoints
6. **Monitor failed authentication attempts**
7. **Use database migrations** instead of synchronize in production
8. **Keep dependencies updated** (`npm audit fix`)

---

## Support & Contributing

For issues, questions, or contributions:
- Open an issue on GitHub
- Submit pull requests
- Contact support team

---

## License

[Your License Here]

---

**Built with NestJS, TypeORM, and Paystack** 🚀