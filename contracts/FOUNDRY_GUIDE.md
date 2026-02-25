# Foundry Development Guide

## Overview

ChuloBots uses Foundry for smart contract testing and development. This guide covers the key debugging, testing, and optimization tools available.

## Quick Reference

### Testing Commands

```bash
# Basic test run
npm test

# Verbose output (shows test names and outcomes)
npm run test:verbose

# Very verbose (shows execution traces for failed tests)
npm run test:very-verbose

# Full trace (shows execution traces for all tests)
npm run test:trace

# Watch mode (re-runs tests on file changes)
npm run test:watch
```

### Verbosity Levels

- `-v`: Show test names
- `-vv`: Show test names + logs from passing tests
- `-vvv`: Show execution traces for failing tests
- `-vvvv`: Show execution traces for all tests + setup traces
- `-vvvvv`: Show execution and setup traces for all tests

### Gas Analysis

```bash
# Generate gas report for all tests
npm run test:gas

# Create gas snapshot baseline
npm run test:gas-snapshot

# Compare against baseline
npm run test:gas-compare

# Check contract sizes
npm run size
```

### Coverage

```bash
# Generate coverage report
npm run test:coverage

# Generate LCOV format for CI/IDE integration
npm run test:coverage:report
```

### Debugging

```bash
# Interactive debugger for failed tests
npm run test:debug

# Debug specific test
forge test --match-test testStake --debug

# Debug with traces
forge test --match-test testStake -vvvv
```

### Fork Testing

```bash
# Test against live Arbitrum state
npm run test:fork

# Fork testing with specific block
forge test --fork-url $ARBITRUM_RPC --fork-block-number 12345678
```

## Key Foundry Features

### 1. Gas Snapshots

Track gas usage changes over time:

```bash
# Create initial snapshot
forge snapshot

# After changes, compare
forge snapshot --diff

# Review changes in .gas-snapshot file
git diff .gas-snapshot
```

### 2. Cheatcodes

Foundry provides powerful test utilities:

```solidity
// Time manipulation
vm.warp(block.timestamp + 1 days);

// Impersonate accounts
vm.startPrank(validator1);
staking.stake(amount);
vm.stopPrank();

// Expect events
vm.expectEmit(true, false, false, true);
emit Staked(validator1, amount);

// Expect reverts
vm.expectRevert("Error message");
contract.failingFunction();

// Gas metering
vm.pauseGasMetering();
// expensive operation
vm.resumeGasMetering();
```

### 3. Fuzz Testing

Already integrated in ValidatorStaking.t.sol:

```solidity
function testFuzzStake(uint256 amount) public {
    vm.assume(amount >= MIN_STAKE);
    vm.assume(amount <= MAX_STAKE);
    // ... test logic
}
```

Configuration in foundry.toml:

```toml
[profile.default.fuzz]
runs = 256

[profile.ci]
fuzz = { runs = 1000 }
```

### 4. Invariant Testing

Example pattern for continuous property testing:

```solidity
function invariant_totalStakedEqualsBalance() public {
    assertEq(staking.totalStaked(), token.balanceOf(address(staking)));
}
```

## Best Practices

### Test Organization

```
test-foundry/
├── unit/           # Unit tests for individual functions
├── integration/    # Tests for contract interactions
├── fork/          # Fork tests against live chains
└── invariant/     # Invariant/property tests
```

### Gas Optimization Workflow

1. Establish baseline: `forge snapshot`
2. Make optimizations
3. Compare: `forge snapshot --diff`
4. Review changes in .gas-snapshot
5. Commit if improved

### Debugging Workflow

1. Run test to identify failure: `npm test`
2. Get detailed trace: `npm run test:very-verbose --match-test testName`
3. If needed, use interactive debugger: `forge test --match-test testName --debug`
4. Use breakpoints in code:
   ```solidity
   vm.breakpoint("checkpoint1");
   ```

### Coverage Workflow

1. Generate coverage: `npm run test:coverage`
2. Review uncovered lines
3. Add tests for critical paths
4. Aim for >90% coverage on core contracts

## Contract-Specific Notes

### ValidatorStaking.sol

- Validator struct has 6 fields - always destructure with 6 commas:

  ```solidity
  (uint256 stake, , , , , ) = staking.validators(addr);
  ```

- Key functions to test:
  - `stake()` - Entry point validation
  - `unstake()` - Time lock enforcement (takes NO parameters)
  - `slashValidator()` - Reputation and deactivation logic
  - `distributeBurnPool()` - Proportional reward distribution

### Gas Benchmarks

Current gas usage (from CI):

```
testStake: ~XXX gas
testUnstake: ~XXX gas
testSlashValidator: ~XXX gas
```

## Continuous Integration

CI automatically runs:

- `forge test` - All tests
- Gas reports enabled in foundry.toml
- Coverage tracking (future)

See `.github/workflows/ci.yml` for configuration.

## Troubleshooting

### "Source not found" errors

- Ensure dependencies installed: `npm install` (from root)
- Check foundry.toml remappings point to `../node_modules`
- Verify forge-std submodule: `git submodule update --init --recursive`

### Tests pass locally but fail in CI

- Check for time-dependent logic
- Verify fork URL/block consistency
- Review environment variables

### Slow test execution

- Use `--match-test` to run specific tests
- Consider parallelization: `forge test --jobs 4`
- Profile with gas reports to identify expensive operations

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Cheatcodes Reference](https://book.getfoundry.sh/reference/cheatcodes/)
- [Best Practices](https://book.getfoundry.sh/best-practices)
- [Gas Optimization Guide](https://book.getfoundry.sh/guides/gas-optimization)
