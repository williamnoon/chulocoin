# Foundry Setup for ChuloBots

This project uses a hybrid approach with both **Hardhat** and **Foundry** for development and testing.

## Why Hybrid?

- **Hardhat**: TypeScript integration, rich ecosystem, CI/CD pipelines
- **Foundry**: Lightning-fast testing, fuzzing, Solidity-native tests, gas optimization

## Prerequisites

Install Foundry if you haven't already:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Initial Setup

1. Install forge-std library:
```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
```

2. Install dependencies:
```bash
npm install
```

3. Build contracts:
```bash
npm run build
# Or separately:
npm run build:hardhat
npm run build:forge
```

## Quick Start

### Running Tests

```bash
# Run Foundry tests
forge test

# Run with verbosity (shows detailed traces)
forge test -vvv

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testMint

# Run specific contract tests
forge test --match-contract CHULOTest

# Run all tests (Hardhat + Foundry)
npm run test:all
```

### Test Coverage

```bash
# Foundry coverage
forge coverage

# Hardhat coverage
npm run test:coverage
```

### Fuzzing

Foundry includes built-in fuzzing. Configure in `foundry.toml`:

```toml
[profile.default.fuzz]
runs = 256  # Number of fuzz runs
```

Run fuzz tests:
```bash
forge test --fuzz-runs 1000
```

### Gas Snapshots

Track gas usage changes over time:

```bash
# Create gas snapshot
forge snapshot

# Compare against snapshot
forge snapshot --diff

# Check specific function gas
forge test --gas-report
```

## Deployment

### Using Foundry Scripts

Deploy to Arbitrum Sepolia (testnet):
```bash
npm run deploy:forge:sepolia
```

Deploy to Arbitrum One (mainnet):
```bash
npm run deploy:forge:mainnet
```

Manual deployment with custom options:
```bash
forge script script/Deploy.s.sol \
  --rpc-url arbitrum_sepolia \
  --broadcast \
  --verify \
  -vvvv
```

### Dry Run (Simulation)

Test deployment without broadcasting:
```bash
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia
```

## Environment Variables

Set these in your `.env` file:

```bash
# Required for deployments
PRIVATE_KEY=your_private_key_here

# RPC endpoints
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_MAINNET_RPC=https://arb1.arbitrum.io/rpc

# For contract verification
ARBISCAN_API_KEY=your_arbiscan_api_key
```

## Project Structure

```
contracts/
├── contracts/           # Solidity contracts (shared)
├── test/               # Hardhat TypeScript tests
├── test-foundry/       # Foundry Solidity tests
├── script/             # Foundry deployment scripts
├── lib/                # Foundry dependencies (forge-std)
├── hardhat.config.ts   # Hardhat configuration
└── foundry.toml        # Foundry configuration
```

## Hybrid Workflow

### When to Use Hardhat

- Complex deployment scripts with TypeScript
- Integration testing with frontend
- CI/CD pipelines that use TypeScript
- When you need npm ecosystem tools

### When to Use Foundry

- Unit tests (much faster)
- Fuzz testing
- Gas optimization analysis
- Quick local development iterations
- Formal verification preparations

### Best Practice

1. Write core unit tests in Foundry (fast feedback loop)
2. Write integration tests in Hardhat (TypeScript flexibility)
3. Both test suites should pass before merging
4. Use Foundry for gas optimization
5. Use Hardhat for deployment to leverage TypeScript

## Common Commands

```bash
# Build
npm run build                    # Build both
npm run build:hardhat           # Hardhat only
npm run build:forge             # Foundry only

# Test
npm run test                    # Hardhat tests
npm run test:forge              # Foundry tests
npm run test:forge:verbose      # Foundry with traces
npm run test:forge:gas          # Foundry with gas report
npm run test:all                # Run both test suites

# Coverage
npm run test:coverage           # Hardhat coverage
npm run test:forge:coverage     # Foundry coverage

# Deploy
npm run deploy:testnet          # Hardhat to testnet
npm run deploy:forge:sepolia    # Foundry to Sepolia
npm run deploy:forge:mainnet    # Foundry to mainnet

# Clean
npm run clean                   # Clean both
forge clean                     # Clean Foundry only
hardhat clean                   # Clean Hardhat only
```

## Troubleshooting

### forge-std not found

```bash
forge install foundry-rs/forge-std --no-commit
```

### Remapping issues

Check `foundry.toml` remappings match your dependencies:
```toml
remappings = [
    "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/",
    "@chainlink/contracts/=node_modules/@chainlink/contracts/",
    "forge-std/=lib/forge-std/src/"
]
```

### Version conflicts

Ensure `solc_version` in `foundry.toml` matches `solidity.version` in `hardhat.config.ts`.

## Advanced Features

### Invariant Testing

Create invariant tests in `test-foundry/`:
```solidity
contract InvariantTest is Test {
    function invariant_totalSupplyEqualsSum() public {
        // Invariant conditions that should always hold
    }
}
```

### Symbolic Execution

Use `--ffi` flag for advanced testing (disabled by default for security):
```bash
forge test --ffi
```

### Debugger

Debug failing tests:
```bash
forge test --debug testFailingTest
```

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Hardhat Documentation](https://hardhat.org/docs)
