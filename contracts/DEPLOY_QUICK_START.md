# Quick Start: Deploy to Arbitrum Sepolia

## Prerequisites Checklist
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured (see `.env.example`)
- [ ] Testnet ETH on Arbitrum Sepolia (~0.5 ETH)
- [ ] Arbiscan API key (optional, for verification)

## Deploy Command

```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

## What Gets Deployed

All 5 ChuloBots contracts will be deployed in this order:

1. **CHULO Token** - ERC20 token (10M initial supply)
2. **ChainlinkPriceOracle** - Price oracle with BTC/USD and ETH/USD feeds
3. **TierNFT** - NFT for user tiers
4. **ValidatorStaking** - Validator staking contract
5. **SignalRegistry** - Trading signal registry

## Post-Deployment

Deployment addresses will be saved to:
```
contracts/deployments/sepolia.json
```

## Verify Contracts

After deployment, verify on Arbiscan using the commands output by the deployment script.

Example:
```bash
npx hardhat verify --network arbitrumSepolia <ADDRESS> <CONSTRUCTOR_ARGS>
```

## Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
