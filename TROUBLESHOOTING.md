# ChuloBots Staging Troubleshooting Guide

Common issues and their solutions when deploying to staging.

## Table of Contents

- [Smart Contract Issues](#smart-contract-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Deployment Issues](#deployment-issues)
- [Network Issues](#network-issues)
- [GitHub Actions Issues](#github-actions-issues)

## Smart Contract Issues

### Contract Deployment Failed: Insufficient Funds

**Error:**

```
Error: insufficient funds for gas * price + value
```

**Solution:**

```bash
# Check wallet balance
cast balance 0xYourWalletAddress --rpc-url https://sepolia-rollup.arbitrum.io/rpc

# Get testnet ETH from faucet
open https://faucet.quicknode.com/arbitrum/sepolia

# Or bridge from Ethereum Sepolia
open https://bridge.arbitrum.io/?destinationChain=arbitrum-sepolia
```

### Contract Verification Failed

**Error:**

```
Error: Contract already verified or verification failed
```

**Solution:**

```bash
# Wait 30 seconds after deployment
sleep 30

# Try verification again
npx hardhat verify --network arbitrumSepolia CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"

# If already verified, skip - contract is already public
```

### Cannot Read Contract State

**Error:**

```
Error: call revert exception
```

**Solution:**

```bash
# Verify contract address is correct
echo $CHULO_ADDRESS

# Check contract exists on blockchain
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CHULO_ADDRESS\",\"latest\"],\"id\":1}"

# Verify ABI matches deployed contract
cd contracts
npm run compile
```

### Wrong Network Error

**Error:**

```
Error: network does not match signer
```

**Solution:**

```bash
# Check hardhat config network
cat contracts/hardhat.config.ts | grep arbitrumSepolia

# Verify RPC URL is correct
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: 421614 (Arbitrum Sepolia)
```

## Backend Issues

### Backend Health Check Failed

**Error:**

```
curl: (7) Failed to connect to backend.railway.app
```

**Solution:**

```bash
# Check Railway deployment status
railway status

# Check logs for errors
railway logs --service backend

# Verify service is running
railway ps

# If crashed, check for startup errors
railway logs --service backend | grep -i error

# Restart service
railway restart
```

### Database Connection Error

**Error:**

```
P1001: Can't reach database server at `host:port`
```

**Solution:**

```bash
# Check DATABASE_URL is set
railway variables | grep DATABASE_URL

# Verify PostgreSQL service is running
railway status --service postgres

# Test connection
railway run node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected')).catch(e => console.error(e))"

# If PostgreSQL not found, add it
railway add --database postgresql
```

### Redis Connection Error

**Error:**

```
Error: Redis connection timeout
```

**Solution:**

```bash
# Check REDIS_URL is set
railway variables | grep REDIS_URL

# Verify Redis service is running
railway status --service redis

# If Redis not found, add it
railway add --database redis

# Ensure backend can reach Redis
railway run node -e "const redis = require('redis'); const client = redis.createClient({url: process.env.REDIS_URL}); client.connect().then(() => console.log('Connected')).catch(e => console.error(e))"
```

### API Endpoints Return 500 Error

**Error:**

```
HTTP 500 Internal Server Error
```

**Solution:**

```bash
# Check backend logs for stack trace
railway logs --service backend --follow

# Common causes:
# 1. Missing environment variables
railway variables

# 2. Database migration not run
railway run npm run db:migrate

# 3. Invalid contract addresses
railway variables | grep ADDRESS

# 4. Missing dependencies
railway run npm install

# Restart after fixing
railway restart
```

### CORS Errors in Frontend

**Error:**

```
Access to fetch at 'https://backend.railway.app' from origin 'https://webapp.vercel.app' has been blocked by CORS
```

**Solution:**

```bash
# Update ALLOWED_ORIGINS in Railway
railway variables set ALLOWED_ORIGINS="https://your-landing.vercel.app,https://your-webapp.vercel.app"

# Include both landing and webapp URLs
# No trailing slashes
# Comma-separated, no spaces

# Restart backend
railway restart

# Verify in browser console - no more CORS errors
```

### JWT Authentication Errors

**Error:**

```
401 Unauthorized: Invalid token
```

**Solution:**

```bash
# Check JWT_SECRET is set and same across deployments
railway variables | grep JWT_SECRET

# Regenerate if needed
JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_SECRET=$JWT_SECRET

# Clear browser cookies/localStorage
# Login again
```

## Frontend Issues

### Frontend Build Failed on Vercel

**Error:**

```
Error: Build failed with exit code 1
```

**Solution:**

```bash
# Test build locally first
cd frontend/webapp
npm run build

# Common causes:

# 1. Missing environment variables
vercel env ls

# 2. TypeScript errors
npm run type-check

# 3. Lint errors
npm run lint

# 4. Import errors
# Check all imports use correct paths

# Force redeploy after fixing
vercel --prod --force
```

### Environment Variables Not Available

**Error:**

```
Uncaught ReferenceError: process is not defined
or
import.meta.env.VITE_API_URL is undefined
```

**Solution:**

```bash
# For Vite (webapp), use VITE_ prefix
vercel env add VITE_API_URL production

# For Next.js (landing), use NEXT_PUBLIC_ prefix
vercel env add NEXT_PUBLIC_API_URL production

# Redeploy to pick up new variables
vercel --prod

# In code, access via:
# Vite: import.meta.env.VITE_API_URL
# Next.js: process.env.NEXT_PUBLIC_API_URL
```

### Cannot Connect to Backend API

**Error:**

```
Failed to fetch
Network request failed
```

**Solution:**

```bash
# 1. Verify backend URL is correct
echo $VITE_API_URL

# 2. Check backend is running
curl https://your-backend.railway.app/health

# 3. Check CORS configuration
# See CORS Errors section above

# 4. Check browser console for exact error
# Open DevTools → Console → Network tab

# 5. Verify API URL in Vercel
vercel env ls
```

### WebSocket Connection Failed

**Error:**

```
WebSocket connection to 'wss://backend.railway.app' failed
```

**Solution:**

```bash
# 1. Verify WebSocket URL uses wss://
echo $VITE_WS_URL  # Should be wss://, not https://

# 2. Check backend supports WebSocket
railway logs | grep -i websocket

# 3. Verify Socket.io is running
curl https://your-backend.railway.app/socket.io/

# 4. Update WS_URL if needed
vercel env add VITE_WS_URL production
# Value: wss://your-backend.railway.app

# 5. Check Railway proxy settings
# Railway should support WebSocket by default
```

### Wrong Network in MetaMask

**Error:**

```
Wrong network. Please switch to Arbitrum Sepolia
```

**Solution:**

```javascript
// Add Arbitrum Sepolia to MetaMask
const chainId = '0x66eee'; // 421614 in hex

try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });
} catch (switchError) {
  // Chain not added, add it
  if (switchError.code === 4902) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId,
          chainName: 'Arbitrum Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
          blockExplorerUrls: ['https://sepolia.arbiscan.io'],
        },
      ],
    });
  }
}
```

## Database Issues

### Migration Failed

**Error:**

```
Error: Migration failed to apply
```

**Solution:**

```bash
# Check migration status
railway run npx prisma migrate status

# If stuck, try pushing schema directly (DEV ONLY)
railway run npx prisma db push

# Or reset (CAUTION: DELETES ALL DATA)
railway run npx prisma migrate reset

# Then run migrations
railway run npm run db:migrate

# Seed data
railway run npm run db:seed:staging
```

### Database Schema Out of Sync

**Error:**

```
Error: Table X doesn't exist
```

**Solution:**

```bash
# Generate Prisma client
railway run npx prisma generate

# Push schema to database
railway run npx prisma db push

# Or run migrations
railway run npm run db:migrate

# Verify schema
railway run npx prisma db pull
```

### Too Many Database Connections

**Error:**

```
Error: Too many connections
```

**Solution:**

```bash
# Check connection pool settings in Prisma
cat backend/prisma/schema.prisma | grep -A5 datasource

# Add connection pooling
# In schema.prisma:
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
#   connectionLimit = 5
# }

# Or use connection pooler in Railway
# Railway → PostgreSQL → Enable Connection Pooling
```

### Seed Data Already Exists

**Error:**

```
Unique constraint violation
```

**Solution:**

```bash
# Use upsert instead of create in seed file
# Already done in seed-staging.ts

# Or clear database first
railway run npx prisma migrate reset

# Then seed
railway run npm run db:seed:staging
```

## Deployment Issues

### GitHub Actions Workflow Failed

**Error:**

```
Process completed with exit code 1
```

**Solution:**

```bash
# View detailed logs
gh run view --log-failed

# Common causes:

# 1. Missing secrets
gh secret list
# Add missing secrets

# 2. Test failures
# Fix tests locally first

# 3. Build errors
# Test build locally

# 4. Deployment errors
# Check Railway/Vercel logs

# Re-run workflow
gh run rerun
```

### Railway Deployment Stuck

**Error:**

```
Deployment in progress for 10+ minutes
```

**Solution:**

```bash
# Cancel current deployment
railway service cancel-deployment

# Check for issues
railway logs

# Redeploy
railway up

# If still stuck, contact Railway support
open https://railway.app/help
```

### Vercel Deployment Failed

**Error:**

```
Deployment failed: Build exceeded maximum duration
```

**Solution:**

```bash
# Optimize build
# 1. Check for large dependencies
npm ls --depth=0

# 2. Use build cache
# Vercel should cache automatically

# 3. Reduce bundle size
# Check bundle analyzer

# 4. Contact Vercel support for limit increase
open https://vercel.com/support
```

### Secret Not Found in GitHub Actions

**Error:**

```
Error: Secret VERCEL_TOKEN not found
```

**Solution:**

```bash
# List secrets
gh secret list

# Add missing secret
gh secret set VERCEL_TOKEN

# Verify secret name matches workflow
cat .github/workflows/deploy-staging.yml | grep VERCEL_TOKEN

# Re-run workflow
gh run rerun
```

## Network Issues

### RPC Request Failed

**Error:**

```
Error: could not detect network
```

**Solution:**

```bash
# Test RPC connection
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Try alternative RPC
# https://arbitrum-sepolia.publicnode.com
# https://arbitrum-sepolia.blockpi.network/v1/rpc/public

# Update RPC URL
railway variables set ARBITRUM_SEPOLIA_RPC=https://arbitrum-sepolia.publicnode.com
```

### Rate Limited by RPC

**Error:**

```
Error: Rate limit exceeded
```

**Solution:**

```bash
# Use Alchemy or Infura
# 1. Sign up for free tier
# 2. Get API key
# 3. Update RPC URL

# Alchemy
RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Infura
RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID

# Update in Railway
railway variables set ARBITRUM_SEPOLIA_RPC=$RPC_URL
```

### Slow Network Requests

**Issue:**
API requests taking 5+ seconds

**Solution:**

```bash
# 1. Check Railway region
# Deploy backend in same region as your users

# 2. Use Vercel Edge Functions
# Move API calls to edge

# 3. Enable caching
# Use Redis for frequently accessed data

# 4. Optimize queries
# Add database indexes
# Use select to limit fields

# 5. Use CDN
# Vercel automatically uses CDN for static assets
```

## GitHub Actions Issues

### Workflow Not Triggering

**Issue:**
Pushing to staging branch doesn't trigger workflow

**Solution:**

```bash
# 1. Check workflow file syntax
cat .github/workflows/deploy-staging.yml

# 2. Verify branch name
git branch --show-current

# 3. Check workflow is enabled
gh workflow list

# 4. Manually trigger
gh workflow run deploy-staging.yml

# 5. Check GitHub Actions logs
gh run list
```

### Permission Denied in Workflow

**Error:**

```
Error: Resource not accessible by integration
```

**Solution:**

```bash
# Add permissions to workflow file
# In .github/workflows/deploy-staging.yml:
#
# permissions:
#   contents: read
#   deployments: write
#   pull-requests: write

# Commit and push
git add .github/workflows/deploy-staging.yml
git commit -m "Add workflow permissions"
git push
```

### Deployment Timeout

**Error:**

```
Error: The operation was canceled
```

**Solution:**

```bash
# Increase timeout in workflow
# In .github/workflows/deploy-staging.yml:
#
# jobs:
#   deploy:
#     timeout-minutes: 30  # Increase from default 360

# Or split into smaller jobs
# Deploy contracts, backend, frontend separately
```

## Still Having Issues?

If you're still experiencing problems:

1. **Check logs thoroughly:**

   ```bash
   railway logs --service backend --follow
   vercel logs --follow
   gh run view --log-failed
   ```

2. **Review documentation:**
   - [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md)
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
   - [.github/SECRETS.md](./.github/SECRETS.md)

3. **Run verification:**

   ```bash
   ./scripts/verify-staging.sh
   ```

4. **Search existing issues:**

   ```bash
   gh issue list --search "your error message"
   ```

5. **Create new issue:**

   ```bash
   gh issue create --title "Deployment issue: brief description" --body "Full error details"
   ```

6. **Ask team:**
   - Slack: #chulobots-dev
   - Discord: ChuloBots server
   - Email: dev@chulobots.com

---

**Last Updated**: 2024-02-24
**Maintained By**: ChuloBots Team
