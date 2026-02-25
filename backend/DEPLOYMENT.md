# ChuloBots Backend - Railway Deployment Guide

This guide will help you deploy the ChuloBots backend API to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Contract addresses from smart contract deployment

## Quick Deploy to Railway

### 1. Create New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `chulobots` repository
5. Select the `backend` directory as the root path

### 2. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will automatically create a PostgreSQL instance
4. The `DATABASE_URL` will be automatically set in your environment

### 3. Add Redis Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "Redis"**
3. Railway will automatically create a Redis instance
4. The `REDIS_URL` will be automatically set in your environment

### 4. Configure Environment Variables

In the Railway dashboard for your backend service, go to **"Variables"** and add:

#### Required Environment Variables

```bash
# Environment
NODE_ENV=staging

# Server
PORT=3000

# CORS (update with your frontend URL after deployment)
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app,http://localhost:3000

# JWT & Authentication
JWT_SECRET=<generate-random-secret-here>
JWT_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Contract Addresses (from your smart contract deployment)
CHULO_ADDRESS=0x...
SIGNAL_REGISTRY_ADDRESS=0x...
VALIDATOR_STAKING_ADDRESS=0x...

# RPC
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ORACLE_CONTRACT_ADDRESS=0x...

# Chainlink Price Feeds (Arbitrum Sepolia)
CHAINLINK_PRICE_FEED_BTC=0x...
CHAINLINK_PRICE_FEED_ETH=0x...
CHAINLINK_PRICE_FEED_SOL=0x...

# Encryption key for API keys (32-byte hex string)
ENCRYPTION_KEY=<generate-32-byte-hex-key>
```

#### Optional Environment Variables (for exchange integrations)

```bash
# API Keys (Exchange Integrations) - Optional
HYPERLIQUID_API_KEY=your-api-key
BINANCE_API_KEY=your-api-key
BINANCE_API_SECRET=your-api-secret
COINBASE_API_KEY=your-api-key
COINBASE_API_SECRET=your-api-secret
```

### 5. Generate Secure Keys

Generate secure values for sensitive environment variables:

```bash
# Generate JWT_SECRET (random 64-character hex string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (random 32-byte hex string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy

1. Railway will automatically detect the `railway.toml` configuration
2. Click **"Deploy"** or push changes to your GitHub repository
3. Railway will:
   - Install dependencies
   - Generate Prisma client
   - Build the TypeScript code
   - Run database migrations
   - Start the server

### 7. Database Migrations

Database migrations run automatically on each deployment via the `startCommand`:

```bash
npx prisma migrate deploy && npm start
```

If you need to run migrations manually:

1. Open Railway project dashboard
2. Go to your backend service
3. Click **"Settings" → "Deploy Triggers"**
4. Or use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

### 8. Verify Deployment

Once deployed, Railway will provide a public URL (e.g., `https://chulobots-backend.up.railway.app`).

Check the health endpoints:

```bash
# Root health check
curl https://your-backend-url.railway.app/health

# API health check
curl https://your-backend-url.railway.app/api/health

# System status
curl https://your-backend-url.railway.app/api/status
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-02-24T12:00:00.000Z"
}
```

## Configuration Details

### railway.toml

The `railway.toml` file configures the build and deployment:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma migrate deploy && npm start"
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10
```

### Build Process

1. **Install dependencies**: `npm install`
2. **Generate Prisma client**: `npx prisma generate`
3. **Build TypeScript**: `npm run build` (compiles to `dist/`)

### Start Process

1. **Run migrations**: `npx prisma migrate deploy` (applies pending migrations)
2. **Start server**: `npm start` (runs `node dist/index.js`)

### Restart Policy

- **Type**: `on-failure` - Only restarts if the process exits with an error
- **Max Retries**: 10 - Will attempt up to 10 restarts before giving up

## Health Check Endpoints

Railway uses these endpoints for health monitoring:

- **`GET /health`** - Simple health check (returns `{ status: "ok" }`)
- **`GET /api/health`** - Detailed health check (includes uptime)
- **`GET /api/status`** - System status (environment, connections)

## Database Management

### View Database

Use Prisma Studio to view/edit data:

```bash
# Install Railway CLI
railway run npx prisma studio
```

This will open Prisma Studio at `http://localhost:5555`.

