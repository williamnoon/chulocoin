# ChuloBots Smart Contract Deployment Guide

This guide provides step-by-step instructions for deploying the ChuloBots smart contracts to Arbitrum Sepolia testnet.

## Prerequisites

1. **Node.js and npm/yarn** installed
2. **Hardhat** development environment set up
3. **Wallet with testnet ETH** on Arbitrum Sepolia
4. **Arbiscan API key** (for contract verification)

## Contracts Overview

The ChuloBots platform consists of 5 smart contracts:

1. **CHULO Token** - ERC20 governance token with minting/burning capabilities
2. **ChainlinkPriceOracle** - Price oracle using Chainlink data feeds
3. **TierNFT** - ERC721 NFT for user tier management
4. **ValidatorStaking** - Staking contract for validators
5. **SignalRegistry** - Central registry for validated trading signals

## Setup

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key
```

**Security Note:** Never commit your `.env` file. It should be in `.gitignore`.

### 3. Get Testnet ETH

To deploy contracts, you need ETH on Arbitrum Sepolia testnet:

#### Option 1: Arbitrum Faucet (Recommended)

1. Visit [Arbitrum Sepolia Bridge](https://bridge.arbitrum.io/)
2. First get Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Bridge Sepolia ETH to Arbitrum Sepolia using the official bridge

#### Option 2: Third-Party Faucets

- [Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia)
- [Alchemy Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

**Required Amount:** ~0.5 ETH on Arbitrum Sepolia (covers deployment + gas)

### 4. Get Arbiscan API Key

1. Visit [Arbiscan](https://arbiscan.io/)
2. Create an account or log in
3. Navigate to API-KEYs section in your profile
4. Generate a new API key
5. Add it to your `.env` file

## Deployment

### Compile Contracts

```bash
npx hardhat compile
```

### Run Deployment Script

Deploy all contracts to Arbitrum Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

The deployment script will:

1. Deploy CHULO token with 10M initial supply
2. Deploy ChainlinkPriceOracle and configure price feeds
3. Deploy TierNFT linked to CHULO token
4. Deploy ValidatorStaking linked to CHULO token
5. Deploy SignalRegistry linked to CHULO and ValidatorStaking
6. Grant MINTER_ROLE to ValidatorStaking
7. Save deployment addresses to `deployments/sepolia.json`

### Expected Output

```
Deploying contracts with account: 0x...
Network: arbitrumSepolia
Chain ID: 421614
Account balance: X.XX ETH

--- Deploying CHULO Token ---
CHULO Token deployed to: 0x...
Initial supply: 10000000.0
Max supply: 1000000000.0

--- Deploying ChainlinkPriceOracle ---
ChainlinkPriceOracle deployed to: 0x...

--- Adding Price Feeds ---
Adding BTC price feed: 0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69
✓ BTC price feed added
Adding ETH price feed: 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165
✓ ETH price feed added

--- Deploying TierNFT ---
TierNFT deployed to: 0x...

--- Deploying ValidatorStaking ---
ValidatorStaking deployed to: 0x...

--- Deploying SignalRegistry ---
SignalRegistry deployed to: 0x...

--- Granting Permissions ---
✓ ValidatorStaking can now mint CHULO rewards

✓ Deployment info saved to: deployments/sepolia.json

✅ Deployment complete!
```

## Verify Contracts on Arbiscan

After deployment, verify contracts on Arbiscan for transparency:

```bash
# Verify CHULO Token
npx hardhat verify --network arbitrumSepolia <CHULO_ADDRESS> "10000000000000000000000000"

# Verify ChainlinkPriceOracle
npx hardhat verify --network arbitrumSepolia <ORACLE_ADDRESS>

# Verify TierNFT
npx hardhat verify --network arbitrumSepolia <TIERNFT_ADDRESS> "<CHULO_ADDRESS>"

