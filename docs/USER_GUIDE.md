# ChuloBots User Guide

**Complete guide for traders using ChuloBots validated signals**

---

## TABLE OF CONTENTS

1. [What is ChuloBots?](#what-is-chulobots)
2. [How It Works](#how-it-works)
3. [Getting Started](#getting-started)
4. [Submitting Signals](#submitting-signals)
5. [Understanding Validation](#understanding-validation)
6. [Fee Structure](#fee-structure)
7. [Signal Quality](#signal-quality)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)

---

## WHAT IS CHULOBOTS?

### Overview

ChuloBots is a decentralized network that validates trading signals through blockchain consensus. Instead of trusting a single analyst or algorithm, ChuloBots uses:

- **Decentralized Validators** who independently backtest every signal
- **Chainlink Oracles** for accurate price data verification
- **Consensus Mechanism** requiring 66%+ validator agreement
- **Quality Thresholds** ensuring only high-probability signals are published

### Why Use ChuloBots?

✅ **Trust Through Decentralization**
- No single point of failure
- Validators have skin in the game (staked CHULO)
- Consensus-based approval

✅ **Quality Assurance**
- Every signal is backtested by multiple validators
- Minimum Sharpe ratio: 1.5
- Minimum win rate: 55%
- Maximum drawdown: 25%

✅ **Transparency**
- All validations recorded on-chain
- View validator votes and confidence
- Historical signal performance tracking

✅ **Automated Execution**
- Approved signals can auto-execute on Hyperliquid
- Risk management built-in
- 24/7 monitoring

---

## HOW IT WORKS

### Signal Lifecycle

1. **Submission**
   - You submit a trading signal (pair, direction, entry, SL, TP)
   - Pay submission fee (burns CHULO)

2. **Distribution**
   - Signal broadcast to all active validators
   - Validators receive via WebSocket

3. **Validation**
   - Each validator independently backtests your strategy
   - Checks Sharpe ratio, win rate, drawdown
   - Verifies entry price against Chainlink oracle

4. **Consensus**
   - Validators vote APPROVE or REJECT
   - Requires >66% agreement
   - Typically takes 2-5 minutes

5. **Result**
   - **If Approved:** Signal published to network
   - **If Rejected:** You're refunded 50% of fee
   - **Vote Breakdown:** See which validators approved/rejected

6. **Execution** (Optional)
   - Connect exchange API (Hyperliquid, Binance, etc.)
   - Auto-execute approved signals
   - Risk management applied

---

## GETTING STARTED

### Step 1: Get CHULO Tokens

**You need CHULO to:**
- Pay signal submission fees (burns CHULO)
- Access higher tiers (more signals)
- Participate in governance

**How to get CHULO:**

```bash
# Option A: Buy directly from ChuloBots
https://app.chulobots.com/buy-chulo

# Option B: Swap on Uniswap (Arbitrum)
https://app.uniswap.org
# Connect wallet → Select Arbitrum → Swap USDC for CHULO

# Option C: Buy on DEX
# Check supported exchanges at https://chulobots.com/buy
```

### Step 2: Connect Your Wallet

**Supported Wallets:**
- MetaMask (recommended)
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet

**Connect:**
1. Visit https://app.chulobots.com
2. Click "Connect Wallet"
3. Select your wallet
4. Approve connection
5. Ensure you're on Arbitrum One network

### Step 3: Choose Your Tier

Your tier determines how many signals you can submit daily:

| Tier | CHULO Required | Signals/Day | Monthly Cost* |
|------|---------------|-------------|---------------|
| Free | 0 | 3 | $0 |
| Basic | 100 | 10 | ~$30 |
| Pro | 1,000 | 50 | ~$300 |
| Elite | 10,000 | Unlimited | ~$3,000 |

*One-time stake, not monthly cost. Unstake anytime.

### Step 4: Submit Your First Signal

1. Go to https://app.chulobots.com/submit
2. Fill in signal details:
   - Trading pair (e.g., BTC/USD)
   - Direction (LONG or SHORT)
   - Entry price
   - Stop loss
   - Take profit
   - Leverage (1x-10x)
   - Strategy name
3. Review fee (burns CHULO)
4. Click "Submit for Validation"
5. Wait 2-5 minutes for consensus

---

## SUBMITTING SIGNALS

### Signal Format

**Required Fields:**

```typescript
{
  pair: "BTC/USD",           // Trading pair
  direction: "LONG",         // LONG or SHORT
  entryPrice: 50000,         // Desired entry price
  stopLoss: 48000,          // Stop loss price
  takeProfit: 55000,        // Take profit price
  leverage: 3,              // 1x-10x leverage
  strategy: "EMA Crossover", // Strategy name
  timeframe: "4h"           // Optional: 1m, 5m, 15m, 1h, 4h, 1d
}
```

### Example Signal

**Long BTC:**
```json
{
  "pair": "BTC/USD",
  "direction": "LONG",
  "entryPrice": 50000,
  "stopLoss": 48000,
  "takeProfit": 55000,
  "leverage": 3,
  "strategy": "EMA Crossover",
  "timeframe": "4h"
}
```

**Expected:**
- Entry: $50,000
- Risk: $2,000 (4%)
- Reward: $5,000 (10%)
- Risk/Reward: 2.5:1
- Leverage: 3x

### What Makes a Good Signal?

✅ **Clear Risk Management**
- Stop loss must be set
- Risk per trade: 1-5% of portfolio
- Risk/reward ratio: >2:1

✅ **Realistic Entry Price**
- Within ±0.5% of current market price
- Validators check against Chainlink oracle
- Signals with stale prices will be rejected

✅ **Backtested Strategy**
- Use a proven strategy (EMA, RSI, etc.)
- Historical win rate >55%
- Sharpe ratio >1.5
- Max drawdown <25%

✅ **Appropriate Leverage**
- 1x-3x for conservative strategies
- 3x-5x for moderate strategies
- 5x-10x for aggressive strategies (higher rejection risk)

❌ **Avoid:**
- Extremely high leverage (>10x)
- Unrealistic take profits
- No stop loss
- Signals based on speculation/hype

---

## UNDERSTANDING VALIDATION

### Validation Criteria

Validators check your signal against these thresholds:

**Quality Metrics:**
- **Sharpe Ratio:** ≥1.5 (risk-adjusted return)
- **Win Rate:** ≥55% (backtested)
- **Max Drawdown:** ≤25% (worst loss period)
- **Quality Score:** ≥70/100 (composite score)

**Price Verification:**
- Entry price must match Chainlink oracle ±0.5%
- Prevents stale or manipulated prices

**Consensus:**
- ≥66% of validators must approve
- Each validator independently backtests
- Majority vote determines outcome

### Validation Timeline

```
Submit Signal → 0:00
├─ Broadcast to validators → 0:10
├─ Backtesting begins → 0:30
├─ Votes submitted → 2:00-3:00
├─ Consensus reached → 3:00-5:00
└─ Result published → 5:00
```

**Typical wait:** 2-5 minutes

### Reading Validation Results

**Approved Signal:**
```
✅ Signal Approved
├─ Validators: 15 approve, 3 reject (83% consensus)
├─ Avg Sharpe: 1.8
├─ Avg Win Rate: 62%
├─ Quality Score: 85/100
└─ Status: Published & ready for execution
```

**Rejected Signal:**
```
❌ Signal Rejected
├─ Validators: 4 approve, 14 reject (22% consensus)
├─ Rejection Reasons:
│   ├─ Sharpe ratio too low: 1.2 (need ≥1.5)
│   ├─ Win rate too low: 52% (need ≥55%)
│   └─ Max drawdown too high: 30% (need ≤25%)
├─ Refund: 50% of submission fee
└─ Tip: Improve strategy parameters and resubmit
```

---

## FEE STRUCTURE

### Submission Fees

Fees are paid in CHULO and **burned** (removed from supply):

| Tier | Fee per Signal | Daily Cost* |
|------|---------------|-------------|
| Free | 10 CHULO (~$3) | $9 (3 signals) |
| Basic | 8 CHULO (~$2.40) | $24 (10 signals) |
| Pro | 5 CHULO (~$1.50) | $75 (50 signals) |
| Elite | 3 CHULO (~$0.90) | Unlimited |

*At $0.30/CHULO, assumes max daily signals

### Refund Policy

**If signal is rejected:**
- Refund: 50% of submission fee
- Example: 10 CHULO fee → 5 CHULO refund
- Remaining 5 CHULO burned (pays validators)

**If signal is approved:**
- No refund (fee burned)
- Signal published to network
- You can execute the signal

### Fee Comparison

**vs Traditional Signal Services:**

| Service | Monthly Cost | Signals/Month |
|---------|-------------|---------------|
| **ChuloBots Pro** | ~$75 | 1,500 (50/day) |
| Traditional 1 | $99 | ~30 |
| Traditional 2 | $199 | Unlimited (low quality) |
| Traditional 3 | $299 | ~100 |

**ChuloBots advantages:**
- Pay per signal (more flexible)
- Decentralized validation (higher quality)
- On-chain transparency
- Auto-execution available

---

## SIGNAL QUALITY

### Quality Score Breakdown

Every signal receives a 0-100 quality score:

**Scoring Components:**

```
Quality Score =
  (Sharpe Ratio × 25) +
  (Win Rate × 30) +
  (Risk/Reward × 20) +
  (Drawdown Control × 15) +
  (Price Accuracy × 10)
```

**Example:**
- Sharpe: 1.8 → 45/25 points (capped at 25)
- Win Rate: 62% → 18.6/30 points
- R:R: 2.5:1 → 16.7/20 points
- Drawdown: 18% → 11.3/15 points
- Price: ±0.2% → 8/10 points
- **Total: 85/100** ✅ Approved

### Improving Signal Quality

**Tips for Higher Approval Rates:**

1. **Backtest Your Strategy**
   - Use at least 6 months of historical data
   - Test multiple market conditions (bull, bear, sideways)
   - Calculate Sharpe ratio and win rate

2. **Optimize Entry Price**
   - Submit signals close to current market price
   - Avoid limit orders >1% away from spot
   - Check Chainlink oracle price first

3. **Set Realistic Targets**
   - Take profit: 2-5x your stop loss distance
   - Stop loss: 2-5% from entry
   - Don't use extremely tight stops (<1%)

4. **Use Proven Strategies**
   - EMA crossovers
   - RSI divergence
   - Support/resistance breaks
   - Avoid "gut feeling" signals

5. **Moderate Leverage**
   - 1x-3x: Best approval rates
   - 3x-5x: Good approval rates
   - 5x-10x: Moderate approval rates
   - >10x: Low approval rates (high risk)

---

## BEST PRACTICES

### For Maximum Success

**1. Start with Free Tier**
- Test the platform with 3 free signals/day
- Learn what gets approved
- Understand validator criteria

**2. Focus on Quality Over Quantity**
- 1 high-quality signal > 10 low-quality signals
- Approved signals save you money (no refund loss)
- Build reputation for future governance

**3. Use Signal Analytics**
- Review why signals were rejected
- Learn from high-scoring signals
- Iterate and improve

**4. Join the Community**
- Discord: Share strategies, learn from others
- Forums: Discuss validation criteria
- Twitter: Follow network updates

**5. Auto-Execute Wisely**
- Start with small position sizes
- Test manual execution first
- Set portfolio limits
- Use stop losses religiously

### Common Mistakes to Avoid

❌ **Mistake 1: Submitting too quickly**
- Wait for clear setups
- Don't FOMO into trades

❌ **Mistake 2: Ignoring rejection reasons**
- Learn from rejections
- Adjust strategy parameters

❌ **Mistake 3: Using maximum leverage**
- High leverage = high rejection rate
- Validators prefer conservative signals

❌ **Mistake 4: No stop loss**
- Always set a stop loss
- Signals without SL are auto-rejected

❌ **Mistake 5: Chasing pumps**
- Validators check price staleness
- Entering late = rejection

---

## FAQ

### How do I know if my signal is good?

**Before submitting, ask:**
1. Have I backtested this strategy? (Win rate >55%?)
2. Is my risk/reward ratio >2:1?
3. Is my entry price current (within ±0.5% of market)?
4. Is my stop loss reasonable (2-5% from entry)?
5. Is my leverage conservative (<5x)?

If yes to all → High approval chance ✅

### What if my signal gets rejected?

**You'll receive:**
- 50% refund (5 CHULO back from 10 CHULO fee)
- Detailed rejection reasons
- Validator vote breakdown

**Next steps:**
- Review rejection reasons
- Adjust strategy parameters
- Resubmit improved signal

### Can I submit the same signal multiple times?

**Yes, but:**
- Each submission costs a fee
- If rejected, adjust before resubmitting
- Validators may reject repeated identical signals

**Better approach:**
- Wait for rejection reasons
- Modify entry/SL/TP based on feedback
- Resubmit improved version

### How long does validation take?

**Typical timeline:**
- Minimum: 2 minutes
- Average: 3-5 minutes
- Maximum: 10 minutes (if validators are slow)

**If taking >10 minutes:**
- Check validator network status
- Your signal may be edge case (borderline quality)

### Can I cancel a submitted signal?

**No**, once submitted:
- Signal is broadcast to validators
- Validation begins immediately
- Cannot cancel

**Tip:** Double-check before clicking "Submit"

### What happens to approved signals?

**Approved signals are:**
1. Published to ChuloBots network
2. Visible to all users
3. Available for auto-execution
4. Recorded on-chain
5. Tracked for performance

**You can:**
- Execute manually
- Enable auto-execution
- Share with others
- Monitor performance

### Can I see other users' signals?

**Yes!**
- View all approved signals at https://app.chulobots.com/signals
- Filter by pair, strategy, time
- See validation scores and votes
- Copy signals (if you have execution tier)

### Do I need to execute approved signals?

**No**, signal submission ≠ execution

**Your options:**
1. **Manual Execution:** Execute on your own exchange
2. **Auto-Execution:** Connect API, enable auto-trade
3. **Share Only:** Publish signal, let others execute
4. **Track Only:** Monitor performance, learn

---

## SUPPORT

**Need help?**
- Discord: https://discord.gg/chulobots #user-support
- Email: support@chulobots.com
- Docs: https://docs.chulobots.com
- Twitter: @chulobots

**Report issues:**
- GitHub: https://github.com/chulobots/chulobots/issues
- Support ticket: https://app.chulobots.com/support

---

## QUICK REFERENCE

**Submit a Signal:**
1. Connect wallet (Arbitrum network)
2. Go to app.chulobots.com/submit
3. Fill in: pair, direction, entry, SL, TP, leverage
4. Pay fee (burns CHULO)
5. Wait 2-5 minutes for validation
6. Receive result + validator breakdown

**Quality Thresholds:**
- Sharpe ratio: ≥1.5
- Win rate: ≥55%
- Max drawdown: ≤25%
- Quality score: ≥70/100
- Price accuracy: ±0.5%
- Consensus: ≥66%

**Fees:**
- Free tier: 10 CHULO/signal
- Basic: 8 CHULO/signal
- Pro: 5 CHULO/signal
- Elite: 3 CHULO/signal
- Refund if rejected: 50%

---

**Ready to submit validated trading signals? Start now! 🚀**

Get Started: https://app.chulobots.com
