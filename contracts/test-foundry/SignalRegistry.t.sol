// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SignalRegistry.sol";
import "../contracts/CHULO.sol";
import "../contracts/ValidatorStaking.sol";

contract SignalRegistryTest is Test {
    SignalRegistry public registry;
    CHULO public chulo;
    ValidatorStaking public staking;

    address public owner;
    address public user1;
    address public user2;
    address public validator1;
    address public validator2;
    address public validator3;
    address public validator4;
    address public validator5;

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18;
    uint256 constant MIN_STAKE = 10_000 * 10**18;
    uint256 constant BRONZE_GAS = 10 * 10**18;
    uint256 constant SILVER_GAS = 5 * 10**18;
    uint256 constant GOLD_GAS = 2 * 10**18;
    uint256 constant DIAMOND_GAS = 1 * 10**18;

    event SignalSubmitted(
        uint256 indexed signalId,
        address indexed creator,
        string asset,
        string direction,
        int256 entry,
        int256 stop,
        int256 target,
        uint256 confidence
    );
    event SignalVoted(uint256 indexed signalId, address indexed validator, uint8 voteCount);
    event SignalValidated(
        uint256 indexed signalId,
        string asset,
        string direction,
        int256 entry,
        int256 stop,
        int256 target,
        uint256 validatedAt
    );
    event GasCostUpdated(string tier, uint256 newCost);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        validator1 = makeAddr("validator1");
        validator2 = makeAddr("validator2");
        validator3 = makeAddr("validator3");
        validator4 = makeAddr("validator4");
        validator5 = makeAddr("validator5");

        // Deploy contracts
        chulo = new CHULO(INITIAL_SUPPLY);
        staking = new ValidatorStaking(address(chulo));
        registry = new SignalRegistry(address(chulo), address(staking));

        // Grant minter role to staking contract for rewards
        chulo.grantRole(chulo.MINTER_ROLE(), address(staking));

        // Transfer registry ownership to enable recordValidation
        staking.transferOwnership(address(registry));

        // Distribute tokens
        chulo.transfer(user1, 100_000 * 10**18);
        chulo.transfer(user2, 100_000 * 10**18);
        chulo.transfer(validator1, 200_000 * 10**18);
        chulo.transfer(validator2, 200_000 * 10**18);
        chulo.transfer(validator3, 200_000 * 10**18);
        chulo.transfer(validator4, 200_000 * 10**18);
        chulo.transfer(validator5, 200_000 * 10**18);

        // Stake validators
        _stakeValidator(validator1, MIN_STAKE);
        _stakeValidator(validator2, MIN_STAKE);
        _stakeValidator(validator3, MIN_STAKE);
        _stakeValidator(validator4, MIN_STAKE);
        _stakeValidator(validator5, MIN_STAKE);
    }

    // Helper function to stake a validator
    function _stakeValidator(address validator, uint256 amount) internal {
        vm.startPrank(validator);
        chulo.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();
    }

    // Test signal submission
    function testSubmitSignalLong() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        vm.expectEmit(true, true, false, true);
        emit SignalSubmitted(1, user1, "BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85);

        uint256 signalId = registry.submitSignal(
            "BTC",
            "LONG",
            65000 * 10**8, // entry
            64000 * 10**8, // stop (below entry for LONG)
            68000 * 10**8, // target (above entry for LONG)
            85, // confidence
            "BRONZE"
        );
        vm.stopPrank();

        assertEq(signalId, 1);
        assertEq(registry.signalCount(), 1);
    }

    function testSubmitSignalShort() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), SILVER_GAS);

        uint256 signalId = registry.submitSignal(
            "ETH",
            "SHORT",
            3500 * 10**8, // entry
            3600 * 10**8, // stop (above entry for SHORT)
            3200 * 10**8, // target (below entry for SHORT)
            90,
            "SILVER"
        );
        vm.stopPrank();

        assertEq(signalId, 1);
    }

    function testSignalBurnsGas() public {
        uint256 balanceBefore = chulo.balanceOf(user1);
        uint256 totalBurnedBefore = chulo.totalBurned();

        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        uint256 balanceAfter = chulo.balanceOf(user1);
        uint256 totalBurnedAfter = chulo.totalBurned();

        assertEq(balanceBefore - balanceAfter, BRONZE_GAS);
        assertEq(totalBurnedAfter - totalBurnedBefore, BRONZE_GAS);
    }

    function testDifferentTierGasCosts() public {
        // Bronze tier
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Silver tier
        vm.startPrank(user1);
        chulo.approve(address(registry), SILVER_GAS);
        registry.submitSignal("ETH", "LONG", 3500 * 10**8, 3400 * 10**8, 3700 * 10**8, 85, "SILVER");
        vm.stopPrank();

        // Gold tier
        vm.startPrank(user1);
        chulo.approve(address(registry), GOLD_GAS);
        registry.submitSignal("SOL", "LONG", 140 * 10**8, 135 * 10**8, 150 * 10**8, 85, "GOLD");
        vm.stopPrank();

        // Diamond tier
        vm.startPrank(user1);
        chulo.approve(address(registry), DIAMOND_GAS);
        registry.submitSignal("AVAX", "LONG", 40 * 10**8, 38 * 10**8, 45 * 10**8, 85, "DIAMOND");
        vm.stopPrank();

        assertEq(registry.signalCount(), 4);
    }

    // Test signal validation
    function testCannotSubmitWithInsufficientGas() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS - 1);

        vm.expectRevert();
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitWithInvalidDirection() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        vm.expectRevert("Invalid direction");
        registry.submitSignal("BTC", "INVALID", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitLongWithInvalidStop() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        // Stop above entry for LONG (should be below)
        vm.expectRevert("Stop must be below entry for LONG");
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 66000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitLongWithInvalidTarget() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        // Target below entry for LONG (should be above)
        vm.expectRevert("Target must be above entry for LONG");
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 63000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitShortWithInvalidStop() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        // Stop below entry for SHORT (should be above)
        vm.expectRevert("Stop must be above entry for SHORT");
        registry.submitSignal("BTC", "SHORT", 65000 * 10**8, 64000 * 10**8, 62000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitShortWithInvalidTarget() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        // Target above entry for SHORT (should be below)
        vm.expectRevert("Target must be below entry for SHORT");
        registry.submitSignal("BTC", "SHORT", 65000 * 10**8, 66000 * 10**8, 67000 * 10**8, 85, "BRONZE");
        vm.stopPrank();
    }

    function testCannotSubmitWithExcessiveConfidence() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        vm.expectRevert("Confidence must be 0-100");
        registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 101, "BRONZE");
        vm.stopPrank();
    }

    // Test validator voting
    function testValidatorVote() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Validator votes
        vm.expectEmit(true, true, false, true);
        emit SignalVoted(signalId, validator1, 1);

        vm.prank(validator1);
        registry.voteOnSignal(signalId);

        assertTrue(registry.hasValidatorVoted(signalId, validator1));
    }

    function testCannotVoteTwice() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // First vote
        vm.prank(validator1);
        registry.voteOnSignal(signalId);

        // Second vote should fail
        vm.prank(validator1);
        vm.expectRevert("Already voted");
        registry.voteOnSignal(signalId);
    }

    function testNonValidatorCannotVote() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Non-validator tries to vote
        vm.prank(user2);
        vm.expectRevert("Not a valid validator");
        registry.voteOnSignal(signalId);
    }

    // Test consensus achievement
    function testConsensusAchieved() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Get signal before validation
        (, , , , , , , , , , uint8 voteCountBefore, bool isValidatedBefore) = registry.getSignal(signalId);
        assertFalse(isValidatedBefore);
        assertEq(voteCountBefore, 0);

        // First two votes
        vm.prank(validator1);
        registry.voteOnSignal(signalId);

        vm.prank(validator2);
        registry.voteOnSignal(signalId);

        // Third vote achieves consensus
        vm.expectEmit(true, false, false, false);
        emit SignalValidated(signalId, "BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 0);

        vm.prank(validator3);
        registry.voteOnSignal(signalId);

        // Check signal is validated
        (, , , , , , , , , , uint8 voteCountAfter, bool isValidatedAfter) = registry.getSignal(signalId);
        assertTrue(isValidatedAfter);
        assertEq(voteCountAfter, 3);
    }

    function testCannotVoteOnValidatedSignal() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Achieve consensus
        vm.prank(validator1);
        registry.voteOnSignal(signalId);
        vm.prank(validator2);
        registry.voteOnSignal(signalId);
        vm.prank(validator3);
        registry.voteOnSignal(signalId);

        // Try to vote after validation
        vm.prank(validator4);
        vm.expectRevert("Signal already validated");
        registry.voteOnSignal(signalId);
    }

    function testGetSignalValidators() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Validators vote
        vm.prank(validator1);
        registry.voteOnSignal(signalId);
        vm.prank(validator2);
        registry.voteOnSignal(signalId);
        vm.prank(validator3);
        registry.voteOnSignal(signalId);

        address[] memory validators = registry.getSignalValidators(signalId);
        assertEq(validators.length, 3);
        assertEq(validators[0], validator1);
        assertEq(validators[1], validator2);
        assertEq(validators[2], validator3);
    }

    // Test gas cost updates
    function testUpdateGasCost() public {
        uint256 newCost = 15 * 10**18;

        vm.expectEmit(false, false, false, true);
        emit GasCostUpdated("BRONZE", newCost);

        registry.updateGasCost("BRONZE", newCost);

        assertEq(registry.gasCosts("BRONZE"), newCost);
    }

    function testOnlyOwnerCanUpdateGasCost() public {
        vm.prank(user1);
        vm.expectRevert();
        registry.updateGasCost("BRONZE", 15 * 10**18);
    }

    function testCannotUpdateGasCostToZero() public {
        vm.expectRevert("Cost must be positive");
        registry.updateGasCost("BRONZE", 0);
    }

    // Test signal retrieval
    function testGetSignal() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        (
            uint256 id,
            address creator,
            string memory asset,
            string memory direction,
            int256 entry,
            int256 stop,
            int256 target,
            uint256 confidence,
            uint256 createdAt,
            uint256 validatedAt,
            uint8 validatorCount,
            bool isValidated
        ) = registry.getSignal(signalId);

        assertEq(id, signalId);
        assertEq(creator, user1);
        assertEq(asset, "BTC");
        assertEq(direction, "LONG");
        assertEq(entry, 65000 * 10**8);
        assertEq(stop, 64000 * 10**8);
        assertEq(target, 68000 * 10**8);
        assertEq(confidence, 85);
        assertEq(createdAt, block.timestamp);
        assertEq(validatedAt, 0);
        assertEq(validatorCount, 0);
        assertFalse(isValidated);
    }

    function testCannotGetInvalidSignal() public {
        vm.expectRevert("Invalid signal ID");
        registry.getSignal(999);
    }

    // Fuzz test signal validation
    function testFuzzSignalSubmission(
        int256 entry,
        uint256 confidence
    ) public {
        vm.assume(entry > 0);
        vm.assume(entry < type(int128).max);
        vm.assume(confidence <= 100);

        // Calculate valid stop and target for LONG
        int256 stop = entry - (entry / 10); // 10% below entry
        int256 target = entry + (entry / 10); // 10% above entry

        vm.assume(stop > 0);
        vm.assume(target > 0);

        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);

        try registry.submitSignal("BTC", "LONG", entry, stop, target, confidence, "BRONZE") returns (uint256 signalId) {
            assertEq(signalId, registry.signalCount());
            assertTrue(signalId > 0);
        } catch {
            // Expected to fail for some edge cases
        }
        vm.stopPrank();
    }

    // Test multiple signals
    function testMultipleSignals() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS * 3);

        uint256 id1 = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        uint256 id2 = registry.submitSignal("ETH", "SHORT", 3500 * 10**8, 3600 * 10**8, 3200 * 10**8, 90, "BRONZE");
        uint256 id3 = registry.submitSignal("SOL", "LONG", 140 * 10**8, 135 * 10**8, 150 * 10**8, 80, "BRONZE");

        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(registry.signalCount(), 3);
    }

    // Test validator rewards (integration test)
    function testValidatorsReceiveRewards() public {
        // Submit signal
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 85, "BRONZE");
        vm.stopPrank();

        // Achieve consensus
        vm.prank(validator1);
        registry.voteOnSignal(signalId);
        vm.prank(validator2);
        registry.voteOnSignal(signalId);
        vm.prank(validator3);
        registry.voteOnSignal(signalId);

        // Check validators received rewards
        (, uint256 rewards1, uint256 validations1, , ) = staking.getValidator(validator1);
        (, uint256 rewards2, uint256 validations2, , ) = staking.getValidator(validator2);
        (, uint256 rewards3, uint256 validations3, , ) = staking.getValidator(validator3);

        assertEq(validations1, 1);
        assertEq(validations2, 1);
        assertEq(validations3, 1);
        assertEq(rewards1, staking.REWARD_PER_VALIDATION());
        assertEq(rewards2, staking.REWARD_PER_VALIDATION());
        assertEq(rewards3, staking.REWARD_PER_VALIDATION());
    }

    // Test edge case: exactly at confidence boundary
    function testZeroConfidence() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 0, "BRONZE");
        vm.stopPrank();

        (, , , , , , , uint256 confidence, , , , ) = registry.getSignal(signalId);
        assertEq(confidence, 0);
    }

    function testMaxConfidence() public {
        vm.startPrank(user1);
        chulo.approve(address(registry), BRONZE_GAS);
        uint256 signalId = registry.submitSignal("BTC", "LONG", 65000 * 10**8, 64000 * 10**8, 68000 * 10**8, 100, "BRONZE");
        vm.stopPrank();

        (, , , , , , , uint256 confidence, , , , ) = registry.getSignal(signalId);
        assertEq(confidence, 100);
    }
}
