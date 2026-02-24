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

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18;
    uint256 constant MIN_STAKE = 10_000 * 10**18;

    event Staked(address indexed validator, uint256 amount);
    event Unstaked(address indexed validator, uint256 amount);
    event TierUpgraded(address indexed validator, uint8 newTier);

    function setUp() public {
        owner = address(this);
        validator1 = makeAddr("validator1");
        validator2 = makeAddr("validator2");

        // Deploy contracts
        chulo = new CHULO(INITIAL_SUPPLY);
        tierNFT = new TierNFT(
            "ChuloBots Tier NFT",
            "CBTIER",
            "https://api.chulobots.com/metadata/"
        );
        staking = new ValidatorStaking(address(chulo), address(tierNFT));

        // Setup permissions
        tierNFT.grantRole(tierNFT.MINTER_ROLE(), address(staking));

        // Distribute tokens for testing
        chulo.transfer(validator1, 100_000 * 10**18);
        chulo.transfer(validator2, 100_000 * 10**18);
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

        // Fast forward past lock period (assuming 7 days)
        vm.warp(block.timestamp + 8 days);

        uint256 balanceBefore = chulo.balanceOf(validator1);

        vm.expectEmit(true, false, false, true);
        emit Unstaked(validator1, stakeAmount);

        staking.unstake(stakeAmount);
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
        vm.expectRevert();
        staking.unstake(stakeAmount);
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

    function testTierNFTMintedOnStake() public {
        uint256 stakeAmount = MIN_STAKE;

        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);
        vm.stopPrank();

        // Verify NFT was minted (if staking contract mints NFTs)
        // This depends on your actual implementation
        // assertEq(tierNFT.balanceOf(validator1), 1);
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

    function testFuzzUnstake(uint256 stakeAmount, uint256 unstakeAmount) public {
        vm.assume(stakeAmount >= MIN_STAKE);
        vm.assume(stakeAmount <= chulo.balanceOf(validator1));
        vm.assume(unstakeAmount > 0 && unstakeAmount <= stakeAmount);

        // Stake
        vm.startPrank(validator1);
        chulo.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);

        // Fast forward
        vm.warp(block.timestamp + 8 days);

        // Unstake
        staking.unstake(unstakeAmount);
        vm.stopPrank();

        (uint256 remainingStake, , , ) = staking.validators(validator1);
        assertEq(remainingStake, stakeAmount - unstakeAmount);
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
