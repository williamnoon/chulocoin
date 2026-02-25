# ChuloBots Smart Contracts

Solidity smart contracts for the ChuloBots decentralized signal validation network on Arbitrum.

## Hybrid Development Stack

This project uses **both Hardhat and Foundry** for optimal development experience:

- **Hardhat**: TypeScript tests, deployment scripts, CI/CD integration
- **Foundry**: Fast Solidity tests, fuzzing, gas optimization

See [FOUNDRY.md](./FOUNDRY.md) for complete Foundry documentation.

## Contracts

- **CHULO.sol** - ERC-20 token contract (100M supply, burn & mint functions)
- **TierNFT.sol** - ERC-721 NFT contract for tier badges
- **ValidatorStaking.sol** - Staking contract for validators
- **ChainlinkPriceOracle.sol** - Chainlink price feed integration
- **SignalRegistry.sol** - Signal submission and validation

## Quick Start

### Prerequisites

```bash
# Install Node.js dependencies
npm install

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install forge-std library
forge install foundry-rs/forge-std --no-commit
```

### Build

```bash
# Build both Hardhat and Foundry
npm run build

# Or build separately
npm run build:hardhat
npm run build:forge
```

### Testing

```bash
# Run Hardhat tests (TypeScript)
npm test

# Run Foundry tests (Solidity, faster)
npm run test:forge

# Run both test suites
npm run test:all

# Foundry with verbose output
npm run test:forge:verbose

# Foundry with gas reporting
npm run test:forge:gas
```

### Coverage

```bash
# Hardhat coverage
npm run test:coverage

# Foundry coverage
npm run test:forge:coverage
```

## Deployment

### Hardhat Deployment (TypeScript)

Arbitrum Goerli (Testnet):

```bash
npm run deploy:testnet
```

Arbitrum One (Mainnet):

```bash
npm run deploy:mainnet
```

### Foundry Deployment (Solidity)

Arbitrum Sepolia (Testnet):

```bash
npm run deploy:forge:sepolia
```

Arbitrum One (Mainnet):

```bash
npm run deploy:forge:mainnet
```

Dry run (simulation only):

```bash
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia
```

## Verification

Contracts are automatically verified on Arbiscan after deployment:

- Hardhat: Uses `hardhat-verify` plugin
- Foundry: Uses `--verify` flag in deployment scripts

## Project Structure

```
contracts/
├── contracts/           # Solidity source files (shared between Hardhat & Foundry)
├── test/               # Hardhat TypeScript tests
├── test-foundry/       # Foundry Solidity tests
├── script/             # Foundry deployment scripts
├── scripts/            # Hardhat deployment scripts
├── lib/                # Foundry dependencies (forge-std)
├── hardhat.config.ts   # Hardhat configuration
├── foundry.toml        # Foundry configuration
└── FOUNDRY.md          # Detailed Foundry documentation
```

## Development Workflow

### Use Hardhat When

- Writing deployment scripts with TypeScript
- Integration testing with frontend
- Running CI/CD pipelines
- Need npm ecosystem tools

### Use Foundry When

- Writing unit tests (faster feedback)
- Performing fuzz testing
- Analyzing gas optimization
- Quick local development iterations
- Preparing for formal verification

### Best Practice

1. Write unit tests in Foundry for speed
2. Write integration tests in Hardhat for flexibility
3. Ensure both test suites pass before merging
4. Use Foundry for gas optimization analysis
5. Use either tool for deployment based on preference

## Security

- OpenZeppelin contracts for standard implementations
- Dual test coverage (Hardhat + Foundry)
- Fuzz testing with Foundry
- External audit before mainnet deployment
