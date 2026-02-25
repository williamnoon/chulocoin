# ChuloBots Subscription Model

## Overview

ChuloBots uses a **subscription-based tier system** where users burn CHULO tokens to access tier benefits for a period of time (monthly or yearly).

## Key Features

- 🔥 **Burn to Subscribe**: No balance requirements - just burn CHULO for access
- 💳 **Credits System**: Each tier grants action credits per period
- ⛽ **Gas Discounts**: Higher tiers pay less gas (up to 50% off)
- 🎟️ **Flexible Periods**: Monthly or yearly (yearly = ~16% discount)
- 🏆 **NFT Badges**: Collect badges as proof of subscription history

## Tier Pricing & Benefits

| Tier | Monthly Price | Yearly Price | Credits/Month | Gas Multiplier | Gas Savings |
|------|--------------|--------------|---------------|----------------|-------------|
| **Observer** | Free | Free | 0 | 1.0x | 0% |
| **Bronze** | 100 CHULO | 1,000 CHULO | 100 | 0.9x | 10% |
| **Silver** | 250 CHULO | 2,500 CHULO | 300 | 0.75x | 25% |
| **Gold** | 500 CHULO | 5,000 CHULO | 750 | 0.6x | 40% |
| **Diamond** | 1,000 CHULO | 10,000 CHULO | 2,000 | 0.5x | 50% |

### Yearly Discount

Yearly subscriptions cost **10 months** of monthly price (~16.7% discount):
- Bronze: 1,000 CHULO instead of 1,200 CHULO
- Silver: 2,500 CHULO instead of 3,000 CHULO
- Gold: 5,000 CHULO instead of 6,000 CHULO
- Diamond: 10,000 CHULO instead of 12,000 CHULO

## How It Works

### 1. Subscribe

```solidity
// Subscribe to Silver tier for 1 month
tierSubscription.subscribe(Tier.SILVER, SubscriptionPeriod.MONTHLY);
// Burns 250 CHULO, grants 300 credits, expires in 30 days

// Subscribe to Gold tier for 1 year
tierSubscription.subscribe(Tier.GOLD, SubscriptionPeriod.YEARLY);
// Burns 5,000 CHULO, grants 9,000 credits (750 * 12), expires in 365 days
```

### 2. Access Benefits

**While subscription is active:**
- ✅ Pay reduced gas fees (based on tier multiplier)
- ✅ Use credits for actions (signal submission, validation, etc.)
- ✅ Access tier-specific features
- ✅ Keep NFT badge forever as collectible

**After subscription expires:**
- ❌ Revert to Observer tier (free)
- ❌ No credits
- ❌ Pay full gas fees
- ✅ Still keep NFT badge as collectible

### 3. Renew or Upgrade

```solidity
// Renew before expiration - extends duration
tierSubscription.subscribe(Tier.SILVER, SubscriptionPeriod.MONTHLY);
// If 10 days left, new expiration = 10 + 30 = 40 days from now

// Upgrade to higher tier
tierSubscription.subscribe(Tier.GOLD, SubscriptionPeriod.MONTHLY);
// Immediately switches to Gold tier, gets Gold benefits
```

## Credits System

Credits are consumed by actions:

| Action | Credit Cost |
|--------|-------------|
| Submit Signal | 10 credits |
| Validate Signal | 5 credits |
| Create Position | 15 credits |
| Advanced Analytics | 20 credits |

**Credit Rules:**
- Credits accumulate (don't expire with subscription)
- Can't transfer credits between users
- Credits granted when subscribing
- Monthly: Get 1 month of credits
- Yearly: Get 12 months of credits upfront

## Gas Fee Calculation

Example: Signal submission costs 100 CHULO in gas

| Tier | Gas Multiplier | Actual Cost | You Save |
|------|----------------|-------------|----------|
| Observer | 1.0x | 100 CHULO | 0 CHULO |
| Bronze | 0.9x | 90 CHULO | 10 CHULO |
| Silver | 0.75x | 75 CHULO | 25 CHULO |
| Gold | 0.6x | 60 CHULO | 40 CHULO |
| Diamond | 0.5x | 50 CHULO | 50 CHULO |

**ROI Example (Gold Tier):**
- Monthly cost: 500 CHULO
- Submit 10 signals/month: Save 400 CHULO in gas
- **Pays for itself if you submit 12+ signals/month!**

## NFT Badges

### Badge Collection
- First time subscribing to a tier → Mint permanent NFT badge
- Renewing same tier → Don't mint new badge (keep existing)
- Upgrading tiers → Mint additional badge (collect all tiers)

### Badge Metadata
```json
{
  "name": "ChuloBots Silver Badge",
  "description": "Subscription badge for ChuloBots network",
  "tier": "Silver",
  "status": "Active",  // or "Inactive" if expired
  "expires_at": 1234567890,
  "credits": 250
}
```

### Non-Transferable
Badges are **soulbound** - they cannot be transferred or sold. They prove YOUR subscription history.

## Smart Contract Functions

### Subscribe
```solidity
function subscribe(Tier tier, SubscriptionPeriod period) external
```
Burns CHULO and activates subscription.

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

### Use Credits
```solidity
function useCredits(address user, uint256 amount, string calldata action) external
```
(Owner only - called by system contracts)

### Get Gas Multiplier
```solidity
function getGasMultiplier(address user) external view returns (uint256)
```
Returns current gas multiplier (100 = 1.0x, 50 = 0.5x)

## Migration from Old Model

**Old Model (Holding-based):**
- Hold X CHULO → Get tier
- Lose tokens → Lose tier

**New Model (Subscription-based):**
- Burn X CHULO → Get tier for period
- No balance requirement

**Migration Path:**
Users with existing balance-based tier NFTs:
1. Keep old NFT as collectible badge
2. Subscribe to new tier when ready
3. Get new subscription-based benefits

## Examples

### Example 1: Casual Trader (Bronze)
- Subscribes monthly: 100 CHULO
- Gets 100 credits + 10% gas discount
- Submits ~5-10 signals/month
- Saves ~50-100 CHULO in gas fees
- **ROI: Positive if active**

### Example 2: Power User (Gold)
- Subscribes yearly: 5,000 CHULO (saves 1,000!)
- Gets 9,000 credits + 40% gas discount
- Submits 50+ signals/month
- Saves ~2,000 CHULO/month in gas
- **ROI: Pays for itself in 2.5 months**

### Example 3: Validator (Diamond)
- Subscribes yearly: 10,000 CHULO
- Gets 24,000 credits + 50% gas discount
- Validates 100+ signals/month
- Saves ~5,000 CHULO/month in gas
- **ROI: Pays for itself in 2 months**

## FAQ

**Q: What happens if my subscription expires?**
A: You revert to Observer tier (free) but keep all NFT badges. Unused credits remain (don't expire).

**Q: Can I upgrade mid-subscription?**
A: Yes! Burn the new tier's price and immediately get upgraded benefits.

**Q: Do credits expire?**
A: No, credits accumulate and persist even after subscription expires.

**Q: Can I gift a subscription?**
A: Not directly, but you can send CHULO to someone so they can subscribe.

**Q: Can I downgrade?**
A: Just let your subscription expire and subscribe to a lower tier. You keep all badges.

**Q: Is yearly always better?**
A: If you plan to stay subscribed for 10+ months, yearly saves ~17%.
