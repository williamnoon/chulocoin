# ChuloBots Validator Node - Operator Guide

**Complete guide for running a ChuloBots validator node and earning rewards**

---

## TABLE OF CONTENTS

1. [What is a Validator?](#what-is-a-validator)
2. [Requirements](#requirements)
3. [Economics & Rewards](#economics--rewards)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Node](#running-the-node)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## WHAT IS A VALIDATOR?

### Overview

ChuloBots validators are independent node operators who verify the quality of trading signals submitted to the network. When a user submits a signal via CLI, validators:

1. **Receive** the signal via WebSocket
2. **Backtest** the strategy independently using Chainlink price data
3. **Vote** on whether to approve or reject (>66% consensus required)
4. **Earn** 0.25 CHULO per validation + share of network burn pool

### Why Validators Matter

- **Decentralization**: No single entity controls signal quality
- **Trust**: Consensus mechanism prevents bad signals from reaching users
- **Incentive Alignment**: Validators earn rewards for honest verification

---

## REQUIREMENTS

### Minimum Stake

| Tier | CHULO Required | Max Validations/Day | Burn Pool Share |
|------|---------------|---------------------|-----------------|
| Tier 1 | 10,000 | 100 | 0% |
| Tier 2 | 50,000 | 500 | 2% |
| Tier 3 | 200,000 | Unlimited | 5% |

**Recommended:** Tier 2 (50,000 CHULO) for optimal ROI

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- Network: 10Mbps up/down
- Uptime: >95% (penalized for downtime)

**Recommended:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- Network: 100Mbps up/down
- Uptime: >99.5%

**Hosting Options:**
- DigitalOcean Droplet: $24/month (2 CPU, 4GB RAM)
- Linode VPS: $24/month (2 CPU, 4GB RAM)
- AWS EC2: t3.medium ($30/month)
- Hetzner Cloud: €15/month (2 CPU, 4GB RAM)

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- curl (for health checks)
- Optional: Grafana for monitoring

---

## ECONOMICS & REWARDS

### Revenue Breakdown

**Example: Tier 2 Validator (50,000 CHULO staked)**

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

### Costs

**Monthly Operating Costs:**
```
VPS hosting: $24
RPC API (Alchemy): $50
Total: $74/month
```

### ROI Calculation

```
Monthly revenue: $4,275
Monthly costs: $74
Monthly profit: $4,201

Annual profit: $50,412
Stake value: $15,000 (50,000 CHULO @ $0.30)

Annual ROI: 336%
Monthly ROI: 28%
```

**Note:** ROI assumes CHULO price remains at $0.30. Price appreciation would increase ROI significantly.

### Penalties

**Slashing Conditions:**
- Vote against >80% majority: -1% stake
- Offline >24 hours: -0.5% stake
- Repeated failures: Up to -10% stake

**Best Practice:** Run with 99%+ uptime to avoid penalties.

---

## INSTALLATION

### Step 1: Get CHULO Tokens

**Option A: Buy from ChuloBots**
```
1. Visit: https://app.chulobots.com/buy-chulo
2. Purchase 50,000 CHULO (~$15,000)
3. Receive in your wallet
```

**Option B: Buy from DEX**
```
1. Go to Uniswap: https://app.uniswap.org
2. Connect wallet
3. Swap USDC for CHULO (Arbitrum network)
4. You need: 50,000 CHULO for Tier 2
```

### Step 2: Stake CHULO

```bash
# Visit staking page
https://app.chulobots.com/stake

# Connect wallet (MetaMask recommended)
# Click "Become a Validator"
# Select Tier 2 (50,000 CHULO)
# Approve transaction
# Confirm staking transaction

# Wait for confirmation (~10 seconds on Arbitrum)
# You're now a registered validator!
```

### Step 3: Rent a VPS

**Recommended: DigitalOcean**

```bash
# 1. Create account: https://digitalocean.com
# 2. Create new Droplet
# 3. Select:
#    - Image: Ubuntu 22.04 LTS
#    - Size: Basic ($24/month - 2 CPU, 4GB RAM)
#    - Region: US or EU (closest to you)
#    - Add SSH key
# 4. Create Droplet
# 5. Note IP address
```

### Step 4: Connect to VPS

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 5: Download Validator Software

```bash
# Clone repository
git clone https://github.com/chulobots/chulobots.git
cd chulobots/validator-node

# Or download release
wget https://downloads.chulobots.com/validator/v1.0.0/validator-node.tar.gz
tar -xzf validator-node.tar.gz
cd validator-node

# Verify contents
ls -la
# Should see:
# - Dockerfile
# - .env.example
# - src/
# - package.json
```

### Step 6: Configure Validator

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env

# Fill in required values (see Configuration section)
# CRITICAL: Set VALIDATOR_WALLET and VALIDATOR_PRIVATE_KEY

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 7: Start Validator

```bash
# Build and start the validator node
docker build -t chulobots-validator .
docker run -d --name validator \
  --env-file .env \
  -p 3001:3001 \
  --restart unless-stopped \
  chulobots-validator

# Check logs
docker logs -f validator

# You should see:
# ✅ Database connected
# ✅ Wallet connected
# ✅ Staked: 50000 CHULO
# ✅ Validator Node Ready!
# 🌐 Dashboard running on http://localhost:3001
```

### Step 8: Verify Running

```bash
# Check status
curl http://localhost:3001/health

# Should return:
# {"healthy":true,"database":"ok","blockchain":"ok"}

# Open dashboard in browser
# http://YOUR_VPS_IP:3001

# You should see validator dashboard with stats
```

**Installation Complete! 🎉**

---

## CONFIGURATION

### Required Variables

```bash
# Your validator wallet (must have staked CHULO)
VALIDATOR_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f3a9f

# Your wallet private key (KEEP SECRET!)
VALIDATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Your validator display name
VALIDATOR_NAME=ChuloBots Validator #1

# Stake tier (1, 2, or 3)
STAKE_TIER=2
```

### Blockchain Configuration

```bash
# Arbitrum RPC (free tier works, paid recommended)
# Free: https://arb1.arbitrum.io/rpc
# Alchemy: https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
# Infura: https://arbitrum-mainnet.infura.io/v3/YOUR_KEY
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Chainlink RPC (for price feeds)
# Get free API key: https://www.alchemy.com
CHAINLINK_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Smart Contract Addresses

```bash
# Get from: https://chulobots.com/contracts
CHULO_CONTRACT=0x...
STAKING_CONTRACT=0x...
ORACLE_CONTRACT=0x...
```

### Performance Tuning

```bash
# Max concurrent backtests (based on CPU cores)
# 2 CPU cores → 3-4 concurrent
# 4 CPU cores → 5-8 concurrent
MAX_CONCURRENT_BACKTESTS=5

# Backtest timeout (seconds)
BACKTEST_TIMEOUT=60
```

### Database Configuration

```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://validator:YOUR_PASSWORD@localhost:5432/validator

# Generate strong password
# openssl rand -base64 32
```

---

## RUNNING THE NODE

### Start Validator

```bash
# Start validator
docker start validator

# Or with docker-compose
docker-compose up -d

# Verify running
docker ps
# Should show validator container as "Up"
```

### View Logs

```bash
# Real-time logs
docker logs -f validator

# Last 100 lines
docker logs --tail=100 validator

# Search logs
docker logs validator | grep "Signal"
```

### Stop Validator

```bash
# Stop gracefully
docker stop validator

# Force stop
docker kill validator
```

### Restart Validator

```bash
# Restart after config change
docker restart validator
```

### Update Validator Software

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker build -t chulobots-validator .

# Stop current version
docker stop validator
docker rm validator

# Start new version
docker run -d --name validator \
  --env-file .env \
  -p 3001:3001 \
  --restart unless-stopped \
  chulobots-validator

# Check logs for successful start
docker logs -f validator
```

---

## MONITORING & MAINTENANCE

### Dashboard Access

**Web Dashboard:**
```
http://YOUR_VPS_IP:3001
```

**Shows:**
- Validator status (running/stopped)
- Total validations
- Uptime
- Recent validations
- Earnings (estimated)

### Prometheus Metrics

**Metrics endpoint:**
```
http://YOUR_VPS_IP:3001/metrics
```

**Metrics Available:**
- Validations per hour
- Average backtest time
- Vote breakdown (approve/reject ratio)
- Error rate
- Uptime percentage

### Health Checks

**Manual Health Check:**
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

**Auto-Monitoring:**
```bash
# Add to crontab for email alerts
crontab -e

# Add line:
*/5 * * * * curl -f http://localhost:3001/health || echo "Validator down!" | mail -s "Alert" your@email.com
```

### Database Backups

**Daily Backup (Recommended):**
```bash
# Create backup script
cat > /root/backup-validator.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec validator pg_dump -U validator validator > /backups/validator_$DATE.sql
# Keep last 30 days
find /backups -name "validator_*.sql" -mtime +30 -delete
EOF

chmod +x /root/backup-validator.sh

# Add to crontab (daily at 3am)
crontab -e
0 3 * * * /root/backup-validator.sh
```

---

## TROUBLESHOOTING

### Validator Won't Start

**Check logs:**
```bash
docker logs validator

# Common issues:

# 1. Database not ready
# Fix: Wait 30 seconds, try again
docker restart validator

# 2. Invalid wallet/private key
# Fix: Verify VALIDATOR_PRIVATE_KEY in .env

# 3. Insufficient stake
# Fix: Check stake at https://app.chulobots.com/stake
```

### No Validations Happening

**Check connection:**
```bash
# Check if connected to ChuloBots API
docker logs validator | grep "WebSocket"

# Should see: "✅ WebSocket connected"

# If not connected:
# 1. Check firewall (allow outbound on port 443)
# 2. Verify CHULOBOTS_WS_URL in .env
# 3. Check if ChuloBots network is online
```

### High CPU Usage

**Reduce concurrent backtests:**
```bash
# Edit .env
MAX_CONCURRENT_BACKTESTS=3  # Reduce from 5

# Restart
docker restart validator
```

### Database Errors

**Reset database:**
```bash
# Stop validator
docker stop validator

# Remove database volume
docker volume rm validator_postgres_data

# Restart (will create fresh database)
docker start validator
```

### Out of Disk Space

**Clean Docker:**
```bash
# Remove unused images
docker system prune -a

# Remove old logs
docker exec validator sh -c 'rm -f /app/logs/*.old'
```

### Can't Claim Rewards

**Verify gas:**
```bash
# Check ETH balance (need for gas)
docker logs validator | grep "ETH Balance"

# If low, send more ETH to validator wallet
# Minimum: 0.01 ETH for gas
```

---

## FAQ

### How much can I earn?

**Tier 2 Validator (50k CHULO stake):**
- Daily: 475 CHULO (~$142)
- Monthly: 14,250 CHULO (~$4,275)
- Annual: 171,000 CHULO (~$51,300)

**ROI:** ~28% per month on staked capital (assuming $0.30/CHULO)

### What if I go offline?

**Short outage (<1 hour):**
- No penalty
- Resume validating when back online

**Extended outage (>24 hours):**
- -0.5% stake penalty
- Miss validation rewards during downtime

**Best Practice:** Set up monitoring and alerts

### Can I run multiple validators?

**Yes!** Each validator needs:
- Separate wallet address
- Separate stake (50k CHULO each)
- Separate VPS (or run multiple containers)

**Example:**
- 3 validators × 50k CHULO = 150k total stake
- 3 × $4,275/month = $12,825/month revenue

### Can I unstake anytime?

**Unstaking Process:**
1. Initiate unstake on https://app.chulobots.com/stake
2. Wait 7 days (cooldown period)
3. Claim CHULO back to wallet

**During cooldown:**
- Validator is inactive (no validations)
- No rewards earned
- No new stakes can be made with that wallet

### What if my validator votes incorrectly?

**Voting against consensus (>80% disagree):**
- -1% stake penalty
- Example: 50k stake → lose 500 CHULO

**Prevention:**
- Validator software uses same thresholds as other validators
- Rare to vote against majority
- Usually means signal is borderline quality

### Do I need coding skills?

**No!** Installation is straightforward:
```bash
git clone https://github.com/chulobots/chulobots.git
cd chulobots/validator-node
cp .env.example .env
nano .env  # Edit config
docker build -t chulobots-validator .
docker run -d --name validator --env-file .env -p 3001:3001 chulobots-validator
```

**5-10 minutes total.**

### Can I run on Windows?

**Yes, but Linux is recommended.**

**Windows setup:**
1. Install Docker Desktop for Windows
2. Enable WSL2
3. Follow same steps as Linux

**Or:** Use a Linux VPS ($24/month) – easier and more reliable.

### What if ChuloBots API goes down?

**Validator automatically:**
- Retries connection every 30 seconds
- Resumes validating when API returns
- No manual intervention needed

**Your validator stays running** – it just waits for signals.

### How do I upgrade my tier?

**Tier 2 → Tier 3:**
1. Stake additional 150k CHULO (200k total)
2. Update .env: `STAKE_TIER=3`
3. Restart: `docker restart validator`

**Benefits:**
- Unlimited validations (no daily cap)
- 5% burn pool share (vs 2%)
- Higher revenue

---

## SUPPORT

**Need help?**
- Discord: https://discord.gg/chulobots #validator-support
- Email: validators@chulobots.com
- Docs: https://docs.chulobots.com/validators

**Community:**
- Validator leaderboard: https://app.chulobots.com/validators
- Monthly validator meetup (Discord)
- Validator incentive programs

---

## VALIDATOR QUICK REFERENCE

**Daily Checklist:**
- [ ] Check dashboard (http://YOUR_VPS_IP:3001)
- [ ] Verify validations happening
- [ ] Check uptime >99%

**Weekly:**
- [ ] Review earnings
- [ ] Check for software updates
- [ ] Verify disk space >20% free

**Monthly:**
- [ ] Claim rewards (automatic, but verify)
- [ ] Review performance metrics
- [ ] Database backup (automatic, but verify)

**Commands:**
```bash
# Status
docker ps

# Logs
docker logs -f validator

# Restart
docker restart validator

# Stop
docker stop validator

# Start
docker start validator

# Health
curl localhost:3001/health
```

---

**Ready to earn? Let's get your validator running! 🚀**

Documentation: https://docs.chulobots.com/validators
