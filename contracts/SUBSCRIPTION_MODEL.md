# ChuloBots Subscription Model

## Overview

ChuloBots uses a **quarterly subscription model** where users burn CHULO tokens (USD-equivalent) to access professional-grade trading tools and analytics.

## Tier Pricing (USD Equivalent in CHULO)

**Default: Quarterly** | Toggle: Monthly (regular price)

| Tier | USD/Month | **Quarterly CHULO** | Discount | Credits/Mo | Max Bots | Max Positions | Max Position Size | Signal Access | Strategy Access |
|------|-----------|---------------------|----------|------------|----------|---------------|-------------------|---------------|-----------------|
| **Free** | $0 | FREE | - | 0 | 0 | 1 | $100 | 24hr delay | None |
| **Observer** | $10 | **2,850** | 5% off | 100 | 1 | 3 | $500 | Real-time | Basic |
| **Junior Quant** | $30 | **8,100** | 10% off | 500 | 3 | 10 | $2,500 | Real-time | Intermediate |
| **Senior Quant** | $90 | **21,600** | 20% off | 2,000 | 10 | 50 | $10,000 | Real-time | Advanced |
| **Sage** | $250 | **45,000** | 40% off | 10,000 | 50 | 200 | $100,000 | Real-time | All + Custom |

*Pricing assumes $0.01 per CHULO - actual CHULO amount may vary with token price*

### Subscription Discounts

- **Monthly**: Full price, pay as you go
- **Quarterly** (DEFAULT): Tiered discounts (5% to 40%) - best for active traders
  - Observer: 5% off
  - Junior Quant: 10% off
  - Senior Quant: 20% off
  - Sage: 40% off

## Tier Descriptions

### 🆓 Free Tier
**Perfect for:** Exploring the platform
- **Cost**: $0
- **Limits**: 0 bots, 1 position, $100 max position size
- **Signal Access**: 24-hour delay
- **Strategy Access**: None (manual trading only)
- **Features**:
  - View public signals (24hr delay)
  - Basic market data
  - Community access
- **Limitations**: No credits, no bots, no strategies, delayed signals

---

### 👁️ Observer - $10/month
**Perfect for:** Casual traders learning the ropes
- **Quarterly**: 2,850 CHULO ($28.50 - save 5%)
- **Credits**: 100/month
- **Limits**: 1 bot, 3 positions, $500 max position size
- **Signal Access**: Real-time (no delay)
- **Strategy Access**: Basic strategies (trend following, moving averages)
- **Features**:
  - Real-time signal feed
  - Basic analytics
  - Signal submission (limited)
  - Portfolio tracking
  - 1 automated trading bot with basic strategies

---

### 🎓 Junior Quant - $30/month
**Perfect for:** Active traders & junior analysts
- **Quarterly**: 8,100 CHULO ($81 - save 10%)
- **Credits**: 500/month
- **Limits**: 3 bots, 10 positions, $2,500 max position size
- **Signal Access**: Real-time (no delay)
- **Strategy Access**: Intermediate (momentum, mean reversion, breakout)
- **Features**:
  - Everything in Observer +
  - Advanced analytics dashboard
  - Backtesting tools (basic)
  - Signal validation rewards
  - Priority signal feed
  - 3 automated trading bots with intermediate strategies

---

### 🏆 Senior Quant - $90/month
**Perfect for:** Professional traders & fund managers
- **Quarterly**: 21,600 CHULO ($216 - save 20%)
- **Credits**: 2,000/month
- **Limits**: 10 bots, 50 positions, $10,000 max position size
- **Signal Access**: Real-time (no delay)
- **Strategy Access**: Advanced (arbitrage, market making, statistical arbitrage, ML-based)
- **Features**:
  - Everything in Junior Quant +
  - Advanced backtesting suite
  - Custom indicators
  - API access (limited)
  - Signal performance analytics
  - Multi-position management
  - 10 automated trading bots with advanced strategies

---

### 🧙 Sage - $250/month
**Perfect for:** Quantitative funds & institutions
- **Quarterly**: 45,000 CHULO ($450 - save 40%)
- **Credits**: 10,000/month
- **Limits**: 50 bots, 200 positions, $100,000 max position size
- **Signal Access**: Real-time (no delay) + priority queue
- **Strategy Access**: All strategies + custom strategy deployment
- **Features**:
  - Everything in Senior Quant +
  - Full API access
  - Custom strategy deployment & backtesting
  - White-glove support
  - Advanced risk management
  - Team collaboration tools
  - Institutional-grade infrastructure
  - 50 automated trading bots with unlimited strategy access

---

## How Subscriptions Work

### 1. Choose Your Tier

```solidity
// Subscribe to Junior Quant for 3 months (recommended)
tierSubscription.subscribe(Tier.JUNIOR_QUANT, SubscriptionPeriod.QUARTERLY);
// Burns 8,100 CHULO ($81)
// Grants 1,500 credits (500 * 3 months)
// 25% gas discount
// Expires in 90 days
```

