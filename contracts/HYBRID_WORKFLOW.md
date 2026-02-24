# Hybrid Workflow Guide: Hardhat + Foundry

This guide explains how to effectively use both Hardhat and Foundry in the ChuloBots contracts workspace.

## Philosophy

We use a **hybrid approach** to leverage the strengths of both frameworks:

- **Hardhat** = TypeScript ecosystem, deployment automation, CI/CD
- **Foundry** = Speed, fuzzing, gas optimization, Solidity-native

**Both test suites must pass before merging to main.**

## Tool Comparison

| Feature | Hardhat | Foundry | Winner |
|---------|---------|---------|--------|
| Test Speed | Slow (~30s) | Fast (~3s) | Foundry |
| Language | TypeScript | Solidity | Depends |
| Fuzzing | No | Yes | Foundry |
| Gas Reports | Good | Better | Foundry |
| Debugging | Good | Excellent | Foundry |
| Deployment | TypeScript | Solidity | Depends |
| CI/CD | Mature | Growing | Hardhat |
| Learning Curve | Easy | Moderate | Hardhat |
| Ecosystem | Large | Growing | Hardhat |

## When to Use Each Tool

### Use Foundry For:

1. **Unit Tests** - Write fast, focused tests
   ```solidity
   function testTransfer() public {
       token.transfer(user, 100);
       assertEq(token.balanceOf(user), 100);
   }
   ```

2. **Fuzz Testing** - Test with random inputs
   ```solidity
   function testFuzzTransfer(address to, uint256 amount) public {
       vm.assume(amount <= MAX);
       token.transfer(to, amount);
   }
   ```

3. **Gas Optimization** - Track gas usage
   ```bash
   forge snapshot
   forge snapshot --diff  # See changes
   ```

4. **Quick Development Iterations** - Instant feedback
   ```bash
   forge test  # ~3 seconds
   ```

5. **State Manipulation** - Easy time/block control
   ```solidity
   vm.warp(block.timestamp + 7 days);
   vm.roll(block.number + 100);
   ```

### Use Hardhat For:

1. **Integration Tests** - Complex multi-contract interactions
   ```typescript
   it("should complete full workflow", async () => {
       await token.approve(staking.address, amount);
       await staking.stake(amount);
       // ... complex logic
   });
   ```

2. **Deployment Scripts** - TypeScript flexibility
   ```typescript
   const chulo = await ethers.deployContract("CHULO");
   await chulo.waitForDeployment();
   // Save addresses, verify contracts, etc.
   ```

3. **Frontend Integration** - Generate TypeChain types
   ```bash
   npm run build  # Generates typechain-types/
   ```

4. **CI/CD Pipelines** - Mature tooling
   ```yaml
   - run: npm test
   - run: npm run test:coverage
   ```

5. **Complex Mocking** - TypeScript test utilities
   ```typescript
   const mockOracle = await deployMockContract(owner, IOracle.abi);
   await mockOracle.mock.getPrice.returns(1000);
   ```

## Recommended Workflow

### 1. Development Phase

Start with Foundry for rapid iteration:

```bash
# Write contract
vim contracts/MyContract.sol

# Write Foundry test
vim test-foundry/MyContract.t.sol

# Test loop (fast!)
forge test --match-contract MyContract -vv
forge test --gas-report
```

### 2. Feature Complete

Add Hardhat integration tests:

```bash
# Write TypeScript test
vim test/MyContract.test.ts

# Run both test suites
npm run test:all
```

### 3. Gas Optimization

Use Foundry to optimize:

```bash
# Baseline
forge snapshot

# Make optimization
vim contracts/MyContract.sol

# Compare
forge snapshot --diff
```

### 4. Pre-Commit

Run both test suites:

```bash
# Quick check
forge test

# Full verification
npm run test:all
npm run test:coverage
```

### 5. Deployment

Choose based on complexity:

**Simple deployment** → Use Foundry:
```bash
npm run deploy:forge:sepolia
```

**Complex deployment** → Use Hardhat:
```bash
npm run deploy:testnet
```

## Directory Organization

```
contracts/
├── contracts/              # Shared Solidity source
│   ├── CHULO.sol
│   ├── ValidatorStaking.sol
│   └── ...
│
├── test/                   # Hardhat tests (TypeScript)
│   ├── CHULO.test.ts       # Integration tests
│   ├── ValidatorStaking.test.ts
│   └── integration/
│       └── fullWorkflow.test.ts
│
├── test-foundry/           # Foundry tests (Solidity)
│   ├── CHULO.t.sol         # Unit tests
│   ├── ValidatorStaking.t.sol
│   └── README.md
│
├── scripts/                # Hardhat scripts (TypeScript)
│   └── deploy.ts
│
└── script/                 # Foundry scripts (Solidity)
    └── Deploy.s.sol
```

## Test Coverage Strategy

### Foundry Tests (Unit)

