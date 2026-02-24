// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ChainlinkPriceOracle.sol";
import "../contracts/mocks/MockV3Aggregator.sol";

contract ChainlinkPriceOracleTest is Test {
    ChainlinkPriceOracle public oracle;
    MockV3Aggregator public btcFeed;
    MockV3Aggregator public ethFeed;
    MockV3Aggregator public solFeed;

    address public owner;
    address public user1;

    // Price feed constants (8 decimals for USD pairs)
    int256 constant BTC_PRICE = 65000 * 10**8; // $65,000
    int256 constant ETH_PRICE = 3500 * 10**8; // $3,500
    int256 constant SOL_PRICE = 140 * 10**8; // $140

    event PriceFeedAdded(string indexed asset, address indexed feedAddress);
    event PriceFeedUpdated(string indexed asset, address indexed feedAddress);
    event PriceToleranceUpdated(uint256 oldTolerance, uint256 newTolerance);
    event PriceVerified(string indexed asset, int256 signalPrice, int256 oraclePrice, bool isValid);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");

        // Deploy oracle
        oracle = new ChainlinkPriceOracle();

        // Deploy mock price feeds (8 decimals)
        btcFeed = new MockV3Aggregator(8, BTC_PRICE);
        ethFeed = new MockV3Aggregator(8, ETH_PRICE);
        solFeed = new MockV3Aggregator(8, SOL_PRICE);
    }

    // Test adding price feeds
    function testAddPriceFeed() public {
        vm.expectEmit(true, true, false, true);
        emit PriceFeedAdded("BTC", address(btcFeed));

        oracle.addPriceFeed("BTC", address(btcFeed));

        assertTrue(oracle.hasPriceFeed("BTC"));
    }

    function testCannotAddPriceFeedWithZeroAddress() public {
        vm.expectRevert("Invalid feed address");
        oracle.addPriceFeed("BTC", address(0));
    }

    function testCannotAddDuplicatePriceFeed() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        vm.expectRevert("Price feed already exists");
        oracle.addPriceFeed("BTC", address(ethFeed));
    }

    function testOnlyOwnerCanAddPriceFeed() public {
        vm.prank(user1);
        vm.expectRevert();
        oracle.addPriceFeed("BTC", address(btcFeed));
    }

    // Test updating price feeds
    function testUpdatePriceFeed() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        MockV3Aggregator newBtcFeed = new MockV3Aggregator(8, BTC_PRICE + 1000 * 10**8);

        vm.expectEmit(true, true, false, true);
        emit PriceFeedUpdated("BTC", address(newBtcFeed));

        oracle.updatePriceFeed("BTC", address(newBtcFeed));
    }

    function testCannotUpdateNonexistentPriceFeed() public {
        vm.expectRevert("Price feed does not exist");
        oracle.updatePriceFeed("BTC", address(btcFeed));
    }

    function testOnlyOwnerCanUpdatePriceFeed() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        vm.prank(user1);
        vm.expectRevert();
        oracle.updatePriceFeed("BTC", address(btcFeed));
    }

    // Test getting latest price
    function testGetLatestPrice() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        (int256 price, uint256 timestamp) = oracle.getLatestPrice("BTC");

        assertEq(price, BTC_PRICE);
        assertEq(timestamp, block.timestamp);
    }

    function testCannotGetPriceForNonexistentFeed() public {
        vm.expectRevert("Price feed not found");
        oracle.getLatestPrice("BTC");
    }

    function testRejectsStalePriceData() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Fast forward past stale threshold (1 hour + 1 second)
        vm.warp(block.timestamp + 3601);

        vm.expectRevert("Price data too old");
        oracle.getLatestPrice("BTC");
    }

    function testRejectsInvalidPrice() public {
        MockV3Aggregator invalidFeed = new MockV3Aggregator(8, 0);
        oracle.addPriceFeed("INVALID", address(invalidFeed));

        vm.expectRevert("Invalid price");
        oracle.getLatestPrice("INVALID");
    }

    // Test price verification
    function testVerifyPriceWithinTolerance() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Signal price within 2% tolerance
        int256 signalPrice = 65650 * 10**8; // +1% from oracle price

        (bool isValid, int256 oraclePrice, uint256 deviation) = oracle.verifyPrice("BTC", signalPrice);

        assertTrue(isValid);
        assertEq(oraclePrice, BTC_PRICE);
        assertTrue(deviation <= 200); // Within 2% (200 basis points)
    }

    function testVerifyPriceOutsideTolerance() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Signal price outside 2% tolerance
        int256 signalPrice = 67000 * 10**8; // +3.08% from oracle price

        (bool isValid, int256 oraclePrice, uint256 deviation) = oracle.verifyPrice("BTC", signalPrice);

        assertFalse(isValid);
        assertEq(oraclePrice, BTC_PRICE);
        assertTrue(deviation > 200); // Outside 2%
    }

    function testVerifyPriceWithCustomTolerance() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Signal price outside default 2% but within 5%
        int256 signalPrice = 67500 * 10**8; // +3.85% from oracle price

        // Should fail with default tolerance
        (bool isValid1, , ) = oracle.verifyPrice("BTC", signalPrice);
        assertFalse(isValid1);

        // Should pass with 5% custom tolerance
        (bool isValid2, , uint256 deviation) = oracle.verifyPriceWithTolerance("BTC", signalPrice, 500);
        assertTrue(isValid2);
        assertTrue(deviation <= 500);
    }

    function testCannotVerifyWithInvalidSignalPrice() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        vm.expectRevert("Invalid signal price");
        oracle.verifyPrice("BTC", 0);

        vm.expectRevert("Invalid signal price");
        oracle.verifyPrice("BTC", -100);
    }

    function testCannotUseExcessiveCustomTolerance() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        vm.expectRevert("Tolerance cannot exceed 10%");
        oracle.verifyPriceWithTolerance("BTC", BTC_PRICE, 1001);
    }

    // Test tolerance updates
    function testSetPriceTolerance() public {
        uint256 oldTolerance = oracle.priceTolerance();

        vm.expectEmit(false, false, false, true);
        emit PriceToleranceUpdated(oldTolerance, 500);

        oracle.setPriceTolerance(500);

        assertEq(oracle.priceTolerance(), 500);
    }

    function testCannotSetExcessiveTolerance() public {
        vm.expectRevert("Tolerance cannot exceed 10%");
        oracle.setPriceTolerance(1001);
    }

    function testOnlyOwnerCanSetTolerance() public {
        vm.prank(user1);
        vm.expectRevert();
        oracle.setPriceTolerance(300);
    }

    // Test stale price threshold
    function testSetStalePriceThreshold() public {
        oracle.setStalePriceThreshold(7200); // 2 hours

        assertEq(oracle.stalePriceThreshold(), 7200);
    }

    function testCannotSetZeroThreshold() public {
        vm.expectRevert("Threshold must be greater than 0");
        oracle.setStalePriceThreshold(0);
    }

    function testOnlyOwnerCanSetThreshold() public {
        vm.prank(user1);
        vm.expectRevert();
        oracle.setStalePriceThreshold(7200);
    }

    // Test utility functions
    function testHasPriceFeed() public {
        assertFalse(oracle.hasPriceFeed("BTC"));

        oracle.addPriceFeed("BTC", address(btcFeed));

        assertTrue(oracle.hasPriceFeed("BTC"));
    }

    function testGetDecimals() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        uint8 decimals = oracle.getDecimals("BTC");
        assertEq(decimals, 8);
    }

    function testCannotGetDecimalsForNonexistentFeed() public {
        vm.expectRevert("Price feed not found");
        oracle.getDecimals("BTC");
    }

    // Test multiple price feeds
    function testMultiplePriceFeeds() public {
        oracle.addPriceFeed("BTC", address(btcFeed));
        oracle.addPriceFeed("ETH", address(ethFeed));
        oracle.addPriceFeed("SOL", address(solFeed));

        (int256 btcPrice, ) = oracle.getLatestPrice("BTC");
        (int256 ethPrice, ) = oracle.getLatestPrice("ETH");
        (int256 solPrice, ) = oracle.getLatestPrice("SOL");

        assertEq(btcPrice, BTC_PRICE);
        assertEq(ethPrice, ETH_PRICE);
        assertEq(solPrice, SOL_PRICE);
    }

    // Fuzz test price deviation calculations
    function testFuzzPriceDeviation(int256 signalPrice) public {
        vm.assume(signalPrice > 0);
        vm.assume(signalPrice < type(int128).max);

        oracle.addPriceFeed("BTC", address(btcFeed));

        try oracle.verifyPrice("BTC", signalPrice) returns (
            bool isValid,
            int256 oraclePrice,
            uint256 deviation
        ) {
            assertEq(oraclePrice, BTC_PRICE);

            // Calculate expected deviation
            int256 diff = signalPrice > BTC_PRICE
                ? signalPrice - BTC_PRICE
                : BTC_PRICE - signalPrice;
            uint256 expectedDeviation = uint256((diff * 10000) / BTC_PRICE);

            assertEq(deviation, expectedDeviation);

            // Check validity based on tolerance
            if (deviation <= oracle.priceTolerance()) {
                assertTrue(isValid);
            } else {
                assertFalse(isValid);
            }
        } catch {
            // Expected to fail for extreme values
        }
    }

    // Fuzz test adding price feeds
    function testFuzzAddPriceFeed(string calldata asset, int256 price) public {
        vm.assume(bytes(asset).length > 0 && bytes(asset).length < 32);
        vm.assume(price > 0);
        vm.assume(price < type(int128).max);

        MockV3Aggregator feed = new MockV3Aggregator(8, price);
        oracle.addPriceFeed(asset, address(feed));

        assertTrue(oracle.hasPriceFeed(asset));

        (int256 latestPrice, ) = oracle.getLatestPrice(asset);
        assertEq(latestPrice, price);
    }

    // Test price updates
    function testPriceUpdate() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Update price in mock feed
        int256 newPrice = 70000 * 10**8;
        btcFeed.updateAnswer(newPrice);

        (int256 price, ) = oracle.getLatestPrice("BTC");
        assertEq(price, newPrice);
    }

    // Test edge cases
    function testVerifyPriceExactMatch() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        (bool isValid, int256 oraclePrice, uint256 deviation) = oracle.verifyPrice("BTC", BTC_PRICE);

        assertTrue(isValid);
        assertEq(oraclePrice, BTC_PRICE);
        assertEq(deviation, 0);
    }

    function testVerifyPriceAtToleranceBoundary() public {
        oracle.addPriceFeed("BTC", address(btcFeed));

        // Calculate exact 2% above oracle price
        int256 signalPrice = BTC_PRICE + ((BTC_PRICE * 2) / 100);

        (bool isValid, , uint256 deviation) = oracle.verifyPrice("BTC", signalPrice);

        assertTrue(isValid);
        assertEq(deviation, 200); // Exactly 2%
    }
}
