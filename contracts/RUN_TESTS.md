# Quick Test Execution Guide

## Prerequisites

Ensure Foundry is installed and dependencies are set up:

```bash
cd /Users/willnoon/Documents/GitHub/chulobots/contracts
forge install
```

## Basic Commands

### Build Contracts

```bash
forge build
```

### Run All Tests

```bash
forge test
```

### Run with Verbosity (Recommended)

```bash
# -v: Show test names
# -vv: Show logs
# -vvv: Show stack traces for failing tests
# -vvvv: Show stack traces for all tests + setup
forge test -vv
```

## Test Individual Contracts

### Test CHULO Token

```bash
forge test --match-path test-foundry/CHULO.t.sol -vv
```

### Test ValidatorStaking

```bash
forge test --match-path test-foundry/ValidatorStaking.t.sol -vv
```

### Test ChainlinkPriceOracle

```bash
forge test --match-path test-foundry/ChainlinkPriceOracle.t.sol -vv
```

### Test TierNFT

```bash
forge test --match-path test-foundry/TierNFT.t.sol -vv
```

### Test SignalRegistry

```bash
forge test --match-path test-foundry/SignalRegistry.t.sol -vv
```

## Test Specific Functions

### Test a specific function by name

```bash
forge test --match-test testSubmitSignalLong -vv
```

### Test all functions matching a pattern

```bash
forge test --match-test "testFuzz" -vv
```

## Advanced Testing

### Gas Report

```bash
forge test --gas-report
```

### Coverage Report

```bash
forge coverage
```

### Coverage with LCOV format (for IDE integration)

```bash
forge coverage --report lcov
```

### Run Fuzz Tests with More Iterations

```bash
forge test --fuzz-runs 10000
```

### Run Tests in Watch Mode (re-run on file change)

```bash
forge test --watch
```

## Debugging Failed Tests

### Show detailed trace for failures

```bash
forge test -vvv
```

### Show all traces

```bash
forge test -vvvv
```

### Test a specific failing test with maximum verbosity

```bash
forge test --match-test testSpecificTest -vvvv
```

## Expected Output

When all tests pass, you should see:

```
[PASS] testInitialSupply() (gas: XXXXX)
[PASS] testMetadata() (gas: XXXXX)
[PASS] testTransfer() (gas: XXXXX)
...
Test result: ok. XX passed; 0 failed; finished in XXs
```

## Common Issues & Solutions

### Issue: "No tests match the provided pattern"

**Solution:** Check the test file path and function name

### Issue: "Failed to compile"

**Solution:** Run `forge build` first to see compilation errors

### Issue: "Stack too deep"

**Solution:** This is usually in the contract, not the test. May need to refactor contract code.

### Issue: Tests timeout on fuzz tests

**Solution:** Reduce fuzz runs: `forge test --fuzz-runs 100`

## Test File Locations

All test files are in: `/Users/willnoon/Documents/GitHub/chulobots/contracts/test-foundry/`

- CHULO.t.sol
- ValidatorStaking.t.sol
- ChainlinkPriceOracle.t.sol
- TierNFT.t.sol
- SignalRegistry.t.sol

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Foundry tests
  run: |
    cd contracts
    forge test --gas-report
```

## Next Steps After Testing

1. ✅ Run all tests: `forge test`
2. ✅ Check coverage: `forge coverage`
3. ✅ Review gas usage: `forge test --gas-report`
4. ✅ Fix any failing tests
5. ✅ Achieve >90% test coverage
6. ✅ Optimize gas usage based on reports
7. ✅ Add tests to CI/CD pipeline

## Quick Test Checklist

Before deploying to mainnet:

- [ ] All tests pass: `forge test`
- [ ] Coverage >90%: `forge coverage`
- [ ] Gas optimized: `forge test --gas-report`
- [ ] Fuzz tests pass: `forge test --fuzz-runs 10000`
- [ ] No compiler warnings: `forge build`
- [ ] All edge cases covered
- [ ] Integration tests pass
- [ ] Access control verified

Happy Testing! 🧪