### Create a New Migration (Development)

```bash
# Local development
npm run db:migrate:dev -- --name migration_name

# Push to production via Railway
railway run npx prisma migrate deploy
```

### Seed Database

```bash
railway run npm run db:seed
```

## Monitoring & Logs

### View Logs

1. Open Railway dashboard
2. Go to your backend service
3. Click **"Deployments"** tab
4. View real-time logs

Or use Railway CLI:

```bash
railway logs
```

### Metrics

Railway provides automatic metrics:

- CPU usage
- Memory usage
- Request count
- Response times

Access via **"Metrics"** tab in the Railway dashboard.

## Troubleshooting

### Build Failures

**Issue**: Build fails during `npm install`

**Solution**: Check `package.json` dependencies and ensure all are valid

---

**Issue**: Build fails during `npx prisma generate`

**Solution**: Ensure `DATABASE_URL` is set correctly and Prisma schema is valid

### Runtime Errors

**Issue**: Application crashes on startup

**Solution**:

1. Check Railway logs for error messages
2. Verify all required environment variables are set
3. Ensure `DATABASE_URL` and `REDIS_URL` are correct

---

**Issue**: Database connection errors

**Solution**:

1. Verify PostgreSQL service is running in Railway
2. Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
3. Ensure database migrations have run

---

**Issue**: Redis connection errors

**Solution**:

1. Verify Redis service is running in Railway
2. Check `REDIS_URL` format: `redis://host:port`
3. Ensure Redis service is in the same Railway project

### Migration Issues

**Issue**: Migrations fail on deployment

**Solution**:

1. Check migration files in `prisma/migrations/`
2. Manually run migrations: `railway run npx prisma migrate deploy`
3. If needed, reset database (⚠️ DATA LOSS): `railway run npx prisma migrate reset`

## Security Best Practices

1. **Never commit `.env` files** - Use Railway's environment variables
2. **Rotate secrets regularly** - Update `JWT_SECRET` and `ENCRYPTION_KEY` periodically
3. **Use strong secrets** - Generate cryptographically secure random values
4. **Limit CORS origins** - Only allow trusted frontend domains
5. **Enable rate limiting** - Configure appropriate limits for your use case
6. **Use HTTPS only** - Railway provides automatic SSL certificates

## Scaling

### Horizontal Scaling

Railway supports horizontal scaling:

1. Go to service settings
2. Navigate to **"Scaling"**
3. Adjust the number of instances

**Note**: Ensure your application is stateless for horizontal scaling.

### Vertical Scaling

Upgrade Railway plan for more resources:

- More CPU
- More RAM
- Higher request limits

## CI/CD

Railway automatically deploys on every push to your main branch.

### Custom Deployment Branch

1. Go to service settings
2. Navigate to **"Source"**
3. Change the deployment branch

### Deploy Hooks

Set up deploy hooks for additional automation:

1. Go to **"Settings" → "Deploy Triggers"**
2. Create a webhook
3. Trigger deployments via API

## Cost Optimization

1. **Use appropriate instance size** - Don't over-provision
2. **Enable auto-scaling** - Scale down during low traffic
3. **Monitor usage** - Check Railway dashboard for metrics
4. **Optimize database queries** - Use Prisma's query optimization
5. **Use connection pooling** - Prisma handles this automatically

## Support

- **Railway Docs**: https://docs.railway.app
- **Prisma Docs**: https://www.prisma.io/docs
- **ChuloBots Issues**: https://github.com/your-org/chulobots/issues

## Next Steps

After deploying the backend:

1. ✅ Deploy frontend (webapp) to Railway/Vercel
2. ✅ Update `ALLOWED_ORIGINS` with frontend URL
3. ✅ Deploy bot-executor service
4. ✅ Set up monitoring and alerts
5. ✅ Configure custom domain (optional)
6. ✅ Set up backup strategy for PostgreSQL

---

**Deployment Status**: ✅ Ready for Railway deployment
