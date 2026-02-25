# ChuloBots Scripts

Utility scripts for deployment, testing, and maintenance.

## Available Scripts

### Staging Deployment

#### `verify-staging.sh`

Comprehensive verification of staging environment deployment.

```bash
./scripts/verify-staging.sh
```

Checks:

- Smart contract deployment on Arbitrum Sepolia
- Backend API health and endpoints
- Frontend landing page accessibility
- Frontend webapp accessibility
- WebSocket connectivity
- Blockchain RPC connectivity

**Custom URLs:**

```bash
BACKEND_URL=https://your-backend.railway.app \
FRONTEND_LANDING_URL=https://your-landing.vercel.app \
FRONTEND_WEBAPP_URL=https://your-webapp.vercel.app \
./scripts/verify-staging.sh
```

#### `setup-staging.sh`

Interactive setup wizard for staging environment.

```bash
./scripts/setup-staging.sh
```

Guides you through:

1. Creating Railway project
2. Deploying smart contracts
3. Configuring environment variables
4. Deploying to Vercel
5. Verifying deployment

### Database Management

#### `backup-db.sh`

Backup production or staging database.

```bash
# Backup staging database
./scripts/backup-db.sh staging

# Backup production database
./scripts/backup-db.sh production
```

#### `restore-db.sh`

Restore database from backup.

```bash
./scripts/restore-db.sh backup-file.sql staging
```

### Contract Management

#### `deploy-contracts.sh`

Deploy smart contracts to specified network.

```bash
# Deploy to Arbitrum Sepolia
./scripts/deploy-contracts.sh sepolia

# Deploy to Arbitrum mainnet
./scripts/deploy-contracts.sh mainnet
```

### Monitoring

#### `health-check.sh`

Quick health check of all services.

```bash
./scripts/health-check.sh
```

#### `generate-report.sh`

Generate deployment status report.

```bash
./scripts/generate-report.sh > deployment-report.txt
```

## Usage

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

Run any script:

```bash
./scripts/<script-name>.sh
```

## Environment Variables

Scripts use these environment variables (with defaults):

```bash
# Backend
BACKEND_URL=https://your-backend.railway.app

# Frontend
FRONTEND_LANDING_URL=https://your-landing.vercel.app
FRONTEND_WEBAPP_URL=https://your-webapp.vercel.app

# Blockchain
CHAIN_ID=421614
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Deployment file
DEPLOYMENT_FILE=contracts/deployments/sepolia.json
```

Override by setting environment variables:

```bash
BACKEND_URL=https://custom.railway.app ./scripts/verify-staging.sh
```

## Requirements

Required tools:

- `curl` - HTTP requests
- `jq` - JSON parsing (optional but recommended)
- `node` - For some scripts
- `npm` - Package management

## Contributing

When adding new scripts:

1. Add shebang: `#!/bin/bash`
2. Set strict mode: `set -e`
3. Add description in header comment
4. Document usage in this README
5. Make executable: `chmod +x scripts/your-script.sh`

## Support

For issues with scripts, see [STAGING_DEPLOYMENT.md](../STAGING_DEPLOYMENT.md) troubleshooting section.
