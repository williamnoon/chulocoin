# ChuloBots Quick Reference Guide

Quick reference for common staging deployment operations.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Deploy to Staging](#deploy-to-staging)
- [Verify Deployment](#verify-deployment)
- [Update Services](#update-services)
- [Database Operations](#database-operations)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)

## Initial Setup

### First Time Setup

```bash
# Run interactive setup wizard
./scripts/setup-staging.sh

# Or follow manual guide
cat STAGING_DEPLOYMENT.md
```

### Prerequisites Checklist

```bash
# Install Node.js 20+
node --version

# Install dependencies
npm install

# Install CLI tools
npm i -g @railway/cli
npm i -g vercel
npm i -g @github/gh
```

## Deploy to Staging

### Automated Deployment (Recommended)

```bash
# Push to staging branch
git checkout staging
git add .
git commit -m "Deploy to staging"
git push origin staging

# Or manually trigger
gh workflow run deploy-staging.yml
```

### Manual Deployment

**1. Deploy Contracts:**

```bash
cd contracts
npm run deploy:sepolia
cd ..
```

**2. Deploy Backend:**

```bash
cd backend
railway login
railway link
railway up
cd ..
```

**3. Deploy Frontend:**

```bash
# Landing page
cd frontend/landing
vercel --prod
cd ../..

# WebApp
cd frontend/webapp
vercel --prod
cd ../..
```

## Verify Deployment

### Quick Verification

```bash
# Run verification script
./scripts/verify-staging.sh

# With custom URLs
BACKEND_URL=https://your-backend.railway.app \
./scripts/verify-staging.sh
```

### Manual Checks

```bash
# Check backend health
curl https://your-backend.railway.app/health

# Check API
curl https://your-backend.railway.app/api/signals/pending

# Check contracts
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xYourContractAddress","latest"],"id":1}'
```

## Update Services

### Update Backend

```bash
# Via Railway CLI
cd backend
railway up

# Or push to trigger auto-deploy
git push origin staging
```

### Update Frontend

```bash
# Landing
cd frontend/landing
vercel --prod

# WebApp
cd frontend/webapp
vercel --prod
```

### Update Contracts (Careful!)

```bash
# Deploy new version
cd contracts
npm run deploy:sepolia

# Update addresses in backend/frontend
# Update Railway/Vercel environment variables
```

## Database Operations

### Run Migrations

```bash
railway run npm run db:migrate
```

### Seed Database

```bash
# Staging seed data
railway run npm run db:seed:staging

# Or development seed
railway run npm run db:seed
```

### Access Database

```bash
# Via Prisma Studio
railway run npm run db:studio

# Or connect directly
railway run psql $DATABASE_URL
```

### Backup Database

```bash
# Export database
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
railway run psql $DATABASE_URL < backup-20240224.sql
```

### Reset Database (CAUTION!)

```bash
# This will delete all data
railway run npm run db:migrate:reset
railway run npm run db:seed:staging
```

## Monitoring

### View Logs

**Backend (Railway):**

```bash
railway logs --service backend

# Follow logs
railway logs --service backend --follow
```

**Frontend (Vercel):**

```bash
vercel logs https://your-webapp.vercel.app

# Or via dashboard
open https://vercel.com/your-team/your-project
```

### Check Status

```bash
# Railway services
railway status

# GitHub Actions
gh run list --workflow=deploy-staging.yml

# Vercel deployments
vercel ls
```

### Metrics

- Railway: https://railway.app/dashboard → Project → Metrics
- Vercel: https://vercel.com → Project → Analytics
- Arbiscan: https://sepolia.arbiscan.io

## Troubleshooting

### Backend Not Responding

```bash
# Check Railway logs
railway logs --service backend

# Check health
curl -v https://your-backend.railway.app/health

# Restart service
railway restart --service backend
```

### Database Connection Issues

```bash
# Check DATABASE_URL
railway variables

# Test connection
railway run node -e "require('./src/db').testConnection()"

# Check PostgreSQL status
railway status --service postgres
```

### Frontend Build Failed

```bash
# Check Vercel logs
vercel logs https://your-webapp.vercel.app

# Rebuild locally
cd frontend/webapp
npm run build

# Redeploy
vercel --prod --force
```

### Contract Interaction Issues

```bash
# Verify contract deployed
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xYourContract","latest"],"id":1}'

# Check on Arbiscan
open https://sepolia.arbiscan.io/address/0xYourContract
```

### CORS Errors

```bash
# Update ALLOWED_ORIGINS in Railway
railway variables set ALLOWED_ORIGINS="https://your-landing.vercel.app,https://your-webapp.vercel.app"

# Restart backend
railway restart
```

## Environment Variables

### View Variables

```bash
# Railway
railway variables

# Vercel
vercel env ls

# GitHub Secrets
gh secret list
```

### Set Variables

```bash
# Railway
railway variables set KEY=value

# Vercel
vercel env add KEY

# GitHub Secrets
gh secret set KEY
```

### Bulk Update

```bash
# From .env file to Railway
while IFS='=' read -r key value; do
  [[ $key =~ ^#.*$ ]] && continue
  railway variables set "$key=$value"
done < .env.staging
```

## Common Commands Reference

### Git Operations

```bash
# Create staging branch
git checkout -b staging

# Update staging
git pull origin staging

# Deploy
git push origin staging

# Tag release
git tag -a v0.1.0-staging -m "Staging release v0.1.0"
git push origin v0.1.0-staging
```

### npm Scripts

```bash
# Development
npm run dev              # Start all dev servers
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all packages

# Backend specific
npm run db:migrate       # Run migrations
npm run db:seed:staging  # Seed staging data
npm run db:studio        # Open Prisma Studio

# Contracts specific
npm run compile          # Compile contracts
npm run deploy:sepolia   # Deploy to Sepolia
npm run test             # Test contracts
```

### Railway CLI

```bash
railway login                    # Login to Railway
railway link                     # Link to project
railway up                       # Deploy current directory
railway logs                     # View logs
railway run <command>            # Run command in Railway environment
railway variables                # List variables
railway variables set KEY=value  # Set variable
railway status                   # Check service status
railway restart                  # Restart service
```

### Vercel CLI

```bash
vercel login          # Login to Vercel
vercel link           # Link to project
vercel               # Deploy to preview
vercel --prod        # Deploy to production
vercel logs          # View logs
vercel env ls        # List environment variables
vercel env add       # Add environment variable
vercel ls            # List deployments
vercel inspect       # Inspect deployment
```

### GitHub CLI

```bash
gh auth login                              # Login to GitHub
gh workflow list                           # List workflows
gh workflow run deploy-staging.yml         # Trigger workflow
gh run list                                # List workflow runs
gh run watch                               # Watch current run
gh run view --log-failed                   # View failed logs
gh secret list                             # List secrets
gh secret set KEY                          # Set secret
```

## Useful URLs

### Dashboards

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- GitHub Actions: https://github.com/your-org/chulobots/actions
- Arbiscan Sepolia: https://sepolia.arbiscan.io

### Documentation

- Full Guide: [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Secrets: [.github/SECRETS.md](./.github/SECRETS.md)
- Scripts: [scripts/README.md](./scripts/README.md)

### Testnet Resources

- Arbitrum Sepolia Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Arbitrum Bridge: https://bridge.arbitrum.io/
- Chainlink Docs: https://docs.chain.link/
- Arbiscan: https://sepolia.arbiscan.io

## Tips & Best Practices

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop and test locally
npm run dev
npm run test

# 3. Merge to staging
git checkout staging
git merge feature/my-feature

# 4. Deploy to staging
git push origin staging

# 5. Test on staging
./scripts/verify-staging.sh

# 6. Merge to main (production)
git checkout main
git merge staging
git push origin main
```

### Safety Checklist

- [ ] Always test locally first
- [ ] Run tests before deploying
- [ ] Verify on staging before production
- [ ] Backup database before migrations
- [ ] Keep deployment notes
- [ ] Monitor logs after deployment
- [ ] Have rollback plan ready

### Performance Tips

- Use Railway Redis for caching
- Enable Vercel Edge Functions
- Optimize images with Vercel Image Optimization
- Use PostgreSQL connection pooling
- Monitor Railway metrics
- Set up CDN for static assets

### Security Tips

- Rotate secrets regularly
- Use environment-specific keys
- Never commit secrets to git
- Enable 2FA on all accounts
- Review CORS settings
- Audit dependencies regularly
- Monitor for vulnerabilities

## Getting Help

1. Check documentation: [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md)
2. Run verification: `./scripts/verify-staging.sh`
3. Check logs: `railway logs` or `vercel logs`
4. Search issues: https://github.com/your-org/chulobots/issues
5. Ask team on Slack/Discord

---

**Last Updated**: 2024-02-24
**Maintained By**: ChuloBots Team