Focus on:
- ✓ Individual function behavior
- ✓ Edge cases and boundaries
- ✓ Access control
- ✓ Mathematical correctness
- ✓ Fuzz testing

Example:
```solidity
contract CHULOTest is Test {
    function testTransfer() public { /* ... */ }
    function testBurn() public { /* ... */ }
    function testFuzzTransfer(address to, uint256 amount) public { /* ... */ }
}
```

### Hardhat Tests (Integration)

Focus on:
- ✓ Multi-contract workflows
- ✓ State transitions
- ✓ Event emissions
- ✓ Error messages
- ✓ Real-world scenarios

Example:
```typescript
describe("Full Staking Workflow", () => {
    it("should stake, earn rewards, and unstake", async () => {
        // Multi-step integration test
    });
});
```

## Common Patterns

### Pattern 1: Test Both Ways

Some critical functions deserve both:

```solidity
// test-foundry/CHULO.t.sol
function testFuzzTransfer(address to, uint256 amount) public {
    vm.assume(to != address(0));
    token.transfer(to, amount);
    assertEq(token.balanceOf(to), amount);
}
```

```typescript
// test/CHULO.test.ts
it("should transfer tokens with proper events", async () => {
    await expect(token.transfer(user1.address, 100))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, user1.address, 100);
});
```

### Pattern 2: Foundry for Math, Hardhat for Logic

```solidity
// Use Foundry to verify math is correct
function testRewardCalculation() public {
    uint256 reward = staking.calculateReward(100e18, 365 days);
    assertEq(reward, expectedValue);
}
```

```typescript
// Use Hardhat to test the workflow
it("should distribute rewards correctly", async () => {
    await staking.stake(ethers.parseEther("100"));
    await time.increase(365 * 24 * 60 * 60);
    await staking.claimRewards();
    // Check balances, events, etc.
});
```

### Pattern 3: Foundry Snapshots for Regression

```bash
# After optimization
forge snapshot

# Before PR merge
forge snapshot --diff
# Verify gas didn't increase
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  foundry-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge test

  hardhat-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

### DO:

✓ Write unit tests in Foundry (fast feedback)
✓ Write integration tests in Hardhat (TypeScript power)
✓ Use Foundry fuzzing for math-heavy functions
✓ Use `forge snapshot` to track gas changes
✓ Keep both test suites passing
✓ Run `forge test` before every commit (it's fast!)
✓ Use Foundry for quick debugging with `-vvvv`
✓ Use Hardhat for deployment automation

### DON'T:

✗ Duplicate all tests in both frameworks
✗ Write integration tests in Foundry
✗ Skip Hardhat tests because Foundry is faster
✗ Commit without running both test suites
✗ Ignore gas snapshot diffs
✗ Use Hardhat for simple unit tests
✗ Use Foundry for complex TypeScript logic

## Performance Tips

### Foundry Optimization

```toml
# foundry.toml
[profile.ci]
fuzz = { runs = 10000 }  # More runs in CI

[profile.lite]
fuzz = { runs = 100 }     # Fewer runs locally
```

Run with profile:
```bash
FOUNDRY_PROFILE=lite forge test
```

### Hardhat Optimization

```typescript
// hardhat.config.ts
networks: {
    hardhat: {
        mining: {
            auto: false,     // Faster for some tests
            interval: 1000
        }
    }
}
```

## Troubleshooting

### Tests pass in Foundry but fail in Hardhat

- Check time/block manipulation differences
- Verify event assertion syntax
- Check error message formats

### Tests pass in Hardhat but fail in Foundry

- Check vm.assume() constraints
- Verify address(0) handling
- Check reentrancy behavior

### Build artifacts conflict

```bash
npm run clean
```

## Migration Guide

### Converting Hardhat Tests to Foundry

**Before (Hardhat):**
```typescript
it("should revert on zero address", async () => {
    await expect(token.transfer(ethers.ZeroAddress, 100))
        .to.be.reverted;
});
```

**After (Foundry):**
```solidity
function testRevertZeroAddress() public {
    vm.expectRevert();
    token.transfer(address(0), 100);
}
```

### Converting Foundry Tests to Hardhat

**Before (Foundry):**
```solidity
function testTransfer() public {
    token.transfer(user, 100);
    assertEq(token.balanceOf(user), 100);
}
```

**After (Hardhat):**
```typescript
it("should transfer tokens", async () => {
    await token.transfer(user.address, 100);
    expect(await token.balanceOf(user.address)).to.equal(100);
});
```

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Hardhat Documentation](https://hardhat.org/)
- [Foundry vs Hardhat Comparison](https://book.getfoundry.sh/config/hardhat)

## Questions?

- Check [FOUNDRY.md](./FOUNDRY.md) for Foundry-specific docs
- Check [README.md](./README.md) for general setup
- Check [test-foundry/README.md](./test-foundry/README.md) for testing guide
