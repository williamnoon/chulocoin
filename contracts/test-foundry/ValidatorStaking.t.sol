// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ValidatorStaking.sol";
import "../contracts/CHULO.sol";
import "../contracts/TierNFT.sol";

contract ValidatorStakingTest is Test {
    ValidatorStaking public staking;
    CHULO public chulo;
    TierNFT public tierNFT;

    address public owner;
    address public validator1;
    address public validator2;
    address public validator3;

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18;
    uint256 constant MIN_STAKE = 10_000 * 10**18;
    uint256 constant MAX_STAKE = 200_000 * 10**18;

    event Staked(address indexed validator, uint256 amount);
    event Unstaked(address indexed validator, uint256 amount);
    event TierUpgraded(address indexed validator, uint8 newTier);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);

    function setUp() public {
        owner = address(this);
        validator1 = makeAddr("validator1");
        validator2 = makeAddr("validator2");
        validator3 = makeAddr("validator3");

        // Deploy contracts
        chulo = new CHULO(INITIAL_SUPPLY);
        tierNFT = new TierNFT(address(chulo));
        staking = new ValidatorStaking(address(chulo));

        // Distribute tokens for testing
        chulo.transfer(validator1, 300_000 * 10**18);
        chulo.transfer(validator2, 300_000 * 10**18);
        chulo.transfer(validator3, 300_000 * 10**18);
    }

    function testStake() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);

        vm.expectEmit(true, false, false, true);
        emit Staked(validator1, stakeAmount);

        staking.stake(stakeAmount);
        vm.stopPrank();

        (uint256 amount, , , ) = staking.validators(validator1);
        assertEq(amount, stakeAmount);
    }

    function testCannotStakeBelowMinimum() public {
        uint256 stakeAmount = MIN_STAKE - 1;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);

        vm.expectRevert();
        staking.stake(stakeAmount);
        vm.stopPrank();
    }

    function testUnstake() public {
        // First stake
        uint256 stakeAmount = MIN_STAKE;
        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);

        // Fast forward past lock period (7 days)
        vm.warp(block.timestamp + 8 days);

        uint256 balanceBefore = chulo.balanceOf(validator1);

        staking.unstake();
        vm.stopPrank();

        uint256 balanceAfter = chulo.balanceOf(validator1);
        assertEq(balanceAfter - balanceBefore, stakeAmount);
    }

    function testCannotUnstakeBeforeLockPeriod() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);

        // Try to unstake immediately
        vm.expectRevert("Must wait 7 days after staking");
        staking.unstake();
        vm.stopPrank();
    }

    function testCannotStakeAboveMaximum() public {
        uint256 stakeAmount = MAX_STAKE + 1;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);

        vm.expectRevert("Stake above maximum");
        staking.stake(stakeAmount);
        vm.stopPrank();
    }

    function testCannotStakeTwice() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount * 2);
        staking.stake(stakeAmount);

        vm.expectRevert("Already active validator");
        staking.stake(stakeAmount);
        vm.stopPrank();
    }

    function testMultipleValidatorsStaking() public {
        uint256 stake1 = MIN_STAKE;
        uint256 stake2 = MIN_STAKE * 2;

        // Validator 1 stakes
        vm.startPrank(validator1);
        chulo.approve(address(staking), stake1);
        staking.stake(stake1);
        vm.stopPrank();

        // Validator 2 stakes
        vm.startPrank(validator2);
        chulo.approve(address(staking), stake2);
        staking.stake(stake2);
        vm.stopPrank();

        (uint256 amount1, , , ) = staking.validators(validator1);
        (uint256 amount2, , , ) = staking.validators(validator2);

        assertEq(amount1, stake1);
        assertEq(amount2, stake2);
    }

    function testRecordValidation() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);
        vm.stopPrank();

        // Record validation as owner
        staking.recordValidation(validator1, 1);

        (uint256 stake, uint256 rewards, uint256 validations, bool isActive, uint256 reputation) =
            staking.getValidator(validator1);

        assertEq(validations, 1);
        assertEq(rewards, staking.REWARD_PER_VALIDATION());
        assertEq(reputation, 100);
    }

    function testSlashValidator() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);
        vm.stopPrank();

        // Slash validator
        uint256 expectedSlash = (stakeAmount * staking.SLASH_PERCENTAGE()) / 100;

        vm.expectEmit(true, false, false, true);
        emit ValidatorSlashed(validator1, expectedSlash, "Misbehavior");

        staking.slashValidator(validator1, "Misbehavior");

        (uint256 stake, , , bool isActive, uint256 reputation) = staking.getValidator(validator1);
        assertEq(stake, stakeAmount - expectedSlash);
        assertTrue(isActive);
        assertEq(reputation, 80); // 100 - 20
    }

    function testSlashBelowMinimumDeactivates() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);
        vm.stopPrank();

        // Slash validator (10% of MIN_STAKE brings it below minimum)
        staking.slashValidator(validator1, "Misbehavior");

        (uint256 stake, , , bool isActive, ) = staking.getValidator(validator1);
        assertFalse(isActive);
    }

    function testBurnPoolDistribution() public {
        // Setup multiple validators
        vm.startPrank(validator1);
        chulo.approve(address(staking), MIN_STAKE);
        staking.stake(MIN_STAKE);
        vm.stopPrank();

        vm.startPrank(validator2);
        chulo.approve(address(staking), MIN_STAKE * 2);
        staking.stake(MIN_STAKE * 2);
        vm.stopPrank();

        // Add to burn pool
        staking.addToBurnPool(1000 * 10**18);

        // Fast forward past distribution interval
        vm.warp(block.timestamp + 8 days);

        // Distribute burn pool
        staking.distributeBurnPool();

        // Check rewards distributed proportionally
        (, uint256 rewards1, , , ) = staking.getValidator(validator1);
        (, uint256 rewards2, , , ) = staking.getValidator(validator2);

        // Validator2 staked 2x as much, should get 2x rewards
        assertEq(rewards2, rewards1 * 2);
    }

    function testCannotDistributeBurnPoolBeforeInterval() public {
        vm.startPrank(validator1);
        chulo.approve(address(staking), MIN_STAKE);
        staking.stake(MIN_STAKE);
        vm.stopPrank();

        staking.addToBurnPool(1000 * 10**18);

        // Try to distribute before interval
        vm.expectRevert("Distribution interval not passed");
        staking.distributeBurnPool();
    }

    function testGetActiveValidators() public {
        vm.startPrank(validator1);
        chulo.approve(address(staking), MIN_STAKE);
        staking.stake(MIN_STAKE);
        vm.stopPrank();

        vm.startPrank(validator2);
        chulo.approve(address(staking), MIN_STAKE);
        staking.stake(MIN_STAKE);
        vm.stopPrank();

        address[] memory active = staking.getActiveValidators();
        assertEq(active.length, 2);
        assertEq(active[0], validator1);
        assertEq(active[1], validator2);
    }

    // Fuzz testing
    function testFuzzStake(uint256 amount) public {
        vm.assume(amount >= MIN_STAKE);
        vm.assume(amount <= chulo.balanceOf(validator1));

        vm.startPrank(validator1);
        chulo.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();

        (uint256 stakedAmount, , , ) = staking.validators(validator1);
        assertEq(stakedAmount, amount);
    }

    function testFuzzUnstake(uint256 stakeAmount) public {
        vm.assume(stakeAmount >= MIN_STAKE);
        vm.assume(stakeAmount <= MAX_STAKE);
        vm.assume(stakeAmount <= chulo.balanceOf(validator1));

        // Stake
        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);

        // Fast forward
        vm.warp(block.timestamp + 8 days);

        uint256 balanceBefore = chulo.balanceOf(validator1);

        // Unstake
        staking.unstake();
        vm.stopPrank();

        uint256 balanceAfter = chulo.balanceOf(validator1);
        assertEq(balanceAfter - balanceBefore, stakeAmount);
    }

    // Invariant: Total staked should equal contract's token balance
    function invariant_totalStakedEqualsBalance() public {
        // This would need to track total staked across all validators
        // assertEq(staking.totalStaked(), chulo.balanceOf(address(staking)));
    }

    // Gas benchmarking
    function testGasStake() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);

        uint256 gasBefore = gasleft();
        staking.stake(stakeAmount);
        uint256 gasUsed = gasBefore - gasleft();

        vm.stopPrank();

        // Log gas usage for analysis
        console.log("Gas used for stake:", gasUsed);
    }

    // Helper functions
    function _stakeFor(address validator, uint256 amount) internal {
        vm.startPrank(validator);
        chulo.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();
    }

    function _unstakeFor(address validator, uint256 amount) internal {
        vm.startPrank(validator);
        staking.unstake(amount);
        vm.stopPrank();
    }
}
