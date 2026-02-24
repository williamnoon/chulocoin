# ChuloBots Staging Deployment Guide

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: Initial Setup](#step-1-initial-setup)
- [Step 2: Deploy Smart Contracts](#step-2-deploy-smart-contracts)
- [Step 3: Deploy Backend to Railway](#step-3-deploy-backend-to-railway)
- [Step 4: Deploy Frontend to Vercel](#step-4-deploy-frontend-to-vercel)
- [Step 5: Configure CLI for Staging](#step-5-configure-cli-for-staging)
- [Step 6: Verify Deployment](#step-6-verify-deployment)
- [Testing Procedures](#testing-procedures)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting](#troubleshooting)
- [Tear Down Staging Environment](#tear-down-staging-environment)

## Architecture Overview

The ChuloBots staging environment consists of four main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                     STAGING ENVIRONMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │      │   Backend    │      │  Smart       │  │
│  │   (Vercel)   │─────▶│  (Railway)   │─────▶│  Contracts   │  │
│  │              │      │              │      │  (Arbitrum)  │  │
│  └──────────────┘      └──────┬───────┘      └──────────────┘  │
│   - Landing Page              │                   Sepolia       │
│   - Web App                   │                                 │
│                               ▼                                 │
│                      ┌──────────────┐                          │
│                      │  PostgreSQL  │                          │
│                      │   (Railway)  │                          │
│                      └──────────────┘                          │
│                                                                  │
│                      ┌──────────────┐                          │
│                      │    Redis     │                          │
│                      │   (Railway)  │                          │
│                      └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- **Smart Contracts**: Deployed on Arbitrum Sepolia testnet
- **Backend API**: Node.js/Express server on Railway with PostgreSQL + Redis
- **Frontend Landing**: Next.js landing page on Vercel
- **Frontend WebApp**: React app on Vercel
- **CLI**: Rust-based mining tool (local or VPS)

## Prerequisites

Before you begin, ensure you have:

### Required Accounts
- [ ] [Railway](https://railway.app) account (free tier available)
- [ ] [Vercel](https://vercel.com) account (free tier available)
- [ ] [GitHub](https://github.com) account with repository access
- [ ] [Arbiscan](https://sepolia.arbiscan.io) API key (for contract verification)

### Required Tools
- [ ] Node.js 20+ and npm 10+
- [ ] Git
- [ ] Testnet ETH on Arbitrum Sepolia (0.5 ETH recommended)
  - Get from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
  - Or bridge from [Ethereum Sepolia](https://bridge.arbitrum.io/?destinationChain=arbitrum-sepolia&sourceChain=sepolia)

### Required Credentials
- [ ] Private key with testnet ETH for contract deployment
- [ ] Exchange API keys (testnet):
  - Hyperliquid testnet API key
  - Binance testnet API key/secret
  - Coinbase testnet API key/secret

### Repository Setup
- [ ] Clone the repository
- [ ] Create a `staging` branch (if not exists)
- [ ] Ensure all tests pass locally

## Step 1: Initial Setup

### 1.1 Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/yourusername/chulobots.git
cd chulobots

# Create staging branch
git checkout -b staging

# Install dependencies
npm install

# Copy environment template
cp .env.staging.example .env
```

### 1.2 Configure Environment Variables

Create a `.env` file in the root directory with the following structure (see `.env.staging.example`):

```bash
# Copy the staging example
cp .env.staging.example .env

# Edit with your values
nano .env
```

## Step 2: Deploy Smart Contracts

### 2.1 Setup Contract Deployment

```bash
cd contracts

# Copy environment file
cp .env.example .env

# Edit with your values
nano .env
```

Add the following to `contracts/.env`:

```env
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 2.2 Deploy Contracts to Arbitrum Sepolia

```bash
# Ensure you're in the contracts directory
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to Arbitrum Sepolia
npm run deploy:sepolia
```

This will deploy:
- CHULO Token
- ChainlinkPriceOracle
- TierNFT
- ValidatorStaking
- SignalRegistry

### 2.3 Save Deployment Addresses

The deployment script will create `contracts/deployments/sepolia.json` with all contract addresses.

**Example output:**
```json
{
  "network": "arbitrumSepolia",
  "chainId": "421614",
  "contracts": {
    "CHULO": {
      "address": "0x..."
    },
    "SignalRegistry": {
      "address": "0x..."
    },
    "ValidatorStaking": {
      "address": "0x..."
    }
  }
}
```

**Important**: Save these addresses - you'll need them for backend and frontend configuration.

### 2.4 Verify Contracts on Arbiscan

```bash
# Run verification commands (output from deployment script)
npx hardhat verify --network arbitrumSepolia CHULO_ADDRESS "10000000000000000000000000"
npx hardhat verify --network arbitrumSepolia ORACLE_ADDRESS
npx hardhat verify --network arbitrumSepolia TIERNFT_ADDRESS "CHULO_ADDRESS"
# ... etc
```

## Step 3: Deploy Backend to Railway

### 3.1 Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the `chulobots` repository
5. Select the `staging` branch

### 3.2 Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision the database
4. Copy the `DATABASE_URL` from the PostgreSQL service variables

### 3.3 Add Redis

1. In your Railway project, click "+ New"
2. Select "Database" → "Redis"
3. Railway will automatically provision Redis
4. Copy the `REDIS_URL` from the Redis service variables

### 3.4 Configure Backend Service

1. Click on the backend service
2. Go to "Settings" → "Root Directory"
3. Set to `backend`
4. Go to "Settings" → "Build & Deploy"
5. Set build command: `npm run build`
6. Set start command: `npm start`

### 3.5 Add Environment Variables

Go to "Variables" and add all backend environment variables:

```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# JWT
JWT_SECRET=your-secure-random-jwt-secret-here
JWT_EXPIRATION=7d

# CORS
ALLOWED_ORIGINS=https://staging-webapp.vercel.app,https://staging-landing.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Contract Addresses (from Step 2)
CHULO_ADDRESS=0x...
SIGNAL_REGISTRY_ADDRESS=0x...
VALIDATOR_STAKING_ADDRESS=0x...

# RPC
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ORACLE_CONTRACT_ADDRESS=0x...

# Chainlink Price Feeds (Arbitrum Sepolia)
CHAINLINK_PRICE_FEED_BTC=0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69
CHAINLINK_PRICE_FEED_ETH=0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165

# Exchange API Keys (Testnet)
HYPERLIQUID_API_KEY=your-testnet-api-key
BINANCE_API_KEY=your-testnet-api-key
BINANCE_API_SECRET=your-testnet-api-secret
COINBASE_API_KEY=your-testnet-api-key
COINBASE_API_SECRET=your-testnet-api-secret

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-in-hex
```

### 3.6 Run Database Migrations

Railway will automatically run the build, but you need to run migrations manually the first time:

1. Go to your backend service in Railway
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "View Logs"
5. In the "Settings" tab, add a deployment script:

```json
{
  "scripts": {
    "deploy": "prisma migrate deploy && npm start"
  }
}
```

Or run manually via Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npm run db:migrate

# Seed staging data
railway run npm run db:seed:staging
```

### 3.7 Get Backend URL

Once deployed, Railway will provide a public URL like:
`https://your-backend.railway.app`

Save this URL - you'll need it for frontend configuration.

## Step 4: Deploy Frontend to Vercel

### 4.1 Deploy Landing Page

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import `chulobots` repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/landing`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WEBAPP_URL=https://staging-webapp.vercel.app
```

6. Click "Deploy"

### 4.2 Deploy Web App

1. In Vercel Dashboard, click "Add New..." → "Project"
2. Import `chulobots` repository again
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add environment variables:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_WS_URL=wss://your-backend.railway.app
VITE_CHULO_ADDRESS=0x...
VITE_SIGNAL_REGISTRY_ADDRESS=0x...
VITE_VALIDATOR_STAKING_ADDRESS=0x...
VITE_CHAIN_ID=421614
```

5. Click "Deploy"

### 4.3 Configure Custom Domains (Optional)

If you have custom domains:

1. Go to each Vercel project → "Settings" → "Domains"
2. Add your staging domains:
   - Landing: `staging.chulobots.com`
   - WebApp: `app-staging.chulobots.com`

### 4.4 Update CORS in Backend

Update the `ALLOWED_ORIGINS` in Railway backend to include your actual Vercel URLs:

```env
ALLOWED_ORIGINS=https://your-landing-xyz.vercel.app,https://your-webapp-abc.vercel.app
```

## Step 5: Configure CLI for Staging

### 5.1 Build CLI

```bash
cd cli

# Build the CLI
cargo build --release
```

### 5.2 Configure CLI for Staging

Create a CLI configuration file `~/.chulobots/staging.toml`:

```toml
[network]
rpc_url = "https://sepolia-rollup.arbitrum.io/rpc"
chain_id = 421614

[contracts]
chulo_address = "0x..."
signal_registry_address = "0x..."
validator_staking_address = "0x..."

[api]
backend_url = "https://your-backend.railway.app"
ws_url = "wss://your-backend.railway.app"

[miner]
wallet_address = "0x..."
private_key = "your-private-key"
```

### 5.3 Run CLI in Staging Mode

```bash
# Run with staging config
./target/release/chulobot --config ~/.chulobots/staging.toml mine
```

## Step 6: Verify Deployment

Run the verification script to ensure everything is working:

```bash
# From the root directory
./scripts/verify-staging.sh
```

This script will check:
- [ ] Smart contracts are deployed and verified
- [ ] Backend API is responding
- [ ] Frontend landing page is accessible
- [ ] Frontend webapp is accessible
- [ ] Database is connected
- [ ] Redis is connected
- [ ] WebSocket connections work

### Manual Verification Checklist

1. **Smart Contracts**
   - [ ] View contracts on [Arbiscan Sepolia](https://sepolia.arbiscan.io)
   - [ ] Verify contract code is verified
   - [ ] Check initial token supply

2. **Backend**
   - [ ] Visit `https://your-backend.railway.app/health`
   - [ ] Should return `{"status":"ok"}`
   - [ ] Check logs in Railway dashboard

3. **Frontend Landing**
   - [ ] Visit landing page URL
   - [ ] Check all pages load correctly
   - [ ] Verify links to webapp work

4. **Frontend WebApp**
   - [ ] Visit webapp URL
   - [ ] Connect wallet (MetaMask)
   - [ ] Switch to Arbitrum Sepolia network
   - [ ] View signals dashboard
   - [ ] Test WebSocket real-time updates

5. **Database**
   - [ ] Check Railway PostgreSQL logs
   - [ ] Verify seed data exists
   - [ ] Run a test query via Railway console

## Testing Procedures

### Test 1: End-to-End Signal Flow

1. **Submit a Signal via CLI**
   ```bash
   ./target/release/chulobot --config staging.toml submit-signal \
     --asset BTC \
     --direction LONG \
     --entry 45000 \
     --stop 44000 \
     --target 48000 \
     --confidence 85
   ```

2. **Verify in Backend**
   ```bash
   curl https://your-backend.railway.app/api/signals/pending
   ```

3. **Check WebApp**
   - Open webapp
   - Navigate to Signals page
   - Verify the new signal appears

4. **Validate Signal**
   - Use validator account
   - Vote on the signal
   - Check consensus reached

### Test 2: User Tier Management

1. **Create Test User**
   ```bash
   curl -X POST https://your-backend.railway.app/api/users \
     -H "Content-Type: application/json" \
     -d '{"walletAddress":"0x..."}'
   ```

2. **Check CHULO Balance**
   ```bash
   curl https://your-backend.railway.app/api/users/0x.../balance
   ```

3. **Verify Tier in WebApp**
   - Login with test wallet
   - Check tier badge displays correctly

### Test 3: Position Tracking

1. **Open Position**
   - Select a validated signal
   - Click "Trade" in webapp
   - Confirm position opens

2. **Monitor Position**
   - Check position appears in "My Positions"
   - Verify real-time P&L updates

3. **Close Position**
   - Click "Close Position"
   - Verify position closes
   - Check trade history

### Test 4: Validator Staking

1. **Stake CHULO Tokens**
   ```javascript
   // Via web3
   const stakeAmount = ethers.parseEther("10000");
   await chuloToken.approve(validatorStakingAddress, stakeAmount);
   await validatorStaking.stake(stakeAmount);
   ```

2. **Verify Stake**
   ```bash
   curl https://your-backend.railway.app/api/validators/0x...
   ```

3. **Earn Rewards**
   - Validate signals
   - Check rewards accumulation

## Environment Variables Reference

### Complete Environment Variables Table

| Variable | Service | Required | Description | Example |
|----------|---------|----------|-------------|---------|
| `NODE_ENV` | Backend | Yes | Environment name | `staging` |
| `PORT` | Backend | Yes | Server port | `3000` |
| `DATABASE_URL` | Backend | Yes | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Backend | Yes | Redis connection | `redis://...` |
| `JWT_SECRET` | Backend | Yes | JWT signing key | `random-secret-key` |
| `JWT_EXPIRATION` | Backend | No | Token expiration | `7d` |
| `ALLOWED_ORIGINS` | Backend | Yes | CORS origins | `https://app.vercel.app` |
| `RATE_LIMIT_WINDOW` | Backend | No | Rate limit window | `15m` |
| `RATE_LIMIT_MAX_REQUESTS` | Backend | No | Max requests | `100` |
| `CHULO_ADDRESS` | Backend/Frontend | Yes | CHULO token address | `0x...` |
| `SIGNAL_REGISTRY_ADDRESS` | Backend/Frontend | Yes | Signal registry address | `0x...` |
| `VALIDATOR_STAKING_ADDRESS` | Backend/Frontend | Yes | Staking contract address | `0x...` |
| `ARBITRUM_SEPOLIA_RPC` | Backend | Yes | RPC endpoint | `https://sepolia-rollup...` |
| `ORACLE_CONTRACT_ADDRESS` | Backend | Yes | Oracle address | `0x...` |
| `CHAINLINK_PRICE_FEED_BTC` | Backend | Yes | BTC price feed | `0x...` |
| `CHAINLINK_PRICE_FEED_ETH` | Backend | Yes | ETH price feed | `0x...` |
| `HYPERLIQUID_API_KEY` | Backend | Yes | Hyperliquid key | `testnet-key` |
| `BINANCE_API_KEY` | Backend | Yes | Binance key | `testnet-key` |
| `BINANCE_API_SECRET` | Backend | Yes | Binance secret | `testnet-secret` |
| `COINBASE_API_KEY` | Backend | Yes | Coinbase key | `testnet-key` |
| `COINBASE_API_SECRET` | Backend | Yes | Coinbase secret | `testnet-secret` |
| `ENCRYPTION_KEY` | Backend | Yes | API key encryption | `32-byte-hex` |
| `VITE_API_URL` | Frontend | Yes | Backend API URL | `https://api.railway.app` |
| `VITE_WS_URL` | Frontend | Yes | WebSocket URL | `wss://api.railway.app` |
| `VITE_CHAIN_ID` | Frontend | Yes | Chain ID | `421614` |
| `PRIVATE_KEY` | Contracts | Yes | Deployer key | `0x...` |
| `ARBISCAN_API_KEY` | Contracts | Yes | Verification key | `ABC123...` |

### Where Each Variable Comes From

| Variable | Source |
|----------|--------|
| Contract addresses | Deployment output in `contracts/deployments/sepolia.json` |
| `DATABASE_URL` | Railway PostgreSQL service |
| `REDIS_URL` | Railway Redis service |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Generate with `openssl rand -hex 32` |
| Exchange API keys | Sign up for testnet accounts |
| `ARBISCAN_API_KEY` | [Arbiscan](https://arbiscan.io/apis) account |
| Chainlink price feeds | [Chainlink Docs](https://docs.chain.link/data-feeds/price-feeds/addresses?network=arbitrum) |

## Troubleshooting

### Backend Issues

#### Database Connection Failed
```
Error: P1001: Can't reach database server
```

**Solution:**
1. Check `DATABASE_URL` is correct in Railway
2. Ensure PostgreSQL service is running
3. Check Railway service logs
4. Verify database is in same region as backend

#### Migration Errors
```
Error: Migration failed to apply
```

**Solution:**
```bash
# Reset database (CAUTION: Deletes all data)
railway run npx prisma migrate reset

# Or push schema directly
railway run npx prisma db push
```

#### Redis Connection Failed
```
Error: Redis connection timeout
```

**Solution:**
1. Verify `REDIS_URL` format: `redis://host:port`
2. Check Redis service is running in Railway
3. Ensure Redis is in same project

### Frontend Issues

#### Cannot Connect to Backend
```
Network Error / CORS Error
```

**Solution:**
1. Verify `VITE_API_URL` matches Railway backend URL
2. Check `ALLOWED_ORIGINS` in backend includes Vercel URL
3. Ensure backend is deployed and running

#### Build Failed on Vercel
```
Error: Failed to compile
```

**Solution:**
1. Check all environment variables are set
2. Verify `Root Directory` is correct
3. Check build logs for specific errors
4. Ensure dependencies are in `package.json`

### Smart Contract Issues

#### Deployment Failed
```
Error: Insufficient funds
```

**Solution:**
1. Check deployer wallet has enough testnet ETH
2. Get more from [faucet](https://faucet.quicknode.com/arbitrum/sepolia)
3. Verify `PRIVATE_KEY` is correct

#### Contract Verification Failed
```
Error: Contract already verified
```

**Solution:**
- Contract is already verified, skip this step
- Or verify manually on Arbiscan

### CLI Issues

#### Cannot Connect to RPC
```
Error: Connection refused
```

**Solution:**
1. Check RPC URL is correct: `https://sepolia-rollup.arbitrum.io/rpc`
2. Try alternative RPC: `https://arbitrum-sepolia.publicnode.com`
3. Check internet connection

### Common Errors

#### Environment Variable Missing
Always check `.env` files match the examples and all required variables are set.

#### Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

#### Memory Issues
```
JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## Tear Down Staging Environment

When you need to clean up the staging environment:

### 1. Vercel Projects

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. For each project (landing, webapp):
   - Click project → Settings → Advanced
   - Scroll to "Delete Project"
   - Confirm deletion

### 2. Railway Services

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on staging project
3. For each service:
   - Click service → Settings
   - Scroll to "Danger Zone"
   - Click "Delete Service"
4. Delete entire project when all services removed

### 3. Smart Contracts

**Note**: You cannot delete smart contracts from the blockchain, but you can:

1. Transfer ownership to a burn address
2. Pause contracts (if pausable)
3. Withdraw any test tokens

```javascript
// Transfer ownership
await contract.transferOwnership("0x000000000000000000000000000000000000dEaD");
```

### 4. Clean Local Files

```bash
# Remove build artifacts
npm run clean

# Remove deployments
rm -rf contracts/deployments/sepolia.json

# Remove .env files
rm .env
rm contracts/.env
rm backend/.env
rm frontend/webapp/.env
```

### 5. Delete Staging Branch (Optional)

```bash
# Switch to main
git checkout main

# Delete staging branch locally
git branch -D staging

# Delete remote staging branch
git push origin --delete staging
```

## Next Steps

After deploying to staging:

1. **Testing**: Run comprehensive tests using the testing procedures above
2. **Documentation**: Update this guide with any changes or learnings
3. **Monitoring**: Set up monitoring and alerting:
   - Railway: Built-in metrics
   - Vercel: Analytics dashboard
   - Sentry: Error tracking (optional)
4. **CI/CD**: Use the GitHub Actions workflow for automated deployments
5. **Security**: Review security settings before production:
   - Rotate all secrets
   - Enable 2FA on all accounts
   - Review CORS settings
   - Audit smart contracts

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Railway/Vercel logs
3. Check GitHub Issues
4. Contact the team on Discord/Slack

---

**Last Updated**: 2024-02-24
**Maintained By**: ChuloBots Team
