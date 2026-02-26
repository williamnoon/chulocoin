# ChuloBots Smart Contract Structure Summary

**Source:** Analyzed from actual Solidity contracts in `/contracts/contracts/`

---

## 📊 SUBSCRIPTION TIERS (TierSubscription.sol)

**Model:** Subscription-based (NOT hold-to-unlock)

- Users **burn CHULO tokens** to subscribe monthly or quarterly
- Subscriptions grant NFT badges (non-transferable)
- Credits system for actions
- Quarterly discounts: 5%, 10%, 20%, 40%

### Tier Structure

| Tier             | Monthly Price       | Quarterly Price          | Bots | Positions | Max Size | Signal Delay | Strategies   | Credits/mo |
| ---------------- | ------------------- | ------------------------ | ---- | --------- | -------- | ------------ | ------------ | ---------- |
| **Free**         | $0                  | -                        | 0    | 1         | $100     | 24 hours     | None         | 0          |
| **Observer**     | $10 (1,000 CHULO)   | $28.50 (2,850 CHULO) -5% | 1    | 3         | $500     | Real-time    | Basic        | 100        |
| **Junior Quant** | $30 (3,000 CHULO)   | $81 (8,100 CHULO) -10%   | 3    | 10        | $2,500   | Real-time    | Intermediate | 500        |
| **Senior Quant** | $90 (9,000 CHULO)   | $216 (21,600 CHULO) -20% | 10   | 50        | $10,000  | Real-time    | Advanced     | 2,000      |
| **Sage**         | $250 (25,000 CHULO) | $450 (45,000 CHULO) -40% | 50   | 200       | $100,000 | Real-time    | All + Custom | 10,000     |

**Key Features:**

- Subscriptions expire after 30/90 days
- NFT badge minted on first subscription to each tier
- Credits roll over but tied to active subscription
- Burn mechanism = deflationary tokenomics

---

## 💰 CHULO TOKENOMICS (CHULO.sol)

### Supply

- **Max Supply:** 100,000,000 CHULO (100M)
- **Decimals:** 18
- **Initial Supply:** Set at deployment (mintable up to max)

### Mechanisms

1. **Burning:**
   - Subscription payments (TierSubscription.sol)
   - Gas payments for signal submission (SignalRegistry.sol)
   - Manual burns
   - Tracked in `totalBurned` variable

2. **Minting:**
   - Validator rewards (ValidatorStaking.sol)
   - Miner rewards (future)
   - Controlled by `MINTER_ROLE`
   - Cannot exceed MAX_SUPPLY

3. **Deflationary Model:**
   - Subscriptions burn tokens permanently
   - Signal submissions burn tokens for gas
   - No inflation beyond MAX_SUPPLY cap

---

## 🔍 SIGNAL VALIDATION (SignalRegistry.sol)

### How It Works

1. **Signal Submission:**
   - User submits trading signal (asset, direction, entry, stop, target, confidence)
   - Burns CHULO for "gas" based on tier (legacy tier names in contract)
   - Signal enters validation queue

2. **Validator Voting:**
   - Validators (staked 1k+ CHULO) vote on signal quality
   - Each validator can vote once per signal
   - Requires minimum stake to vote

3. **Consensus:**
   - **Threshold:** 3 validators minimum (CONSENSUS_THRESHOLD)
   - **Max validators:** 5 per signal (MAX_VALIDATORS)
   - Once consensus reached, signal is validated and published

4. **Rewards:**
   - Each voting validator receives 0.25 CHULO
   - Paid from ValidatorStaking contract

### Signal Structure

```solidity
struct Signal {
    uint256 id;
    address creator;
    string asset;
    string direction; // "LONG" or "SHORT"
    int256 entry;     // 8 decimals
    int256 stop;
    int256 target;
    uint256 confidence; // 0-100
    uint256 createdAt;
    uint256 validatedAt;
    uint8 validatorCount;
    bool isValidated;
}
```

### Gas Costs (Legacy - Needs Update)

- BRONZE: 10 CHULO
- SILVER: 5 CHULO
- GOLD: 2 CHULO
- DIAMOND: 1 CHULO

**Note:** These tier names (Bronze/Silver/Gold/Diamond) should be updated to match new subscription tiers (Observer/Junior Quant/Senior Quant/Sage)

---

## 🛡️ VALIDATOR STAKING (ValidatorStaking.sol)

### Staking Requirements

- **Min Stake:** 1,000 CHULO (MIN_STAKE)
- **Max Stake:** 100,000 CHULO (MAX_STAKE)
- **Lock Period:** 7 days cooldown to unstake

### Validator Earnings

1. **Validation Rewards:** 0.25 CHULO per validation (REWARD_PER_VALIDATION)
2. **Burn Pool:** Share of accumulated burned tokens
   - Distributed weekly (BURN_DISTRIBUTION_INTERVAL = 7 days)
   - Split proportionally by stake amount

### Slashing

- **Penalty:** 10% of stake (SLASH_PERCENTAGE)
- **Reasons:** Misbehavior (voting incorrectly, downtime)
- **Slashed funds:** Added to burn pool for distribution

### Reputation System

- **Range:** 0-100
- **Starts:** 100 (perfect)
- **Increases:** +1 per successful validation (capped at 100)
- **Decreases:** -20 per slash event

---

## 🔑 KEY INSIGHTS FOR LANDING PAGE

### ❌ WRONG (Current Landing Page)

- Tiers based on holding CHULO tokens
- Bronze/Silver/Gold/Diamond naming
- Validator tiers mixed with subscription tiers
- Gas costs per day

### ✅ CORRECT (From Contracts)

- **Subscription Model:** Burn CHULO monthly/quarterly for access
- **Tier Names:** Free, Observer, Junior Quant, Senior Quant, Sage
- **Deflationary:** All subscriptions permanently burn tokens
- **Quarterly Savings:** 5%, 10%, 20%, 40% discounts
- **Validators:** Separate system - stake 1k-100k CHULO, earn 0.25 per validation + burn pool share
- **Signals:** Validators vote (3 minimum consensus), earn rewards
- **Max Supply:** 100M CHULO hard cap, deflationary from burns

---

## 📝 RECOMMENDED LANDING PAGE UPDATES

1. **Subscription Tiers Section:**
   - Show 5 tiers (Free through Sage)
   - Display both monthly and quarterly pricing
   - Highlight deflationary burn mechanism
   - Show bots, positions, position size limits
   - Emphasize quarterly savings

2. **How It Works:**

   ```
   1. Subscribe → Burn CHULO tokens for monthly/quarterly access
   2. Submit Signals → Additional CHULO burned for gas
   3. Validators Vote → 3+ validators must approve
   4. Execute Trades → Approved signals auto-execute via your bots
   ```

3. **Tokenomics Section:**
   - 100M max supply
   - Deflationary (subscriptions + gas burns)
   - Validator rewards (minting)
   - Burn pool distribution

4. **Validators (Separate Page):**
   - Stake 1k-100k CHULO
   - Earn 0.25 CHULO per validation
   - Share weekly burn pool distribution
   - 7-day unstaking period
   - Slashing for misbehavior

---

## 🔗 CONTRACT ADDRESSES (From Deployment)

To be populated after deployment:

```
CHULO Token: 0x...
TierSubscription: 0x...
SignalRegistry: 0x...
ValidatorStaking: 0x...
ChainlinkPriceOracle: 0x...
```

---

**Last Updated:** 2026-02-25
**Contracts Version:** See `contracts/package.json` for version info