### 2. Burn CHULO

- CHULO tokens are **burned** (removed from supply)
- Creates deflationary pressure on token
- No refunds - subscription is active immediately

### 3. Access Features

**While Active:**
- ✅ Use credits for actions
- ✅ Pay discounted gas fees
- ✅ Access tier-specific features
- ✅ Collect NFT badge

**After Expiration:**
- ❌ Revert to Free tier
- ❌ Lose tier benefits
- ✅ Keep unused credits
- ✅ Keep NFT badge as collectible

### 4. Renew or Upgrade Anytime

**Renew (same tier):**
```solidity
// Extends your current subscription
// If 20 days left + 90 days = 110 days total
tierSubscription.subscribe(Tier.JUNIOR_QUANT, SubscriptionPeriod.QUARTERLY);
```

**Upgrade (higher tier):**
```solidity
// Immediately switches to new tier
// Grants new tier benefits
// New expiration date from now
tierSubscription.subscribe(Tier.SENIOR_QUANT, SubscriptionPeriod.QUARTERLY);
```

---

## Credits System

Credits are consumed by platform actions:

| Action | Credit Cost | Observer | Junior | Senior | Sage |
|--------|-------------|----------|--------|--------|------|
| Submit Signal | 10 | 10 signals/mo | 50 signals/mo | 200 signals/mo | 1000 signals/mo |
| Validate Signal | 5 | 20 validations/mo | 100 validations/mo | 400 validations/mo | 2000 validations/mo |
| Create Position | 15 | 6 positions/mo | 33 positions/mo | 133 positions/mo | 666 positions/mo |
| Backtest Strategy | 25 | 4 backtests/mo | 20 backtests/mo | 80 backtests/mo | 400 backtests/mo |
| API Call (100) | 50 | 2 batches/mo | 10 batches/mo | 40 batches/mo | 200 batches/mo |

**Credit Rules:**
- Credits don't expire - they accumulate forever
- Quarterly subscriptions grant 3 months of credits upfront
- Can't transfer credits between users

---

## Signal Headstart & Strategy Access

### Signal Access Tiers

**Free Tier:**
- **24-hour delay** - Signals are shown after they've already moved
- Good for learning, but too late to act on most opportunities

**Paid Tiers (Observer+):**
- **Real-time access** - Get signals as they're generated (0 delay)
- Act on opportunities while they're fresh
- **Sage gets priority queue** - First in line when signals are published

### Strategy Access Levels

**Level 0 - None (Free)**
- Manual trading only
- No automated strategies

**Level 1 - Basic (Observer)**
- Trend following
- Simple moving averages (SMA, EMA)
- Basic momentum indicators

**Level 2 - Intermediate (Junior Quant)**
- Everything in Level 1 +
- Mean reversion strategies
- Breakout detection
- RSI/MACD-based systems
- Volatility-based entries

**Level 3 - Advanced (Senior Quant)**
- Everything in Level 2 +
- Statistical arbitrage
- Market making strategies
- Cross-exchange arbitrage
- ML-based prediction models
- Multi-timeframe analysis

**Level 4 - All + Custom (Sage)**
- Everything in Level 3 +
- **Deploy custom strategies** - Build your own proprietary algorithms
- **Private strategy library** - Keep your edge secret
- **Custom backtesting** - Test strategies on historical data
- **White-glove strategy consultation** - Work with our quant team

---

## Feature Access

### Free Tier
**Cost: $0**

**Limitations:**
- **0 bots** - Manual trading only
- **1 position** - One trade at a time
- **$100 max** - Small position size limit
- **24hr signal delay** - See signals a day late
- **No strategy access** - Manual trading only
- No credits for actions

**Use Case:** Test the platform before committing

---

### Observer - $10/month (Active Trader Entry)
**Quarterly: $28.50 (2,850 CHULO) - save 5%**

**What You Get:**
- **Real-time signals** - No delay, instant access
- **Basic strategies** - Trend following, moving averages
- **1 automated bot** - Set and forget basic strategy
- **3 active positions** - Diversify across multiple trades
- **$500 max per position** - Grow your portfolio
- **300 credits/quarter** (100/mo × 3) for:
  - Submit 30 signals (10 credits each)
  - Validate 60 signals (5 credits each)

**Use Case:** Casual traders learning automated strategies with real-time data

---

### Junior Quant - $30/month (Active Trader)
**Quarterly: $81 (8,100 CHULO) - save 10%**

**What You Get:**
- **Real-time signals** - No delay, instant access
- **Intermediate strategies** - Momentum, mean reversion, breakout detection
- **3 automated bots** - Run multiple strategies simultaneously
- **10 active positions** - Professional diversification
- **$2,500 max per position** - Serious capital deployment
- **1,500 credits/quarter** (500/mo × 3) for:
  - Submit 50 signals (500 credits)
  - Validate 100 signals (500 credits)
  - Create 33 positions (15 credits each, 495 total)
  - Advanced analytics access

