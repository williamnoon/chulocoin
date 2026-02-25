# ChuloBots Staging Deployment Checklist

Use this checklist when deploying to the staging environment. Check off each item as you complete it.

## Pre-Deployment Setup

### Prerequisites

- [ ] Node.js 20+ installed
- [ ] npm 10+ installed
- [ ] Git installed and configured
- [ ] Access to GitHub repository
- [ ] Access to Railway account
- [ ] Access to Vercel account
- [ ] Testnet wallet with 0.5 ETH on Arbitrum Sepolia

### Accounts Setup

- [ ] Railway account created and verified
- [ ] Vercel account created and verified
- [ ] Arbiscan account created
- [ ] Arbiscan API key obtained
- [ ] GitHub CLI installed (`gh` command)

### Repository Setup

- [ ] Repository cloned locally
- [ ] All dependencies installed (`npm install`)
- [ ] All tests passing (`npm test`)
- [ ] Staging branch created (`git checkout -b staging`)

## Step 1: Smart Contract Deployment

### Pre-Deployment

- [ ] `contracts/.env` file created
- [ ] `PRIVATE_KEY` set in contracts/.env
- [ ] `ARBITRUM_SEPOLIA_RPC_URL` set
- [ ] `ARBISCAN_API_KEY` set
- [ ] Deployer wallet has testnet ETH (check balance)
- [ ] Contracts compile successfully (`npm run compile`)
- [ ] Contract tests pass (`npm test`)

### Deployment

- [ ] Deploy contracts to Arbitrum Sepolia (`npm run deploy:sepolia`)
- [ ] Deployment successful (no errors)
- [ ] Deployment file created (`contracts/deployments/sepolia.json`)
- [ ] Contract addresses recorded:
  - [ ] CHULO Token: `0x_______________`
  - [ ] ChainlinkPriceOracle: `0x_______________`
  - [ ] TierNFT: `0x_______________`
  - [ ] ValidatorStaking: `0x_______________`
  - [ ] SignalRegistry: `0x_______________`

### Verification

- [ ] Contracts verified on Arbiscan
- [ ] View contracts on Arbiscan - all verified
- [ ] Test interaction with contracts (optional)

## Step 2: Backend Deployment to Railway

### Railway Project Setup

- [ ] New Railway project created
- [ ] Project linked to GitHub repository
- [ ] Staging branch selected
- [ ] Root directory set to `backend`

### Database Setup

- [ ] PostgreSQL database added to project
- [ ] Database provisioned successfully
- [ ] `DATABASE_URL` available in variables
- [ ] Redis added to project
- [ ] Redis provisioned successfully
- [ ] `REDIS_URL` available in variables

### Environment Variables

Configure all backend environment variables in Railway:

**Basic Config:**

- [ ] `NODE_ENV=staging`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` (from Railway PostgreSQL)
- [ ] `REDIS_URL` (from Railway Redis)

**Security:**

- [ ] `JWT_SECRET` (generated with `openssl rand -hex 32`)
- [ ] `JWT_EXPIRATION=7d`
- [ ] `ENCRYPTION_KEY` (generated with `openssl rand -hex 32`)

**CORS:**

- [ ] `ALLOWED_ORIGINS` (will update after frontend deployment)

**Contract Addresses:**

- [ ] `CHULO_ADDRESS`
- [ ] `SIGNAL_REGISTRY_ADDRESS`
- [ ] `VALIDATOR_STAKING_ADDRESS`
- [ ] `TIER_NFT_ADDRESS`

**Blockchain:**

- [ ] `ARBITRUM_SEPOLIA_RPC`
- [ ] `ORACLE_CONTRACT_ADDRESS`
- [ ] `CHAINLINK_PRICE_FEED_BTC`
- [ ] `CHAINLINK_PRICE_FEED_ETH`

**Exchange APIs:**

- [ ] `HYPERLIQUID_API_KEY`
- [ ] `BINANCE_API_KEY`
- [ ] `BINANCE_API_SECRET`
- [ ] `COINBASE_API_KEY`
- [ ] `COINBASE_API_SECRET`

### Deployment

- [ ] Backend deployed successfully
- [ ] Build logs show no errors
- [ ] Service is running
- [ ] Public URL generated
- [ ] Backend URL recorded: `https://_______________`

