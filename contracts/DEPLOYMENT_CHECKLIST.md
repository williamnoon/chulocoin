# ChuloBots Deployment Checklist

## Configuration Files Modified

### 1. hardhat.config.ts
- ✓ Added `arbitrumSepolia` network configuration
- ✓ Chain ID: 421614
- ✓ RPC URL: https://sepolia-rollup.arbitrum.io/rpc
- ✓ Added Arbiscan API key configuration

### 2. scripts/deploy.ts
- ✓ Added SignalRegistry deployment
- ✓ Updated Chainlink price feeds for Arbitrum Sepolia:
  - BTC/USD: 0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69
  - ETH/USD: 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165
- ✓ Added deployment info export to deployments/sepolia.json
- ✓ Added fs and path imports for file operations
- ✓ Enhanced console logging with network info

## New Files Created

### 1. .env.example
Template environment file with:
- PRIVATE_KEY
- ARBITRUM_SEPOLIA_RPC_URL
- ARBISCAN_API_KEY
- Optional gas reporter config

### 2. DEPLOYMENT.md
Comprehensive deployment guide with:
- Prerequisites and setup instructions
- How to get testnet ETH
- Deployment steps
- Contract verification guide
- Troubleshooting section
- Security best practices

### 3. DEPLOY_QUICK_START.md
Quick reference for deployment command and checklist

### 4. deployments/
- Created deployments directory
- Added sepolia.json.template showing expected structure

## Contracts to be Deployed

1. **CHULO Token** (ERC20)
   - Constructor: `initialSupply` (10M tokens)

2. **ChainlinkPriceOracle**
   - Constructor: none
   - Post-deploy: Add BTC and ETH price feeds

3. **TierNFT** (ERC721)
   - Constructor: `chuloToken` address

4. **ValidatorStaking**
   - Constructor: `chuloToken` address
   - Post-deploy: Grant MINTER_ROLE from CHULO

5. **SignalRegistry**
   - Constructor: `chuloToken` address, `validatorStaking` address

## Deployment Flow

```
1. Deploy CHULO
   ↓
2. Deploy ChainlinkPriceOracle → Add price feeds
   ↓
3. Deploy TierNFT (uses CHULO address)
   ↓
4. Deploy ValidatorStaking (uses CHULO address)
   ↓
5. Deploy SignalRegistry (uses CHULO + ValidatorStaking addresses)
   ↓
6. Grant MINTER_ROLE to ValidatorStaking
   ↓
7. Save deployment info to sepolia.json
```

## Environment Setup

Required environment variables in `.env`:
```
PRIVATE_KEY=your_private_key_without_0x_prefix
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_api_key
```

## Deployment Command

```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

## Post-Deployment Tasks

- [ ] Verify contracts on Arbiscan
- [ ] Update frontend with contract addresses
- [ ] Update backend with contract addresses
- [ ] Test contract interactions
- [ ] Document deployment addresses

## Contract Verification Commands

Will be output by deployment script. Example:
```bash
npx hardhat verify --network arbitrumSepolia <ADDRESS> <ARGS>
```

## Testnet Resources

- **Faucets:**
  - Chainlink: https://faucets.chain.link/arbitrum-sepolia
  - Alchemy: https://www.alchemy.com/faucets/arbitrum-sepolia
  - QuickNode: https://faucet.quicknode.com/arbitrum/sepolia

- **Block Explorer:**
  - https://sepolia.arbiscan.io/

- **Bridge:**
  - https://bridge.arbitrum.io/

## Security Notes

- Never commit `.env` file
- Use separate wallet for testnet
- Verify all addresses before mainnet
- Test thoroughly on testnet first

## Ready to Deploy?

All configuration is complete. To deploy:
1. Install dependencies: `npm install`
2. Configure `.env` file
3. Get testnet ETH
4. Run: `npx hardhat run scripts/deploy.ts --network arbitrumSepolia`
