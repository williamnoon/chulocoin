# Deployment Guide

## Prerequisites

Before deploying to Arbitrum Goerli testnet, ensure you have:

1. **Funded Wallet**: Get testnet ETH for Arbitrum Goerli
   - Bridge Goerli ETH to Arbitrum Goerli: https://bridge.arbitrum.io
   - Or use a testnet faucet

2. **Environment Variables**: Set in `.env` file at project root
   ```
   ARBITRUM_RPC=https://goerli-rollup.arbitrum.io/rpc
   PRIVATE_KEY=your_private_key_here
   ARBISCAN_API_KEY=your_arbiscan_api_key (for verification)
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

## Deploy to Arbitrum Goerli Testnet

```bash
cd contracts
npm run deploy:testnet
```

This will:
- Deploy the CHULO token contract
- Mint 10M initial tokens to deployer
- Wait for 5 block confirmations
- Output contract addresses and deployment info

## Verify Contract on Arbiscan

After deployment, verify the contract:

```bash
npx hardhat verify --network arbitrumGoerli <CONTRACT_ADDRESS> "10000000000000000000000000"
```

Replace `<CONTRACT_ADDRESS>` with the deployed contract address from the deployment output.

## Deploy to Arbitrum One Mainnet

⚠️ **Warning**: Only deploy to mainnet after thorough testing and security audit!

1. Update `.env` with mainnet RPC and funded wallet
2. Run deployment:
   ```bash
   npm run deploy:mainnet
   ```

## Post-Deployment

1. Save contract addresses in `deployed-contracts.json`
2. Update frontend configuration with contract addresses
3. Grant MINTER_ROLE to validator staking contract (after it's deployed)
4. Transfer ownership if needed

## Testing Deployment

After deploying to testnet, test the contract:

```bash
# Run tests against deployed contract
npx hardhat test --network arbitrumGoerli

# Interact with contract via Hardhat console
npx hardhat console --network arbitrumGoerli
```

## Troubleshooting

- **Insufficient funds**: Ensure wallet has enough ETH for gas
- **Nonce too high**: Clear pending transactions or wait
- **Verification failed**: Wait a few minutes and try again
