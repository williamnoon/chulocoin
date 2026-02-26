# ChuloBots Validator Node

Standalone validator node for the ChuloBots decentralized trading signal validation network.

## Overview

Validators are independent node operators who verify the quality of trading signals submitted to the network. When a user submits a signal, validators:

1. **Receive** the signal via WebSocket
2. **Backtest** the strategy independently using Chainlink price data
3. **Vote** on whether to approve or reject (>66% consensus required)
4. **Earn** 0.25 CHULO per validation + share of network burn pool

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker (optional)
- 50,000 CHULO staked (Tier 2 recommended)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your wallet and configuration

# Start validator
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t chulobots-validator .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f validator
```

## Configuration

See `.env.example` for all configuration options.

### Required Settings

```env
VALIDATOR_WALLET=0x...          # Your validator wallet address
VALIDATOR_PRIVATE_KEY=0x...     # Your wallet private key (KEEP SECRET!)
VALIDATOR_NAME=My Validator     # Your validator display name
STAKE_TIER=2                    # Your stake tier (1, 2, or 3)

ARBITRUM_RPC_URL=https://...    # Arbitrum RPC endpoint
CHAINLINK_RPC_URL=https://...   # Chainlink price feed RPC
CHULO_CONTRACT=0x...            # CHULO token contract address
STAKING_CONTRACT=0x...          # Validator staking contract
ORACLE_CONTRACT=0x...           # Chainlink oracle contract

DATABASE_URL=postgresql://...   # PostgreSQL connection string
```

## Validator Tiers

| Tier | Stake Required | Max Validations/Day | Burn Pool Share | Monthly Revenue* |
|------|---------------|---------------------|-----------------|------------------|
| **Tier 1** | 10,000 CHULO | 100 | 0% | ~$525 |
| **Tier 2** ⭐ | 50,000 CHULO | 500 | 2% | ~$4,275 |
| **Tier 3** | 200,000 CHULO | Unlimited | 5% | ~$25,650 |

*At $0.30/CHULO

**Recommended:** Tier 2 (50,000 CHULO) for optimal ROI

## Economics

### Revenue Sources

1. **Validation Rewards:** 0.25 CHULO per validation
2. **Burn Pool Share:** 2-5% of network burn pool (based on tier)

### Example: Tier 2 Validator

**Daily Earnings:**
```
Validations per day: ~300
Reward per validation: 0.25 CHULO
Daily validation rewards: 75 CHULO

Burn pool share: 2%
Daily network burns: ~20,000 CHULO
Daily burn pool earnings: 400 CHULO

Total daily earnings: 475 CHULO
At $0.30/CHULO: $142.50/day
```

**Monthly Earnings:**
```
475 CHULO/day × 30 days = 14,250 CHULO/month
At $0.30/CHULO: $4,275/month
```

**Costs:**
```
VPS hosting: $24/month
RPC API: $50/month
Total: $74/month
```

**ROI:**
```
Monthly profit: $4,201
Annual profit: $50,412
Stake value: $15,000 (50,000 CHULO @ $0.30)
Annual ROI: 336%
```

## Hardware Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- Network: 10Mbps up/down
- Uptime: >95%

### Recommended
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- Network: 100Mbps up/down
- Uptime: >99.5%

## Monitoring

### Dashboard

Access the validator dashboard at `http://localhost:3001`

Shows:
- Validator status (running/stopped)
- Total validations
- Uptime
- Recent validations
- Earnings (estimated)

### Prometheus Metrics

Metrics available at `http://localhost:3001/metrics`

- `chulobots_signals_received_total` - Total signals received
- `chulobots_validations_total` - Total validations completed
- `chulobots_votes_approve_total` - Total APPROVE votes
- `chulobots_votes_reject_total` - Total REJECT votes
- `chulobots_validation_errors_total` - Total validation errors
- `chulobots_backtest_duration_seconds` - Backtest duration histogram
- `chulobots_validation_duration_seconds` - Total validation duration histogram

### Health Check

```bash
curl http://localhost:3001/health

# Response:
{
  "healthy": true,
  "database": "ok",
  "blockchain": "ok",
  "websocket": "connected",
  "lastValidation": "2026-02-24T10:23:45Z"
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Validation Process

1. **Signal Received:** Validator receives new signal via WebSocket
2. **Backtest:** Strategy is backtested using historical price data from Chainlink
3. **Quality Check:** Signal is evaluated against quality thresholds:
   - Minimum Sharpe ratio: 1.5
   - Minimum win rate: 55%
   - Maximum drawdown: 25%
   - Minimum quality score: 70/100
   - Price verification: ±0.5% tolerance against Chainlink oracle
4. **Vote:** Validator submits APPROVE or REJECT vote on-chain
5. **Consensus:** Signal requires >66% approval to be published
6. **Reward:** Validator earns 0.25 CHULO for each validation

## Slashing & Penalties

### Slashing Conditions
- Vote against >80% majority: -1% stake
- Offline >24 hours: -0.5% stake
- Repeated failures: Up to -10% stake

**Best Practice:** Run with 99%+ uptime to avoid penalties.

## Troubleshooting

### Validator won't start
```bash
# Check logs
docker-compose logs validator

# Common issues:
# 1. Database not ready - Wait 30s, try again
# 2. Invalid wallet/private key - Verify .env
# 3. Insufficient stake - Check at app.chulobots.com/stake
```

### No validations happening
```bash
# Check WebSocket connection
docker-compose logs validator | grep "WebSocket"

# Should see: "✅ WebSocket connected"

# If not connected:
# 1. Check firewall (allow outbound on port 443)
# 2. Verify CHULOBOTS_WS_URL in .env
# 3. Check if ChuloBots network is online
```

### High CPU usage
```bash
# Reduce concurrent backtests in .env
MAX_CONCURRENT_BACKTESTS=3  # Reduce from 5

# Restart
docker-compose restart validator
```

## Support

- **Discord:** https://discord.gg/chulobots #validator-support
- **Email:** validators@chulobots.com
- **Docs:** https://docs.chulobots.com/validators

## License

Proprietary - All rights reserved