**Use Case:** Active traders running multiple algorithmic strategies with diverse tactics

---

### Senior Quant - $90/month (Professional)
**Quarterly: $216 (21,600 CHULO) - save 20%**

**What You Get:**
- **Real-time signals** - No delay, instant access
- **Advanced strategies** - Arbitrage, market making, statistical arbitrage, ML-based algorithms
- **10 automated bots** - Full strategy portfolio
- **50 active positions** - Fund-level diversification
- **$10,000 max per position** - Professional capital
- **6,000 credits/quarter** (2,000/mo × 3) for:
  - Submit 200 signals (2,000 credits)
  - Validate 400 signals (2,000 credits)
  - Create 133 positions (2,000 credits)
  - Backtest 80 strategies (25 credits each, 2,000 total)
  - API access for automation

**Use Case:** Professional quant traders and small funds running sophisticated strategies

---

### Sage - $250/month (Institutional)
**Quarterly: $450 (45,000 CHULO) - save 40%**

**What You Get:**
- **Real-time signals + priority queue** - First access to alpha
- **All strategies + custom deployment** - Build your own proprietary strategies
- **50 automated bots** - Institutional-grade infrastructure
- **200 active positions** - Maximum diversification
- **$100,000 max per position** - Institutional capital
- **30,000 credits/quarter** (10,000/mo × 3) for:
  - Unlimited signals and validations
  - Full API access
  - Custom strategy deployment & backtesting
  - White-glove support
  - Team collaboration tools

**Use Case:** Quantitative funds and institutions deploying custom proprietary strategies

---

## UI/UX Flow

### Subscription Page

**Default View - Quarterly (Recommended):**
```
┌─────────────────────────────────────────┐
│  Choose Your Plan (Billed Quarterly)   │
│                                         │
│  [Monthly] [●Quarterly]                 │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Junior Quant                    │  │
│  │ $81 / quarter                   │  │
│  │ Save 10% vs monthly!            │  │
│  │                                 │  │
│  │ • 1,500 credits (500/mo × 3)   │  │
│  │ • 25% gas discount              │  │
│  │ • Advanced analytics            │  │
│  │                                 │  │
│  │ [Subscribe - 8,100 CHULO]      │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Toggle to Monthly:**
```
Shows: $30 / month (3,000 CHULO)
No discount badge
```

---

## Smart Contract Functions

### Subscribe
```solidity
function subscribe(
    Tier tier,
    SubscriptionPeriod period
) external
```

### Check Status
```solidity
function getSubscriptionInfo(address user) external view returns (
    Tier activeTier,
    uint256 expiresAt,
    uint256 creditsRemaining,
    uint256 daysRemaining,
    bool isActive
)
```

### Get Pricing and Limits
```solidity
function getTierPricing(Tier tier) external view returns (
    uint256 monthlyPrice,
    uint256 quarterlyPrice,
    uint256 monthlyCredits,
    uint256 maxBots,
    uint256 maxActivePositions,
    uint256 maxPositionSize,
    uint256 signalDelaySeconds,
    uint256 strategyAccessLevel
)
```

### Get User's Tier Limits
```solidity
function getTierLimits(address user) external view returns (
    uint256 maxBots,
    uint256 maxActivePositions,
    uint256 maxPositionSize,
    uint256 signalDelaySeconds,
    uint256 strategyAccessLevel
)
```

**Strategy Access Levels:**
- `0` = None (manual trading only)
- `1` = Basic (trend following, moving averages)
- `2` = Intermediate (momentum, mean reversion, breakout)
- `3` = Advanced (arbitrage, market making, statistical arbitrage, ML)
- `4` = All + Custom (deploy proprietary strategies)

---

## FAQ

**Q: Why quarterly by default?**
A: Most traders prefer to "set it and forget it" for a quarter. Tiered discounts (5-40% off) make it a no-brainer.

**Q: Can I switch between monthly and quarterly?**
A: Yes! Your current subscription runs its course, then subscribe with new period.

**Q: What's the CHULO/USD rate?**
A: Currently $0.01 per CHULO. Actual amounts may be adjusted based on market price.

**Q: Do credits expire?**
A: No! Credits accumulate forever. Quarterly subscriptions give you 3 months of credits upfront.

**Q: Can I downgrade mid-subscription?**
A: Let your current subscription expire, then subscribe to lower tier. No refunds.

**Q: Is Sage worth it for solo traders?**
A: If you're trading high volume (100+ signals/month) and value API access, absolutely. Gas savings alone justify it.

**Q: Can teams share a Sage subscription?**
A: Each wallet needs its own subscription, but Sage includes team collaboration features.

---

## Migration from Old Balance-Based System

**Old System:**
- Hold X CHULO → Get tier
- Sell tokens → Lose tier

**New System:**
- Burn X CHULO quarterly → Get tier for 90 days
- No balance requirement
- Better for active traders

Users with old tier NFTs keep them as collectibles - they're separate from new subscription badges.
