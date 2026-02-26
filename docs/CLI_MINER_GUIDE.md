# ChuloBots CLI Miner Guide

**Complete guide for using the ChuloBots CLI mining tool**

---

## TABLE OF CONTENTS

1. [What is CLI Mining?](#what-is-cli-mining)
2. [CLI Mining vs Validator Nodes](#cli-mining-vs-validator-nodes)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Getting Started](#getting-started)
6. [Mining Tiers](#mining-tiers)
7. [Earning Rewards](#earning-rewards)
8. [Commands & Controls](#commands--controls)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## WHAT IS CLI MINING?

### Overview

The ChuloBots CLI is a lightweight terminal application that allows you to participate in the network by validating trading signals from your personal computer. It's designed for:

- **Traders** who want to earn CHULO while they work
- **Casual participants** who don't want to run a full validator node
- **Users with smaller stakes** (100-50,000 CHULO)
- **Testing** the network before committing to a validator node

### How It Works

1. **Run the CLI** on your computer (Windows, macOS, or Linux)
2. **Connect your wallet** with CHULO tokens
3. **Start mining** - the CLI validates signals in the background
4. **Earn CHULO** based on your tier and validation count

---

## CLI MINING VS VALIDATOR NODES

### Key Differences

| Feature          | CLI Mining                 | Validator Node                  |
| ---------------- | -------------------------- | ------------------------------- |
| **Setup**        | Download & run             | VPS + Docker setup              |
| **Requirements** | 100-50,000 CHULO           | 10,000-200,000 CHULO            |
| **Hardware**     | Personal computer          | VPS/server (24/7)               |
| **Uptime**       | Run when convenient        | 99%+ uptime required            |
| **Rewards**      | Lower (tier-based)         | Higher (0.25 CHULO + burn pool) |
| **Complexity**   | Beginner-friendly          | Technical                       |
| **Cost**         | $0 (use your PC)           | $74/month (VPS + RPC)           |
| **Ideal For**    | Casual users, small stakes | Serious operators, large stakes |

### When to Use CLI Mining

✅ **Use CLI mining if:**

- You have 100-10,000 CHULO
- You want to test the network first
- You're comfortable with a terminal
- You don't want to manage a VPS
- You want to validate signals occasionally

❌ **Use a validator node if:**

- You have 50,000+ CHULO
- You want maximum earnings
- You can maintain 99%+ uptime
- You're comfortable with VPS/Docker
- You want burn pool rewards

---

## REQUIREMENTS

### Minimum Requirements

- **Rust**: Version 1.70 or higher
- **CHULO Tokens**: 100 CHULO minimum (Free tier has limits)
- **Wallet**: Ethereum wallet with private key
- **Internet**: Stable connection
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Recommended Requirements

- **CHULO**: 1,000+ for Builder tier
- **RAM**: 2GB available
- **CPU**: 2 cores
- **Storage**: 500MB free space

---

## INSTALLATION

### Option 1: Pre-built Binaries (Recommended)

**Download the latest release:**

```bash
# macOS (Intel)
curl -L https://github.com/chulobots/chulobots/releases/latest/download/chulobots-macos-intel -o chulobots
chmod +x chulobots

# macOS (Apple Silicon)
curl -L https://github.com/chulobots/chulobots/releases/latest/download/chulobots-macos-arm -o chulobots
chmod +x chulobots

# Linux
curl -L https://github.com/chulobots/chulobots/releases/latest/download/chulobots-linux-x64 -o chulobots
chmod +x chulobots

# Windows (PowerShell)
Invoke-WebRequest -Uri https://github.com/chulobots/chulobots/releases/latest/download/chulobots-windows-x64.exe -OutFile chulobots.exe
```

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/chulobots/chulobots.git
cd chulobots/cli

# Build release binary
cargo build --release

# Binary will be at: ./target/release/chulobots
```

### Verify Installation

```bash
# Check version
./chulobots --version

# Should output: chulobots v1.0.0
```

---

## GETTING STARTED

### Step 1: Get CHULO Tokens

**Minimum: 100 CHULO for Starter tier**

```bash
# Option A: Buy from ChuloBots
https://app.chulobots.com/buy-chulo

# Option B: Swap on Uniswap (Arbitrum)
https://app.uniswap.org
# Swap USDC → CHULO
```

### Step 2: Configure Wallet

**Create config file:**

```bash
# Create config directory
mkdir -p ~/.chulobots

# Create config file
cat > ~/.chulobots/config.toml << EOF
# Your Ethereum wallet private key
private_key = "0xYOUR_PRIVATE_KEY_HERE"

# RPC endpoint (optional, defaults to public)
rpc_url = "https://arb1.arbitrum.io/rpc"
EOF

# Secure the config file
chmod 600 ~/.chulobots/config.toml
```

**Or use environment variable:**

```bash
# Set private key in environment
export CHULOBOTS_PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
```

### Step 3: Run the CLI

```bash
# Start the CLI
./chulobots

# You should see the TUI interface with:
# - Your wallet address
# - CHULO balance
# - Current tier
# - Mining status
```

### Step 4: Start Mining

```bash
# Press 'S' to start mining
# The CLI will begin validating signals

# You'll see:
# - Signals processed counter increasing
# - Validation rate
# - Earnings accumulating
```

---

## MINING TIERS

### Tier Overview

Your tier is automatically detected based on your CHULO balance:

| Tier        | CHULO Required | Signals/Day | Daily Earnings\*    |
| ----------- | -------------- | ----------- | ------------------- |
| **Free**    | 0              | 10          | 2.5 CHULO (~$0.75)  |
| **Starter** | 100            | 50          | 12.5 CHULO (~$3.75) |
| **Builder** | 1,000          | 200         | 50 CHULO (~$15)     |
| **Pro**     | 10,000         | 1,000       | 250 CHULO (~$75)    |
| **Whale**   | 50,000         | Unlimited   | 500+ CHULO (~$150+) |

\*At $0.30/CHULO, assumes max daily signals validated

### Tier Details

#### Free Tier

- **Stake:** 0 CHULO
- **Limit:** 10 signals/day
- **Reward:** 0.25 CHULO per signal
- **Daily Max:** 2.5 CHULO
- **Best For:** Testing the platform

#### Starter Tier

- **Stake:** 100 CHULO (~$30)
- **Limit:** 50 signals/day
- **Reward:** 0.25 CHULO per signal
- **Daily Max:** 12.5 CHULO (~$3.75)
- **Best For:** Casual miners

#### Builder Tier ⭐

- **Stake:** 1,000 CHULO (~$300)
- **Limit:** 200 signals/day
- **Reward:** 0.25 CHULO per signal
- **Daily Max:** 50 CHULO (~$15)
- **Best For:** Active miners
- **ROI:** ~150% annually

#### Pro Tier

- **Stake:** 10,000 CHULO (~$3,000)
- **Limit:** 1,000 signals/day
- **Reward:** 0.25 CHULO per signal
- **Daily Max:** 250 CHULO (~$75)
- **Best For:** Dedicated miners
- **ROI:** ~900% annually

#### Whale Tier

- **Stake:** 50,000+ CHULO (~$15,000+)
- **Limit:** Unlimited
- **Reward:** 0.25 CHULO per signal
- **Daily Max:** 500+ CHULO (~$150+)
- **Best For:** Heavy miners
- **Note:** Consider running a validator node instead for burn pool rewards

---

## EARNING REWARDS

### Reward Structure

**Per Signal Validated:** 0.25 CHULO

**Requirements for Reward:**

- Signal must reach consensus (>66% approval)
- Your vote must match majority vote
- You must be within daily tier limit

### Example Earnings

**Builder Tier (1,000 CHULO stake):**

```
Daily validations: 150 signals
Reward per signal: 0.25 CHULO
Daily earnings: 37.5 CHULO

Monthly earnings: 1,125 CHULO
At $0.30/CHULO: $337.50/month

Annual earnings: 13,500 CHULO
At $0.30/CHULO: $4,050/year

Initial stake value: $300
Annual ROI: 1,350%
```

### Maximizing Earnings

1. **Upgrade Your Tier**
   - More CHULO = higher daily limit
   - Higher limit = more potential earnings

2. **Run During Peak Hours**
   - More signals = more opportunities
   - Peak: US market hours (9:30 AM - 4:00 PM ET)

3. **Maintain Good Uptime**
   - CLI must be running to validate
   - Run in background during work hours

4. **Accurate Validations**
   - Vote with majority to earn rewards
   - CLI automatically uses optimal thresholds

---

## COMMANDS & CONTROLS

### Keyboard Controls

| Key   | Action                        |
| ----- | ----------------------------- |
| **S** | Start/Stop mining             |
| **R** | Refresh wallet balance & tier |
| **Q** | Quit application              |
| **H** | Show help                     |
| **C** | Clear statistics              |

### CLI Arguments

```bash
# Show version
./chulobots --version

# Show help
./chulobots --help

# Use custom config file
./chulobots --config /path/to/config.toml

# Use custom RPC
./chulobots --rpc https://your-rpc-url

# Set log level
./chulobots --log-level debug
```

### Running in Background

**macOS/Linux:**

```bash
# Run in background with nohup
nohup ./chulobots &

# Check if running
ps aux | grep chulobots

# View logs
tail -f nohup.out

# Stop
pkill chulobots
```

**Windows:**

```powershell
# Run as background process
Start-Process -NoNewWindow -FilePath "chulobots.exe"

# Stop
Stop-Process -Name chulobots
```

---

## TROUBLESHOOTING

### CLI Won't Start

**Error: "No config file found"**

```bash
# Create config file
mkdir -p ~/.chulobots
cp config.toml.example ~/.chulobots/config.toml
nano ~/.chulobots/config.toml
```

**Error: "Invalid private key"**

```bash
# Verify private key format (should start with 0x)
# Make sure there are no spaces or newlines
# Check that key is 64 hex characters after 0x
```

### No Signals Being Validated

**Check tier:**

```bash
# Run CLI and check if you've hit daily limit
# Free tier: 10/day
# Starter: 50/day
# etc.
```

**Check network:**

```bash
# Verify RPC connection
curl https://arb1.arbitrum.io/rpc

# Check wallet balance
# CLI shows balance in top panel
```

### Rewards Not Appearing

**Timing:**

- Rewards are distributed after consensus is reached
- Can take 5-10 minutes per signal
- Check wallet on Arbitrum explorer

**Voting:**

- You only earn if your vote matches majority
- CLI uses optimal thresholds (should match >95% of time)

### High CPU Usage

**Normal behavior:**

- CLI uses CPU during validation
- Peak usage: 25-50% on 1 core
- Idle: <5%

**If excessive:**

```bash
# Check for multiple instances
ps aux | grep chulobots

# Kill duplicates
pkill -9 chulobots
```

---

## FAQ

### How much can I realistically earn?

**It depends on your tier and how often you run the CLI:**

- **Free (0 CHULO):** ~$0.75/day max
- **Starter (100 CHULO):** ~$3.75/day max
- **Builder (1,000 CHULO):** ~$15/day max
- **Pro (10,000 CHULO):** ~$75/day max
- **Whale (50,000 CHULO):** ~$150+/day max

Actual earnings depend on:

1. How many hours you run the CLI
2. Network signal volume
3. Your tier limits

### Can I run the CLI 24/7?

**Yes, but:**

- Personal computer = electricity costs
- Uptime not required (unlike validators)
- If running 24/7 with 50k+ CHULO, consider a validator node instead (higher rewards)

### Do I need to keep the terminal open?

**macOS/Linux:**

- Use `nohup ./chulobots &` to run in background
- Close terminal, CLI keeps running

**Windows:**

- Run as background process
- Or minimize terminal window

### What if I run out of daily signals?

**Your CLI will:**

- Show "Daily limit reached"
- Pause until next day (resets at 00:00 UTC)
- Automatically resume next day

### Can I upgrade my tier?

**Yes:**

1. Buy more CHULO
2. Transfer to your wallet
3. Press 'R' in CLI to refresh
4. Tier updates automatically

### Is CLI mining profitable?

**ROI by tier (assuming max daily validations):**

- **Starter (100 CHULO - $30):** 4,450% annual ROI
- **Builder (1,000 CHULO - $300):** 1,350% annual ROI
- **Pro (10,000 CHULO - $3,000):** 900% annual ROI

**Note:** These assume:

- Running CLI daily
- Hitting max validations
- CHULO price at $0.30

### CLI vs Validator Node - which should I choose?

**Choose CLI if:**

- You have less than 50,000 CHULO
- You're testing the platform
- You want simple setup
- You run it occasionally

**Choose Validator if:**

- You have 50,000+ CHULO
- You want maximum earnings (includes burn pool)
- You can maintain 99%+ uptime
- You're comfortable with VPS/Docker

**You can run both:**

- Use CLI with small stake (1,000 CHULO)
- Run validator with large stake (50,000 CHULO)
- Maximize earnings from both

---

## SUPPORT

**Need help?**

- Discord: https://discord.gg/chulobots #cli-support
- Email: support@chulobots.com
- Docs: https://docs.chulobots.com/cli

**Report bugs:**

- GitHub Issues: https://github.com/chulobots/chulobots/issues

---

## CLI QUICK REFERENCE

**Installation:**

```bash
# Download binary
curl -L https://github.com/chulobots/chulobots/releases/latest/download/chulobots-[platform] -o chulobots
chmod +x chulobots

# Configure
mkdir -p ~/.chulobots
echo 'private_key = "0xYOUR_KEY"' > ~/.chulobots/config.toml

# Run
./chulobots
```

**Controls:**

- **S** - Start/Stop mining
- **R** - Refresh balance
- **Q** - Quit

**Tiers:**

- Free: 0 CHULO (10 signals/day)
- Starter: 100 CHULO (50 signals/day)
- Builder: 1,000 CHULO (200 signals/day)
- Pro: 10,000 CHULO (1,000 signals/day)
- Whale: 50,000+ CHULO (unlimited)

**Earnings:**

- 0.25 CHULO per validation
- Payment after consensus reached
- Daily limits reset at 00:00 UTC

---

**Ready to start mining? Download the CLI now! ⛏️**

Download: https://github.com/chulobots/chulobots/releases
