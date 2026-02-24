# Foundry + Hardhat Setup Checklist

Use this checklist to verify your hybrid setup is complete and working.

## Initial Setup

### Prerequisites

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Foundry installed (`forge --version`)
- [ ] Git installed (`git --version`)

### Installation

- [ ] Cloned repository
- [ ] Ran `npm install`
- [ ] Ran `forge install foundry-rs/forge-std --no-commit`
- [ ] Copied `.env.example` to `.env`
- [ ] Filled in `.env` with your values

### Build Verification

- [ ] `npm run build:hardhat` succeeds
- [ ] `forge build` succeeds
- [ ] `npm run build` succeeds (both)
- [ ] No compilation errors or warnings

### Test Verification

- [ ] `npm test` passes (Hardhat tests)
- [ ] `forge test` passes (Foundry tests)
- [ ] `npm run test:all` passes (both)
- [ ] Can see test output clearly

## File Structure

### Required Files

- [ ] `foundry.toml` exists in contracts/
- [ ] `.gitignore` includes Foundry artifacts
- [ ] `script/Deploy.s.sol` exists
- [ ] `test-foundry/` directory exists
- [ ] `lib/forge-std/` exists (after forge install)
- [ ] `Makefile` exists
- [ ] `setup-foundry.sh` exists

### Documentation

- [ ] `FOUNDRY.md` exists and is readable
- [ ] `HYBRID_WORKFLOW.md` exists and is readable
- [ ] `QUICK_START.md` exists and is readable
- [ ] `test-foundry/README.md` exists
- [ ] Main `README.md` mentions hybrid approach

## Configuration

### foundry.toml

- [ ] `src = "contracts"` (not "src")
- [ ] `test = "test-foundry"` (not "test")
- [ ] `solc_version = "0.8.20"` (matches Hardhat)
- [ ] Remappings include OpenZeppelin
- [ ] Remappings include Chainlink
- [ ] Remappings include forge-std

### package.json

- [ ] Has `build:forge` script
- [ ] Has `test:forge` script
- [ ] Has `test:all` script
- [ ] Has `deploy:forge:sepolia` script
- [ ] Has `clean` script that includes forge

### .gitignore

- [ ] Ignores `out/`
- [ ] Ignores `cache_forge/`
- [ ] Ignores `lib/`
- [ ] Still ignores Hardhat artifacts

### .env

- [ ] `PRIVATE_KEY` is set (if deploying)
- [ ] `ARBITRUM_SEPOLIA_RPC_URL` is set
- [ ] `ARBITRUM_MAINNET_RPC` is set
- [ ] `ARBISCAN_API_KEY` is set (if verifying)

## Testing

### Foundry Tests

- [ ] Can run `forge test`
- [ ] Can run `forge test -vv`
- [ ] Can run `forge test -vvv`
- [ ] Can run `forge test --gas-report`
- [ ] Can run `forge coverage`
- [ ] At least one `.t.sol` file exists in test-foundry/

### Hardhat Tests

- [ ] Can run `npm test`
- [ ] Can run `npm run test:coverage`
- [ ] At least one `.test.ts` file exists in test/

### Integration

- [ ] Both test suites pass
- [ ] No conflicts between frameworks
- [ ] Can run `make test-all` successfully

## Build Artifacts

### Foundry

- [ ] `out/` directory created after build
- [ ] JSON artifacts in `out/`
- [ ] Can clean with `forge clean`

### Hardhat

- [ ] `artifacts/` directory created after build
- [ ] `typechain-types/` generated
- [ ] Can clean with `hardhat clean`

### Both

- [ ] No conflicts between build systems
- [ ] Can run `make clean` to clean both

## Advanced Features

### Gas Reporting

- [ ] `forge test --gas-report` works
- [ ] `forge snapshot` creates `.gas-snapshot`
- [ ] `forge snapshot --diff` shows changes

### Fuzzing

- [ ] Fuzz tests exist in test-foundry/
- [ ] Fuzz tests run successfully
- [ ] Can configure fuzz runs in foundry.toml

### Deployment

- [ ] `script/Deploy.s.sol` compiles
- [ ] Can run dry-run: `forge script script/Deploy.s.sol`
- [ ] (Optional) Test deployment on testnet works

## Developer Experience

### Commands Work

- [ ] `make help` shows available commands
- [ ] `make build` works
- [ ] `make test` works
- [ ] `make test-forge` works
- [ ] `make clean` works

### Alternative Commands

- [ ] `npm run build` works
- [ ] `npm run test:all` works
- [ ] `forge test` works directly
- [ ] `npm test` works directly

## Documentation

### Team Onboarding

- [ ] New developer can follow QUICK_START.md
- [ ] Setup script works (`./setup-foundry.sh`)
- [ ] All documentation is up to date
- [ ] Examples in docs work

### Reference Materials

- [ ] FOUNDRY.md has comprehensive examples
- [ ] HYBRID_WORKFLOW.md explains when to use each tool
- [ ] test-foundry/README.md explains test structure
- [ ] Links to external resources work

## CI/CD (Optional)

### GitHub Actions

- [ ] Foundry tests run in CI
- [ ] Hardhat tests run in CI
- [ ] Both must pass for merge
- [ ] Coverage reports generated

### Pre-commit Hooks

- [ ] (Optional) Linting runs
- [ ] (Optional) Tests run before commit
- [ ] (Optional) Gas snapshot check

## Troubleshooting

### Common Issues Fixed

- [ ] forge-std not found → Run `forge install`
- [ ] Build conflicts → Run `make clean`
- [ ] Version mismatch → Check foundry.toml vs hardhat.config.ts
- [ ] Remapping errors → Verify foundry.toml remappings

### Debug Tools Work

- [ ] `forge test -vvvv` shows full traces
- [ ] Can debug specific test with `--debug`
- [ ] Console.log in Solidity works
- [ ] Hardhat stack traces are clear

## Final Verification

### End-to-End Test

Complete this workflow:

1. [ ] Clean everything: `make clean`
2. [ ] Build everything: `make build`
3. [ ] Run all tests: `make test-all`
4. [ ] Generate gas report: `forge test --gas-report`
5. [ ] Create snapshot: `forge snapshot`
6. [ ] Verify coverage: `npm run test:coverage`

### Expected Results

- [ ] All tests pass (100%)
- [ ] No compilation warnings
- [ ] Build artifacts generated correctly
- [ ] Gas reports show reasonable values
- [ ] Coverage is acceptable

## Sign Off

When all items are checked:

- [ ] Setup is complete
- [ ] Both frameworks work independently
- [ ] Both frameworks work together
- [ ] Team can use either tool
- [ ] Documentation is accessible
- [ ] Ready for development

## Quick Commands Reference

```bash
# Setup
make setup

# Build
make build

# Test
make test          # Hardhat
make test-forge    # Foundry
make test-all      # Both

# Clean
make clean

# Deploy
make deploy-sepolia

# Gas Analysis
forge test --gas-report
forge snapshot
forge snapshot --diff
```

## Need Help?

If any items are not checked:

1. Review [QUICK_START.md](./QUICK_START.md)
2. Review [FOUNDRY.md](./FOUNDRY.md)
3. Check [HYBRID_WORKFLOW.md](./HYBRID_WORKFLOW.md)
4. Run `./setup-foundry.sh`
5. Ask team for help

## Version Info

Document your versions for troubleshooting:

```bash
node --version      # _______
npm --version       # _______
forge --version     # _______
hardhat --version   # _______
```

Last updated: 2024-02-24
