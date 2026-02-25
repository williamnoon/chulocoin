# GitHub Secrets Configuration

This document lists all required GitHub secrets for CI/CD workflows.

## Required Secrets

Configure these secrets in: **Settings → Secrets and variables → Actions**

### Contract Deployment

| Secret Name | Description | How to Get | Example |
|-------------|-------------|------------|---------|
| `DEPLOYER_PRIVATE_KEY_TESTNET` | Private key for deploying to testnet | Create new wallet with testnet ETH | `0x1234...` |
| `DEPLOYER_PRIVATE_KEY_MAINNET` | Private key for deploying to mainnet | Create new wallet with mainnet ETH | `0x5678...` |
| `ARBISCAN_API_KEY` | API key for contract verification | [arbiscan.io/myapikey](https://arbiscan.io/myapikey) | `ABC123...` |

### CI/CD Testing

| Secret Name | Description | How to Get | Example |
|-------------|-------------|------------|---------|
| `TC_CLOUD_TOKEN` | Testcontainers Cloud token for running PostgreSQL/Redis in CI | Testcontainers Cloud → Service Accounts | `aj_tcc_svc_xxx...` |

### Railway (Backend)

| Secret Name | Description | How to Get | Example |
|-------------|-------------|------------|---------|
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account → Tokens | `railway_xxx...` |
| `RAILWAY_DOMAIN` | Railway backend domain | After deployment | `your-backend.railway.app` |

### Vercel (Frontend)

| Secret Name | Description | How to Get | Example |
|-------------|-------------|------------|---------|
| `VERCEL_TOKEN` | Vercel API token | Vercel → Settings → Tokens | `vercel_xxx...` |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` or Vercel dashboard | `team_xxx...` |
| `VERCEL_PROJECT_ID_LANDING` | Landing page project ID | `.vercel/project.json` in landing/ | `prj_xxx...` |
| `VERCEL_PROJECT_ID_WEBAPP` | WebApp project ID | `.vercel/project.json` in webapp/ | `prj_yyy...` |
| `VERCEL_LANDING_DOMAIN` | Landing page domain | After deployment | `your-landing.vercel.app` |
| `VERCEL_WEBAPP_DOMAIN` | WebApp domain | After deployment | `your-webapp.vercel.app` |

### Notifications (Optional)

| Secret Name | Description | How to Get | Example |
|-------------|-------------|------------|---------|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | Slack → Apps → Incoming Webhooks | `https://hooks.slack.com/...` |
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications | Discord → Server Settings → Integrations | `https://discord.com/api/webhooks/...` |

## Setup Instructions

### 1. Contract Deployment Keys

```bash
# Generate new wallet for testnet deployment
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Fund with testnet ETH
# Visit: https://faucet.quicknode.com/arbitrum/sepolia
```

**IMPORTANT**:
- NEVER use your personal wallet's private key
- NEVER commit private keys to git
- Use separate keys for testnet and mainnet
- Keep mainnet keys extremely secure

### 2. Arbiscan API Key

1. Go to [arbiscan.io/myapikey](https://arbiscan.io/myapikey)
2. Sign in or create account
3. Click "Add" to create new API key
4. Copy the API key
5. Add to GitHub secrets as `ARBISCAN_API_KEY`

### 3. Testcontainers Cloud Token

1. Go to [Testcontainers Cloud](https://testcontainers.cloud)
2. Sign in or create account
3. Navigate to Service Accounts
4. Create service account named "chulo" (or use existing)
5. Generate access token
6. Copy the token (format: `aj_tcc_svc_...`)
7. Add to GitHub secrets as `TC_CLOUD_TOKEN`

**Token Value:**
```
aj_tcc_svc_sIoEUgubzFu41lxHArJhC0YSwLU9jE5F5mZDciyWoumnQ
```

**Purpose:** Testcontainers Cloud runs PostgreSQL and Redis containers during CI tests, providing better reliability and management than GitHub Actions services.

**Used in:**
- `.github/workflows/ci.yml` - Backend test job

### 4. Railway Token

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions - ChuloBots"
4. Copy the token
5. Add to GitHub secrets as `RAILWAY_TOKEN`

**Get Railway Domain:**
```bash
# After first deployment
railway domain --service backend --environment staging
```

### 5. Vercel Token

1. Go to [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create"
3. Name it "GitHub Actions - ChuloBots"
4. Set scope to your team/account
5. Copy the token
6. Add to GitHub secrets as `VERCEL_TOKEN`

**Get Vercel Project IDs:**

Method 1: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link projects and get IDs
cd frontend/landing
vercel link
cat .vercel/project.json

cd ../webapp
vercel link
cat .vercel/project.json
```

Method 2: Via Vercel Dashboard
1. Go to project settings
2. URL will be: `vercel.com/<team>/<project>/settings`
3. Project ID is in the URL or settings page

**Get Vercel Organization ID:**
```bash
# From .vercel/project.json
cat .vercel/project.json | jq -r '.orgId'

# Or from Vercel dashboard URL
# URL format: vercel.com/team_xxx/project
# orgId is the team_xxx part
```

### 6. Slack Webhook (Optional)

1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create new app or use existing
3. Enable "Incoming Webhooks"
4. Click "Add New Webhook to Workspace"
5. Select channel for notifications
6. Copy webhook URL
7. Add to GitHub secrets as `SLACK_WEBHOOK_URL`

## Verifying Secrets

### Check Required Secrets

```bash
# List all secrets (requires gh CLI)
gh secret list

# Expected output:
# DEPLOYER_PRIVATE_KEY_TESTNET
# ARBISCAN_API_KEY
# TC_CLOUD_TOKEN
# RAILWAY_TOKEN
# VERCEL_TOKEN
# VERCEL_ORG_ID
# VERCEL_PROJECT_ID_LANDING
# VERCEL_PROJECT_ID_WEBAPP
# ... etc
```

### Test Workflow

```bash
# Trigger staging deployment
gh workflow run deploy-staging.yml

# Watch workflow
gh run watch

# View logs if failed
gh run view --log-failed
```

## Security Best Practices

### Private Keys
- ✅ Use dedicated deployment wallets
- ✅ Keep testnet and mainnet keys separate
- ✅ Rotate keys periodically
- ✅ Use hardware wallets for mainnet
- ❌ NEVER use personal wallet keys
- ❌ NEVER commit keys to git

### API Tokens
- ✅ Use fine-grained permissions
- ✅ Rotate tokens periodically
- ✅ Monitor token usage
- ✅ Revoke unused tokens
- ❌ NEVER share tokens
- ❌ NEVER commit tokens to git

### GitHub Secrets
- ✅ Use environment-specific secrets
- ✅ Limit workflow permissions
- ✅ Review access logs
- ✅ Use OIDC when possible
- ❌ NEVER log secrets in workflows
- ❌ NEVER expose secrets in artifacts

## Troubleshooting

### "Secret not found" Error

1. Verify secret name matches exactly (case-sensitive)
2. Check secret is in correct scope (repository, not environment)
3. Ensure workflow has permission to access secrets

### "Invalid token" Error

1. Token may have expired
2. Token may have been revoked
3. Generate new token and update secret

### "Permission denied" Error

1. Check token has required scopes
2. Verify organization/team permissions
3. Ensure repository access is configured

### "Testcontainers Cloud connection failed" Error

1. Verify TC_CLOUD_TOKEN secret is set correctly
2. Check service account "chulo" is active at testcontainers.cloud
3. Ensure token hasn't expired (regenerate if needed)
4. Verify Testcontainers Cloud service is operational
5. Check workflow logs for specific error messages

## Environment-Specific Secrets

Some secrets can be environment-specific:

**Staging Environment:**
```
Settings → Environments → staging → Secrets
```

**Production Environment:**
```
Settings → Environments → production → Secrets
```

This allows different values for staging vs production:
- Different API keys
- Different deployment keys
- Different webhook URLs

## Adding New Secrets

When adding new secrets to workflows:

1. Document in this file
2. Add to example workflows with comments
3. Update verification tests
4. Notify team members
5. Add to onboarding checklist

## Support

For issues with secrets:
1. Check this documentation
2. Review workflow logs
3. Verify secret values
4. Contact team lead

---

**Last Updated**: 2024-02-24
**Maintained By**: ChuloBots DevOps Team
