// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CHULO.sol";

contract CHULOTest is Test {
    CHULO public chulo;
    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        chulo = new CHULO(INITIAL_SUPPLY);
    }

    function testInitialSupply() public {
        assertEq(chulo.totalSupply(), INITIAL_SUPPLY);
        assertEq(chulo.balanceOf(owner), INITIAL_SUPPLY);
    }

    function testMetadata() public {
        assertEq(chulo.name(), "CHULO");
        assertEq(chulo.symbol(), "CHULO");
        assertEq(chulo.decimals(), 18);
    }

    function testTransfer() public {
        uint256 amount = 1000 * 10**18;

        chulo.transfer(user1, amount);

        assertEq(chulo.balanceOf(user1), amount);
        assertEq(chulo.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testTransferFrom() public {
        uint256 amount = 1000 * 10**18;

        chulo.approve(user1, amount);

        vm.prank(user1);
        chulo.transferFrom(owner, user2, amount);

        assertEq(chulo.balanceOf(user2), amount);
        assertEq(chulo.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testBurn() public {
        uint256 burnAmount = 1000 * 10**18;
        uint256 expectedSupply = INITIAL_SUPPLY - burnAmount;

        chulo.burn(burnAmount);

        assertEq(chulo.totalSupply(), expectedSupply);
        assertEq(chulo.balanceOf(owner), expectedSupply);
    }

    function testMint() public {
        uint256 mintAmount = 1000 * 10**18;
        uint256 expectedSupply = INITIAL_SUPPLY + mintAmount;

        chulo.mint(user1, mintAmount);

        assertEq(chulo.totalSupply(), expectedSupply);
        assertEq(chulo.balanceOf(user1), mintAmount);
    }

    function testMintOnlyOwner() public {
        uint256 mintAmount = 1000 * 10**18;

        vm.prank(user1);
        vm.expectRevert();
        chulo.mint(user1, mintAmount);
    }

    function testCannotTransferToZeroAddress() public {
        vm.expectRevert();
        chulo.transfer(address(0), 100);
    }

    function testCannotTransferMoreThanBalance() public {
        vm.prank(user1);
        vm.expectRevert();
        chulo.transfer(user2, 100);
    }

    // Fuzz testing
    function testFuzzTransfer(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(to != owner);
        vm.assume(amount <= INITIAL_SUPPLY);

        chulo.transfer(to, amount);

        assertEq(chulo.balanceOf(to), amount);
        assertEq(chulo.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testFuzzMint(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount <= type(uint256).max - INITIAL_SUPPLY);

        uint256 balanceBefore = chulo.balanceOf(to);
        uint256 supplyBefore = chulo.totalSupply();

        chulo.mint(to, amount);

        assertEq(chulo.balanceOf(to), balanceBefore + amount);
        assertEq(chulo.totalSupply(), supplyBefore + amount);
    }

    function testFuzzBurn(uint256 amount) public {
        vm.assume(amount <= INITIAL_SUPPLY);

        uint256 supplyBefore = chulo.totalSupply();

        chulo.burn(amount);

        assertEq(chulo.totalSupply(), supplyBefore - amount);
    }
}