# Verify ValidatorStaking
npx hardhat verify --network arbitrumSepolia <VALIDATOR_STAKING_ADDRESS> "<CHULO_ADDRESS>"

# Verify SignalRegistry
npx hardhat verify --network arbitrumSepolia <SIGNAL_REGISTRY_ADDRESS> "<CHULO_ADDRESS>" "<VALIDATOR_STAKING_ADDRESS>"
```

Replace `<...>` with actual addresses from `deployments/sepolia.json`.

The deployment script also outputs the exact verification commands at the end.

## Deployment Addresses

After successful deployment, contract addresses are saved to:

```
contracts/deployments/sepolia.json
```

Example structure:

```json
{
  "network": "arbitrumSepolia",
  "chainId": "421614",
  "deployer": "0x...",
  "deployedAt": "2026-02-24T...",
  "contracts": {
    "CHULO": {
      "address": "0x...",
      "initialSupply": "10000000.0",
      "maxSupply": "1000000000.0"
    },
    "ChainlinkPriceOracle": {
      "address": "0x...",
      "priceFeeds": {
        "BTC": "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",
        "ETH": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
      }
    },
    "TierNFT": {
      "address": "0x...",
      "chuloToken": "0x..."
    },
    "ValidatorStaking": {
      "address": "0x...",
      "chuloToken": "0x...",
      "minStake": "1000.0",
      "maxStake": "100000.0"
    },
    "SignalRegistry": {
      "address": "0x...",
      "chuloToken": "0x...",
      "validatorStaking": "0x...",
      "consensusThreshold": "3",
      "maxValidators": "5"
    }
  }
}
```

## Network Configuration

The `hardhat.config.ts` includes the following Arbitrum Sepolia configuration:

```typescript
arbitrumSepolia: {
  url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
  chainId: 421614,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
}
```

## Chainlink Price Feeds

The deployment uses official Chainlink price feeds on Arbitrum Sepolia:

- **BTC/USD**: `0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69`
- **ETH/USD**: `0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165`

These are maintained by Chainlink and provide reliable price data for testing.

## Post-Deployment

### 1. Update Frontend Configuration

Update your frontend app with the new contract addresses from `deployments/sepolia.json`:

```typescript
// frontend/webapp/src/config/contracts.ts
export const CONTRACTS = {
  CHULO: '0x...',
  ChainlinkPriceOracle: '0x...',
  TierNFT: '0x...',
  ValidatorStaking: '0x...',
  SignalRegistry: '0x...',
};
```

### 2. Update Backend Configuration

Update your backend services with the new contract addresses.

### 3. Test Contract Interactions

Run integration tests to ensure contracts are working correctly:

```bash
npx hardhat test --network arbitrumSepolia
```

## Troubleshooting

### Insufficient Funds Error

```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:** Get more testnet ETH from faucets listed above.

### Nonce Too High/Low Error

```
Error: nonce has already been used
```

**Solution:** Reset your account nonce or wait for pending transactions to complete.

### Verification Failed

```
Error: Already Verified
```

**Solution:** Contract is already verified. Check Arbiscan.

### RPC Connection Error

```
Error: could not detect network
```

**Solution:** Check your `ARBITRUM_SEPOLIA_RPC_URL` in `.env` file.

## Additional Resources

- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [Arbitrum Sepolia Block Explorer](https://sepolia.arbiscan.io/)
- [Chainlink Data Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses?network=arbitrum&page=1#arbitrum-sepolia)
- [Hardhat Documentation](https://hardhat.org/docs)

## Security Considerations

1. **Never share your private key**
2. **Never commit `.env` file to git**
3. **Use a separate wallet for testnet deployments**
4. **Verify all contract addresses before use**
5. **Test thoroughly on testnet before mainnet deployment**

## Support

For issues or questions:

- Open an issue on GitHub
- Check existing documentation
- Review Hardhat/Arbitrum docs

---

**Note:** This is a testnet deployment guide. For mainnet deployment, additional security audits and procedures are required.
