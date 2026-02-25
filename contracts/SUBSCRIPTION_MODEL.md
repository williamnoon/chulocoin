# ChuloBots Subscription Model

## Overview

ChuloBots uses a **quarterly subscription model** where users burn CHULO tokens (USD-equivalent) to access professional-grade trading tools and analytics.

## Tier Pricing (USD Equivalent in CHULO)

**Default: Quarterly** (10% discount) | Toggle: Monthly (regular price)

| Tier | USD/Month | Monthly CHULO | **Quarterly CHULO** | Yearly CHULO | Credits/Mo | Gas Discount |
|------|-----------|---------------|---------------------|--------------|------------|--------------|
| **Free** | $0 | FREE | FREE | FREE | 0 | 0% |
| **Observer** | $10 | 1,000 | **2,700** (10% off) | 9,600 (20% off) | 100 | 10% |
| **Junior Quant** | $30 | 3,000 | **8,100** (10% off) | 28,800 (20% off) | 500 | 25% |
| **Senior Quant** | $90 | 9,000 | **24,300** (10% off) | 86,400 (20% off) | 2,000 | 40% |
| **Sage** | $250 | 25,000 | **67,500** (10% off) | 240,000 (20% off) | 10,000 | 50% |

*Pricing assumes $0.01 per CHULO - actual CHULO amount may vary with token price*

### Subscription Discounts

- **Monthly**: Full price, pay as you go
- **Quarterly** (DEFAULT): 10% discount - best for active traders
- **Yearly**: 20% discount - best for professional quants

## Tier Descriptions

### 🆓 Free Tier
**Perfect for:** Exploring the platform
- **Cost**: $0
- **Features**:
  - View public signals (24hr delay)
  - Basic market data
  - Community access
- **Limitations**: No credits, full gas fees, delayed signals

---

### 👁️ Observer - $10/month
**Perfect for:** Casual traders learning the ropes
- **Quarterly**: 2,700 CHULO ($27 - save $3)
- **Credits**: 100/month
- **Gas Discount**: 10% off all transactions
- **Features**:
  - Real-time signal feed
  - Basic analytics
  - Signal submission (limited)
  - Portfolio tracking

---

### 🎓 Junior Quant - $30/month
**Perfect for:** Active traders & junior analysts
- **Quarterly**: 8,100 CHULO ($81 - save $9)
- **Credits**: 500/month
- **Gas Discount**: 25% off all transactions
- **Features**:
  - Everything in Observer +
  - Advanced analytics dashboard
  - Backtesting tools (basic)
  - Signal validation rewards
  - Priority signal feed

---

### 🏆 Senior Quant - $90/month
**Perfect for:** Professional traders & fund managers
- **Quarterly**: 24,300 CHULO ($243 - save $27)
- **Credits**: 2,000/month
- **Gas Discount**: 40% off all transactions
- **Features**:
  - Everything in Junior Quant +
  - Advanced backtesting suite
  - Custom indicators
  - API access (limited)
  - Signal performance analytics
  - Multi-position management

---

### 🧙 Sage - $250/month
**Perfect for:** Quantitative funds & institutions
- **Quarterly**: 67,500 CHULO ($675 - save $75)
- **Credits**: 10,000/month
- **Gas Discount**: 50% off all transactions
- **Features**:
  - Everything in Senior Quant +
  - Full API access
  - Custom strategy deployment
  - White-glove support
  - Advanced risk management
  - Team collaboration tools
  - Institutional-grade infrastructure

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
- Yearly subscriptions grant 12 months of credits upfront
- Can't transfer credits between users

---

## Gas Fee Examples

Example: Signal submission costs 1,000 CHULO in gas

| Tier | Gas Multiplier | Actual Cost | Monthly Savings (10 signals) |
|------|----------------|-------------|------------------------------|
| Free | 1.0x | 1,000 CHULO | $0 |
| Observer | 0.9x | 900 CHULO | 1,000 CHULO ($10) |
| Junior Quant | 0.75x | 750 CHULO | 2,500 CHULO ($25) |
| Senior Quant | 0.6x | 600 CHULO | 4,000 CHULO ($40) |
| Sage | 0.5x | 500 CHULO | 5,000 CHULO ($50) |

**Gas savings alone can pay for your subscription!**

---

## ROI Calculator

### Junior Quant Example (Active Trader)
**Quarterly subscription: $81 (8,100 CHULO)**

Monthly Activity:
- Submit 20 signals: 200 credits used
- Validate 30 signals: 150 credits used
- Create 10 positions: 150 credits used
- **Total: 500 credits (included)**

Gas Savings:
- 60 actions × 1,000 CHULO base gas = 60,000 CHULO
- 25% discount saves: 15,000 CHULO/month
- **Quarterly gas savings: 45,000 CHULO ($450)**

**Net Benefit: $450 - $81 = $369 profit per quarter!**

---

### Senior Quant Example (Professional)
**Quarterly subscription: $243 (24,300 CHULO)**

Monthly Activity:
- Submit 50 signals: 500 credits
- Validate 100 signals: 500 credits
- Create 30 positions: 450 credits
- Backtest 20 strategies: 500 credits
- **Total: 1,950 credits (under 2,000 limit)**

Gas Savings:
- 200 actions × 1,000 CHULO = 200,000 CHULO
- 40% discount saves: 80,000 CHULO/month
- **Quarterly gas savings: 240,000 CHULO ($2,400)**

**Net Benefit: $2,400 - $243 = $2,157 profit per quarter!**

---

## UI/UX Flow

### Subscription Page

**Default View - Quarterly (Recommended):**
```
┌─────────────────────────────────────────┐
│  Choose Your Plan (Billed Quarterly)   │
│                                         │
│  [Monthly] [●Quarterly] [Yearly]       │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Junior Quant                    │  │
│  │ $81 / quarter                   │  │
│  │ Save $9 vs monthly!             │  │
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

### Get Pricing
```solidity
function getTierPricing(Tier tier) external view returns (
    uint256 monthlyPrice,
    uint256 quarterlyPrice,
    uint256 yearlyPrice,
    uint256 monthlyCredits,
    uint256 gasMultiplier
)
```

---

## FAQ

**Q: Why quarterly by default?**
A: Most traders prefer to "set it and forget it" for a quarter. 10% discount makes it a no-brainer.

**Q: Can I switch between monthly and quarterly?**
A: Yes! Your current subscription runs its course, then subscribe with new period.

**Q: What's the CHULO/USD rate?**
A: Currently $0.01 per CHULO. Actual amounts may be adjusted based on market price.

**Q: Do credits expire?**
A: No! Credits accumulate forever. Quarterly gives you 3 months upfront.

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
