// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TierNFT.sol";
import "../contracts/CHULO.sol";

contract TierNFTTest is Test {
    TierNFT public tierNFT;
    CHULO public chulo;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18;
    uint256 constant BRONZE_THRESHOLD = 1_000 * 10**18;
    uint256 constant SILVER_THRESHOLD = 5_000 * 10**18;
    uint256 constant GOLD_THRESHOLD = 25_000 * 10**18;
    uint256 constant DIAMOND_THRESHOLD = 100_000 * 10**18;

    event TierUnlocked(address indexed user, TierNFT.Tier tier, uint256 tokenId);
    event TierUpgraded(address indexed user, TierNFT.Tier oldTier, TierNFT.Tier newTier, uint256 newTokenId);
    event TierDowngraded(address indexed user, TierNFT.Tier oldTier, TierNFT.Tier newTier);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy contracts
        chulo = new CHULO(INITIAL_SUPPLY);
        tierNFT = new TierNFT(address(chulo));
    }

    // Test tier unlocking
    function testUnlockBronzeTier() public {
        // Give user1 enough for Bronze tier
        chulo.transfer(user1, BRONZE_THRESHOLD);

        vm.expectEmit(true, false, false, false);
        emit TierUnlocked(user1, TierNFT.Tier.BRONZE, 0);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.BRONZE));
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    function testUnlockSilverTier() public {
        chulo.transfer(user1, SILVER_THRESHOLD);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.SILVER));
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    function testUnlockGoldTier() public {
        chulo.transfer(user1, GOLD_THRESHOLD);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.GOLD));
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    function testUnlockDiamondTier() public {
        chulo.transfer(user1, DIAMOND_THRESHOLD);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.DIAMOND));
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    function testNoTierForInsufficientBalance() public {
        chulo.transfer(user1, BRONZE_THRESHOLD - 1);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.NONE));
        assertEq(tierNFT.balanceOf(user1), 0);
    }

    // Test tier upgrades
    function testUpgradeFromBronzeToSilver() public {
        // Start with Bronze
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.BRONZE));
        uint256 bronzeTokenId = tierNFT.userTierToken(user1);

        // Upgrade to Silver
        chulo.transfer(user1, SILVER_THRESHOLD - BRONZE_THRESHOLD);

        vm.expectEmit(true, false, false, false);
        emit TierUpgraded(user1, TierNFT.Tier.BRONZE, TierNFT.Tier.SILVER, 2);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.SILVER));
        assertEq(tierNFT.balanceOf(user1), 2); // Now has 2 NFTs (collectibles)

        // Bronze NFT should still exist as collectible badge
        assertEq(tierNFT.ownerOf(bronzeTokenId), user1);
    }

    function testUpgradeFromSilverToGold() public {
        chulo.transfer(user1, SILVER_THRESHOLD);
        tierNFT.updateUserTier(user1);

        chulo.transfer(user1, GOLD_THRESHOLD - SILVER_THRESHOLD);
        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.GOLD));
        assertEq(tierNFT.balanceOf(user1), 2); // Silver + Gold badges
    }

    function testUpgradeFromGoldToDiamond() public {
        chulo.transfer(user1, GOLD_THRESHOLD);
        tierNFT.updateUserTier(user1);

        chulo.transfer(user1, DIAMOND_THRESHOLD - GOLD_THRESHOLD);
        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.DIAMOND));
        assertEq(tierNFT.balanceOf(user1), 2); // Gold + Diamond badges
    }

    function testSkipTierUpgrade() public {
        // Jump straight to Gold
        chulo.transfer(user1, GOLD_THRESHOLD);
        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.GOLD));
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    // Test tier downgrades
    function testDowngradeFromSilverToBronze() public {
        chulo.transfer(user1, SILVER_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 silverTokenId = tierNFT.userTierToken(user1);

        // Transfer away tokens to downgrade to Bronze (keep at least BRONZE_THRESHOLD)
        vm.prank(user1);
        chulo.transfer(user2, SILVER_THRESHOLD - BRONZE_THRESHOLD - 1);

        vm.expectEmit(true, false, false, false);
        emit TierDowngraded(user1, TierNFT.Tier.SILVER, TierNFT.Tier.BRONZE);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.BRONZE));

        // Silver NFT badge should still exist as collectible
        assertEq(tierNFT.ownerOf(silverTokenId), user1);
        assertEq(tierNFT.balanceOf(user1), 1); // Keeps Silver badge
    }

    function testDowngradeToNone() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 bronzeTokenId = tierNFT.userTierToken(user1);

        // Transfer all tokens away
        vm.prank(user1);
        chulo.transfer(user2, BRONZE_THRESHOLD);

        tierNFT.updateUserTier(user1);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.NONE));
        // Keeps Bronze badge as collectible even when tier is NONE
        assertEq(tierNFT.balanceOf(user1), 1);
        assertEq(tierNFT.ownerOf(bronzeTokenId), user1);
    }

    // Test soulbound (non-transferable) functionality
    function testCannotTransferTierNFT() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);

        vm.prank(user1);
        vm.expectRevert("Tier NFTs are non-transferable");
        tierNFT.transferFrom(user1, user2, tokenId);
    }

    function testCannotSafeTransferTierNFT() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);

        vm.prank(user1);
        vm.expectRevert("Tier NFTs are non-transferable");
        tierNFT.safeTransferFrom(user1, user2, tokenId);
    }

    function testCannotApproveForTierNFT() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);

        vm.prank(user1);
        // Approval should work but transfer will fail
        tierNFT.approve(user2, tokenId);

        vm.prank(user2);
        vm.expectRevert("Tier NFTs are non-transferable");
        tierNFT.transferFrom(user1, user2, tokenId);
    }

    // Test tokenURI
    function testBronzeTokenURI() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);
        string memory uri = tierNFT.tokenURI(tokenId);

        // Check that URI contains tier info
        assertTrue(bytes(uri).length > 0);
        // URI should start with data:application/json;utf8,
        assertTrue(
            keccak256(bytes(substring(uri, 0, 28))) ==
            keccak256(bytes("data:application/json;utf8,"))
        );
    }

    function testSilverTokenURI() public {
        chulo.transfer(user1, SILVER_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);
        string memory uri = tierNFT.tokenURI(tokenId);

        assertTrue(bytes(uri).length > 0);
    }

    function testGoldTokenURI() public {
        chulo.transfer(user1, GOLD_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);
        string memory uri = tierNFT.tokenURI(tokenId);

        assertTrue(bytes(uri).length > 0);
    }

    function testDiamondTokenURI() public {
        chulo.transfer(user1, DIAMOND_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);
        string memory uri = tierNFT.tokenURI(tokenId);

        assertTrue(bytes(uri).length > 0);
    }

    function testCannotGetURIForNonexistentToken() public {
        vm.expectRevert("Token does not exist");
        tierNFT.tokenURI(999);
    }

    // Test metadata retrieval
    function testGetTokenMetadata() public {
        chulo.transfer(user1, SILVER_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);

        (TierNFT.Tier tier, uint256 unlockedAt, uint256 chuloBalance) =
            tierNFT.getTokenMetadata(tokenId);

        assertEq(uint8(tier), uint8(TierNFT.Tier.SILVER));
        assertEq(unlockedAt, block.timestamp);
        assertEq(chuloBalance, SILVER_THRESHOLD);
    }

    function testCannotGetMetadataForNonexistentToken() public {
        vm.expectRevert("Token does not exist");
        tierNFT.getTokenMetadata(999);
    }

    // Test tier name retrieval
    function testGetTierNames() public {
        assertEq(tierNFT.getTierName(TierNFT.Tier.NONE), "None");
        assertEq(tierNFT.getTierName(TierNFT.Tier.BRONZE), "Bronze");
        assertEq(tierNFT.getTierName(TierNFT.Tier.SILVER), "Silver");
        assertEq(tierNFT.getTierName(TierNFT.Tier.GOLD), "Gold");
        assertEq(tierNFT.getTierName(TierNFT.Tier.DIAMOND), "Diamond");
    }

    // Test multiple users
    function testMultipleUsersWithDifferentTiers() public {
        address user3 = makeAddr("user3");
        address user4 = makeAddr("user4");

        chulo.transfer(user1, BRONZE_THRESHOLD);
        chulo.transfer(user2, SILVER_THRESHOLD);
        chulo.transfer(user3, GOLD_THRESHOLD);
        chulo.transfer(user4, DIAMOND_THRESHOLD);

        tierNFT.updateUserTier(user1);
        tierNFT.updateUserTier(user2);
        tierNFT.updateUserTier(user3);
        tierNFT.updateUserTier(user4);

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.BRONZE));
        assertEq(uint8(tierNFT.getUserTier(user2)), uint8(TierNFT.Tier.SILVER));
        assertEq(uint8(tierNFT.getUserTier(user3)), uint8(TierNFT.Tier.GOLD));
        assertEq(uint8(tierNFT.getUserTier(user4)), uint8(TierNFT.Tier.DIAMOND));
    }

    // Test no change scenario
    function testUpdateWithNoChange() public {
        chulo.transfer(user1, BRONZE_THRESHOLD);
        tierNFT.updateUserTier(user1);

        uint256 tokenId = tierNFT.userTierToken(user1);

        // Update again with same balance
        tierNFT.updateUserTier(user1);

        // Should still have same tier and token
        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(TierNFT.Tier.BRONZE));
        assertEq(tierNFT.userTierToken(user1), tokenId);
        assertEq(tierNFT.balanceOf(user1), 1);
    }

    // Test invalid user address
    function testCannotUpdateZeroAddress() public {
        vm.expectRevert("Invalid user address");
        tierNFT.updateUserTier(address(0));
    }

    // Fuzz test updateUserTier with various balances
    function testFuzzUpdateUserTier(uint256 balance) public {
        vm.assume(balance <= INITIAL_SUPPLY);

        if (balance > 0) {
            chulo.transfer(user1, balance);
        }

        tierNFT.updateUserTier(user1);

        TierNFT.Tier expectedTier = TierNFT.Tier.NONE;
        if (balance >= DIAMOND_THRESHOLD) {
            expectedTier = TierNFT.Tier.DIAMOND;
        } else if (balance >= GOLD_THRESHOLD) {
            expectedTier = TierNFT.Tier.GOLD;
        } else if (balance >= SILVER_THRESHOLD) {
            expectedTier = TierNFT.Tier.SILVER;
        } else if (balance >= BRONZE_THRESHOLD) {
            expectedTier = TierNFT.Tier.BRONZE;
        }

        assertEq(uint8(tierNFT.getUserTier(user1)), uint8(expectedTier));

        if (expectedTier != TierNFT.Tier.NONE) {
            assertEq(tierNFT.balanceOf(user1), 1);
        } else {
            assertEq(tierNFT.balanceOf(user1), 0);
        }
    }

    // Fuzz test tier upgrades
    function testFuzzTierUpgrade(uint256 initialBalance, uint256 additionalBalance) public {
        vm.assume(initialBalance >= BRONZE_THRESHOLD);
        vm.assume(initialBalance < DIAMOND_THRESHOLD);
        vm.assume(additionalBalance > 0);
        vm.assume(initialBalance + additionalBalance <= INITIAL_SUPPLY);
        vm.assume(initialBalance + additionalBalance > initialBalance); // No overflow

        chulo.transfer(user1, initialBalance);
        tierNFT.updateUserTier(user1);

        TierNFT.Tier initialTier = tierNFT.getUserTier(user1);

        chulo.transfer(user1, additionalBalance);
        tierNFT.updateUserTier(user1);

        TierNFT.Tier finalTier = tierNFT.getUserTier(user1);

        // Final tier should be >= initial tier
        assertTrue(uint8(finalTier) >= uint8(initialTier));

        // Should always have at most 1 NFT
        assertTrue(tierNFT.balanceOf(user1) <= 1);
    }

    // Test ERC721 compliance
    function testSupportsInterface() public {
        // ERC721
        assertTrue(tierNFT.supportsInterface(0x80ac58cd));
        // ERC721Metadata
        assertTrue(tierNFT.supportsInterface(0x5b5e139f));
    }

    function testName() public {
        assertEq(tierNFT.name(), "ChuloBots Tier Badge");
    }

    function testSymbol() public {
        assertEq(tierNFT.symbol(), "CHULO-TIER");
    }

    // Helper function to extract substring
    function substring(
        string memory str,
        uint256 startIndex,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        return string(result);
    }
}
