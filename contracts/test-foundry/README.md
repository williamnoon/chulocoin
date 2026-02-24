# Foundry Tests

This directory contains Solidity-based tests written for Foundry.

## Test Structure

- Tests are written in Solidity using Foundry's testing framework
- All test files should end with `.t.sol` (e.g., `CHULO.t.sol`)
- Each test contract should inherit from `forge-std/Test.sol`

## Writing Tests

### Basic Test Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;

    function setUp() public {
        // Runs before each test
        yourContract = new YourContract();
    }

    function testSomething() public {
        // Your test logic
        assertEq(yourContract.value(), expected);
    }
}
```

### Common Assertions

```solidity
assertEq(a, b);          // Assert equality
assertTrue(condition);    // Assert true
assertFalse(condition);   // Assert false
assertGt(a, b);          // Assert a > b
assertLt(a, b);          // Assert a < b
assertGe(a, b);          // Assert a >= b
assertLe(a, b);          // Assert a <= b
```

### Expect Reverts

```solidity
function testRevert() public {
    vm.expectRevert();
    yourContract.functionThatReverts();
}

function testRevertWithMessage() public {
    vm.expectRevert("Error message");
    yourContract.functionThatReverts();
}
```

### Cheat Codes

Foundry provides powerful cheat codes via the `vm` object:

```solidity
// Change msg.sender
vm.prank(address);           // Next call only
vm.startPrank(address);      // All subsequent calls
vm.stopPrank();              // Stop pranking

// Manipulate time
vm.warp(timestamp);          // Set block.timestamp

// Manipulate block
vm.roll(blockNumber);        // Set block.number

// Deal tokens
deal(address, amount);       // Give address ETH

// Create addresses
makeAddr("name");            // Create labeled address
```

### Fuzz Testing

Prefix test with `testFuzz` and add parameters:

```solidity
function testFuzzTransfer(address to, uint256 amount) public {
    vm.assume(to != address(0));           // Filter inputs
    vm.assume(amount <= MAX_SUPPLY);

    // Test with random inputs
    token.transfer(to, amount);
    assertEq(token.balanceOf(to), amount);
}
```

### Invariant Testing

Tests that should always hold true:

```solidity
function invariant_totalSupplyEqualsSum() public {
    uint256 sum = token.balanceOf(user1) + token.balanceOf(user2);
    assertEq(token.totalSupply(), sum);
}
```

## Running Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vv      # Show test results
forge test -vvv     # Show traces for failing tests
forge test -vvvv    # Show traces for all tests
forge test -vvvvv   # Show full traces with opcodes

# Run specific test
forge test --match-test testTransfer

# Run specific contract
forge test --match-contract CHULOTest

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage
```

## Best Practices

1. **Use descriptive names**: `testTransferRevertsOnZeroAddress()`
2. **Test edge cases**: Zero values, max values, boundary conditions
3. **Use fuzz testing**: For mathematical operations and transfers
4. **Test access control**: Ensure only authorized users can call functions
5. **Test events**: Use `vm.expectEmit()` to verify events
6. **Keep tests isolated**: Each test should be independent
7. **Use setUp()**: Initialize contracts in setUp() for consistency

## Example: Event Testing

```solidity
function testEmitsEvent() public {
    vm.expectEmit(true, true, false, true);
    emit Transfer(owner, user1, amount);

    token.transfer(user1, amount);
}
```

## Gas Optimization Testing

Compare gas usage:

```bash
# Create snapshot
forge snapshot

# Compare against snapshot
forge snapshot --diff
```

## Resources

- [Foundry Book - Tests](https://book.getfoundry.sh/forge/tests)
- [Foundry Cheatcodes](https://book.getfoundry.sh/cheatcodes/)
- [forge-std Documentation](https://github.com/foundry-rs/forge-std)