### Database Migration

- [ ] Railway CLI installed (`npm i -g @railway/cli`)
- [ ] Logged into Railway (`railway login`)
- [ ] Project linked (`railway link`)
- [ ] Migrations run (`railway run npm run db:migrate`)
- [ ] No migration errors
- [ ] Database seeded (`railway run npm run db:seed:staging`)
- [ ] Seed data created successfully

### Verification

- [ ] Visit health endpoint: `https://[backend-url]/health`
- [ ] Returns `{"status":"ok"}`
- [ ] Check Railway logs - no errors
- [ ] Test API endpoints:
  - [ ] `/api/signals/pending` responds
  - [ ] `/api/users` responds (might be 401 - that's OK)
- [ ] WebSocket endpoint responding

## Step 3: Frontend Deployment to Vercel

### Landing Page Deployment

**Vercel Project Setup:**

- [ ] New Vercel project created
- [ ] Repository imported
- [ ] Framework preset: Next.js
- [ ] Root directory: `frontend/landing`
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

**Environment Variables:**

- [ ] `NEXT_PUBLIC_API_URL` (Railway backend URL)
- [ ] `NEXT_PUBLIC_WEBAPP_URL` (will update after webapp deployment)
- [ ] `NEXT_PUBLIC_CHAIN_ID=421614`

**Deployment:**

- [ ] Deployed successfully
- [ ] Build logs show no errors
- [ ] Landing URL generated
- [ ] Landing URL recorded: `https://_______________`
- [ ] Visit landing page - loads correctly

### WebApp Deployment

**Vercel Project Setup:**

- [ ] New Vercel project created
- [ ] Repository imported
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend/webapp`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

**Environment Variables:**

- [ ] `VITE_API_URL` (Railway backend URL)
- [ ] `VITE_WS_URL` (Railway backend URL with wss://)
- [ ] `VITE_CHULO_ADDRESS`
- [ ] `VITE_SIGNAL_REGISTRY_ADDRESS`
- [ ] `VITE_VALIDATOR_STAKING_ADDRESS`
- [ ] `VITE_CHAIN_ID=421614`
- [ ] `VITE_CHAIN_NAME=Arbitrum Sepolia`
- [ ] `VITE_RPC_URL`
- [ ] `VITE_BLOCK_EXPLORER=https://sepolia.arbiscan.io`
- [ ] `VITE_ENABLE_TESTNET_WARNING=true`

**Deployment:**

- [ ] Deployed successfully
- [ ] Build logs show no errors
- [ ] WebApp URL generated
- [ ] WebApp URL recorded: `https://_______________`
- [ ] Visit webapp - loads correctly

### Update Backend CORS

- [ ] Go to Railway backend environment variables
- [ ] Update `ALLOWED_ORIGINS` with both Vercel URLs
- [ ] Redeploy backend
- [ ] Verify CORS working (no console errors in frontend)

### Update Landing Page Link

- [ ] Update `NEXT_PUBLIC_WEBAPP_URL` in landing page
- [ ] Redeploy landing page
- [ ] Test navigation from landing to webapp

## Step 4: GitHub Actions Setup

### Repository Secrets

Configure in: **Settings → Secrets and variables → Actions**

**Contracts:**

- [ ] `DEPLOYER_PRIVATE_KEY_TESTNET`
- [ ] `ARBISCAN_API_KEY`

**Railway:**

- [ ] `RAILWAY_TOKEN`
- [ ] `RAILWAY_DOMAIN`

**Vercel:**

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID_LANDING`
- [ ] `VERCEL_PROJECT_ID_WEBAPP`
- [ ] `VERCEL_LANDING_DOMAIN`
- [ ] `VERCEL_WEBAPP_DOMAIN`

**Notifications (Optional):**

- [ ] `SLACK_WEBHOOK_URL`
- [ ] `DISCORD_WEBHOOK_URL`

### Test Workflow

- [ ] Push staging branch to GitHub
- [ ] GitHub Actions workflow triggers
- [ ] All jobs complete successfully
- [ ] Check deployment summary in Actions tab
- [ ] Verify services updated

## Step 5: Verification

### Automated Verification

- [ ] Run verification script: `./scripts/verify-staging.sh`
- [ ] All checks pass
- [ ] No error messages

### Manual Verification

**Smart Contracts:**

- [ ] Visit Arbiscan Sepolia
- [ ] All contracts visible and verified
- [ ] Can read contract state

**Backend API:**

- [ ] Health check: `https://[backend]/health` returns OK
- [ ] API endpoints responding
- [ ] Check Railway logs - no errors
- [ ] Database connected
- [ ] Redis connected

**Frontend Landing:**

- [ ] Landing page loads
- [ ] All sections visible
- [ ] Links work
- [ ] Images load
- [ ] Responsive on mobile

**Frontend WebApp:**

- [ ] WebApp loads
- [ ] Can connect wallet
- [ ] Switch to Arbitrum Sepolia works
- [ ] Dashboard displays
- [ ] Signals page works
- [ ] Real-time updates working (WebSocket)

### End-to-End Testing

**Test User Flow:**

- [ ] Connect wallet to webapp
- [ ] View available signals
- [ ] Check signal details
- [ ] View user profile
- [ ] Check tier information

**Test Signal Flow:**

- [ ] View pending signals
- [ ] View validated signals
- [ ] Check signal validation status
- [ ] Verify real-time updates

**Test Position Tracking:**

- [ ] View open positions
- [ ] Check position details
- [ ] Verify P&L calculations
- [ ] View trade history

## Step 6: Documentation

### Update Documentation

- [ ] Record all URLs in `.env.staging`
- [ ] Update `STAGING_DEPLOYMENT.md` if needed
- [ ] Document any issues encountered
- [ ] Update team wiki/docs with deployment info

### Share with Team

- [ ] Share staging URLs with team
- [ ] Provide test wallet addresses
- [ ] Share login credentials (if any)
- [ ] Schedule demo/walkthrough

## Post-Deployment

### Monitoring Setup

- [ ] Check Railway metrics dashboard
- [ ] Check Vercel analytics
- [ ] Set up error monitoring (Sentry, optional)
- [ ] Configure uptime monitoring (optional)

### Testing

- [ ] Run full test suite
- [ ] Perform load testing (optional)
- [ ] Test all user flows
- [ ] Test edge cases

### Security Review

- [ ] Verify all secrets are set correctly
- [ ] Check CORS configuration
- [ ] Review rate limiting settings
- [ ] Audit API endpoints
- [ ] Check for exposed sensitive data

## Rollback Plan

If deployment fails, document rollback steps:

- [ ] Keep previous deployment file
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Update runbook

## Sign-Off

Deployment completed by: **\*\***\_\_\_**\*\***

Date: **\*\***\_\_\_**\*\***

Verified by: **\*\***\_\_\_**\*\***

Date: **\*\***\_\_\_**\*\***

## Notes

Document any issues, deviations, or important information:

```
[Your notes here]
```

---

## Quick Reference

**Staging URLs:**

- Backend: `https://_______________`
- Landing: `https://_______________`
- WebApp: `https://_______________`
- Arbiscan: `https://sepolia.arbiscan.io`

**Contract Addresses:**

- CHULO: `0x_______________`
- SignalRegistry: `0x_______________`
- ValidatorStaking: `0x_______________`

**Test Wallets:**

- Observer: `0x1111111111111111111111111111111111111111`
- Bronze: `0x2222222222222222222222222222222222222222`
- Silver: `0x3333333333333333333333333333333333333333`
- Gold: `0x4444444444444444444444444444444444444444`
- Diamond: `0x5555555555555555555555555555555555555555`

**Support:**

- See `STAGING_DEPLOYMENT.md` for detailed instructions
- See `.github/SECRETS.md` for secrets configuration
- Run `./scripts/verify-staging.sh` for automated checks
