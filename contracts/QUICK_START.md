# Quick Start - Foundry + Hardhat Hybrid Setup

Get up and running with ChuloBots contracts in 5 minutes.

## Prerequisites

1. Install Node.js (v18+)
2. Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup (Choose One Method)

### Method 1: Using Make (Recommended)

```bash
make setup
```

### Method 2: Using Setup Script

```bash
chmod +x setup-foundry.sh
./setup-foundry.sh
```

### Method 3: Manual Setup

```bash
# Install npm dependencies
npm install

# Install forge-std
forge install foundry-rs/forge-std --no-commit

# Build contracts
npm run build
```

## Verify Installation

```bash
# Test Hardhat
npm test

# Test Foundry
forge test

# Both should pass!
```

## Daily Workflow

### Building

```bash
make build              # Build both
# or
npm run build          # Build both
npm run build:hardhat  # Hardhat only
npm run build:forge    # Foundry only
```

### Testing

```bash
# Quick unit tests (Foundry - fastest)
make test-forge
# or
forge test

# Integration tests (Hardhat)
make test
# or
npm test

# Run everything
make test-all
# or
npm run test:all
```

### Gas Analysis

```bash
# Foundry gas report
make test-gas
# or
forge test --gas-report

# Create gas snapshot
make snapshot
# or
forge snapshot
```

### Debugging

```bash
# Verbose Foundry output
forge test -vvv

# Debug specific test
forge test --debug testFunctionName

# Hardhat stack traces
npm test
```

## Common Tasks

### Adding a New Contract

1. Create `contracts/MyContract.sol`
2. Write Foundry test: `test-foundry/MyContract.t.sol`
3. Write Hardhat test: `test/MyContract.test.ts`
4. Build and test:

```bash
make build
make test-all
```

### Running Single Test

```bash
# Foundry
forge test --match-test testTransfer

# Hardhat
npm test -- --grep "should transfer"
```

### Deployment

```bash
# Testnet
make deploy-testnet    # Hardhat
make deploy-sepolia    # Foundry

# Mainnet
npm run deploy:mainnet         # Hardhat
npm run deploy:forge:mainnet   # Foundry
```

### Cleaning

```bash
make clean
# or
npm run clean
```

## Troubleshooting

### "forge-std not found"

```bash
forge install foundry-rs/forge-std --no-commit
```

### "command not found: forge"

```bash
foundryup
# or reinstall
curl -L https://foundry.paradigm.xyz | bash
```

### Build errors

```bash
make clean
make build
```

### Test failures

```bash
# See full traces
forge test -vvvv

# Test specific contract
forge test --match-contract MyContractTest
```

## File Structure Cheat Sheet

```
contracts/
├── contracts/          # Your Solidity contracts
├── test/              # Hardhat TypeScript tests
├── test-foundry/      # Foundry Solidity tests
├── script/            # Foundry deployment scripts
├── scripts/           # Hardhat deployment scripts
├── hardhat.config.ts  # Hardhat config
└── foundry.toml       # Foundry config
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:

```bash
PRIVATE_KEY=your_private_key
ARBITRUM_SEPOLIA_RPC_URL=your_rpc_url
ARBISCAN_API_KEY=your_api_key
```

## Next Steps

- Read [FOUNDRY.md](./FOUNDRY.md) for complete Foundry documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Check [test-foundry/README.md](./test-foundry/README.md) for testing guide

## Pro Tips

1. Use `make help` to see all available commands
2. Run `forge test` before committing (it's fast!)
3. Use `forge snapshot` to track gas changes
4. Keep both test suites passing
5. Use Foundry for unit tests, Hardhat for integration tests

## Support

- [Foundry Book](https://book.getfoundry.sh/)
- [Hardhat Docs](https://hardhat.org/docs)
- ChuloBots team on Discord
