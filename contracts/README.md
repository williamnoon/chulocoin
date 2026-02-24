# ChuloBots Smart Contracts

Solidity smart contracts for the ChuloBots decentralized signal validation network on Arbitrum.

## Contracts

- **CHULO.sol** - ERC-20 token contract (100M supply, burn & mint functions)
- **TierNFT.sol** - ERC-721 NFT contract for tier badges
- **ValidatorStaking.sol** - Staking contract for validators
- **ChainlinkPriceOracle.sol** - Chainlink price feed integration

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run build

# Run tests
npm test

# Generate coverage report
npm run test:coverage

# Deploy to testnet
npm run deploy:testnet
```

## Testing

Run the full test suite:
```bash
npm test
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Deployment

### Arbitrum Goerli (Testnet)
```bash
npm run deploy:testnet
```

### Arbitrum One (Mainnet)
```bash
npm run deploy:mainnet
```

## Verification

Contracts are automatically verified on Arbiscan after deployment using the Hardhat verify plugin.

## Security

- OpenZeppelin contracts for standard implementations
- 100% test coverage required
- External audit before mainnet deployment
