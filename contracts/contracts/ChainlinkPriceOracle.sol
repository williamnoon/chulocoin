// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainlinkPriceOracle
 * @dev Oracle contract for verifying signal prices using Chainlink price feeds
 *
 * Features:
 * - Multiple asset price feeds (BTC, ETH, SOL, etc.)
 * - Price verification with tolerance threshold
 * - Owner can add/update price feeds
 * - Returns latest price and timestamp
 */
contract ChainlinkPriceOracle is Ownable {
    // Price feeds mapped by asset symbol
    mapping(string => AggregatorV3Interface) public priceFeeds;

    // Price verification tolerance (in basis points, e.g., 200 = 2%)
    uint256 public priceTolerance = 200; // 2% default

    // Stale price threshold (in seconds)
    uint256 public stalePriceThreshold = 3600; // 1 hour

    event PriceFeedAdded(string indexed asset, address indexed feedAddress);
    event PriceFeedUpdated(string indexed asset, address indexed feedAddress);
    event PriceToleranceUpdated(uint256 oldTolerance, uint256 newTolerance);
    event PriceVerified(
        string indexed asset,
        int256 signalPrice,
        int256 oraclePrice,
        bool isValid
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Add a new price feed for an asset
     * @param asset Asset symbol (e.g., "BTC", "ETH")
     * @param feedAddress Chainlink price feed contract address
     */
    function addPriceFeed(string calldata asset, address feedAddress) external onlyOwner {
        require(feedAddress != address(0), "Invalid feed address");
        require(
            address(priceFeeds[asset]) == address(0),
            "Price feed already exists"
        );

        priceFeeds[asset] = AggregatorV3Interface(feedAddress);
        emit PriceFeedAdded(asset, feedAddress);
    }

    /**
     * @dev Update existing price feed for an asset
     * @param asset Asset symbol
     * @param feedAddress New price feed contract address
     */
    function updatePriceFeed(string calldata asset, address feedAddress)
        external
        onlyOwner
    {
        require(feedAddress != address(0), "Invalid feed address");
        require(
            address(priceFeeds[asset]) != address(0),
            "Price feed does not exist"
        );

        priceFeeds[asset] = AggregatorV3Interface(feedAddress);
        emit PriceFeedUpdated(asset, feedAddress);
    }

    /**
     * @dev Update price tolerance threshold
     * @param newTolerance New tolerance in basis points
     */
    function setPriceTolerance(uint256 newTolerance) external onlyOwner {
        require(newTolerance <= 1000, "Tolerance cannot exceed 10%");
        uint256 oldTolerance = priceTolerance;
        priceTolerance = newTolerance;
        emit PriceToleranceUpdated(oldTolerance, newTolerance);
    }

    /**
     * @dev Update stale price threshold
     * @param newThreshold New threshold in seconds
     */
    function setStalePriceThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        stalePriceThreshold = newThreshold;
    }

    /**
     * @dev Get latest price for an asset
     * @param asset Asset symbol
     * @return price Latest price (8 decimals for USD pairs)
     * @return timestamp Price update timestamp
     */
    function getLatestPrice(string calldata asset)
        external
        view
        returns (int256 price, uint256 timestamp)
    {
        AggregatorV3Interface feed = priceFeeds[asset];
        require(address(feed) != address(0), "Price feed not found");

        (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = feed.latestRoundData();

        require(answeredInRound >= roundId, "Stale price data");
        require(answer > 0, "Invalid price");
        require(updatedAt > 0, "Invalid timestamp");
        require(
            block.timestamp - updatedAt <= stalePriceThreshold,
            "Price data too old"
        );

        return (answer, updatedAt);
    }

    /**
     * @dev Verify if a signal price is within acceptable range of oracle price
     * @param asset Asset symbol
     * @param signalPrice Price from signal (8 decimals)
     * @return isValid True if price is within tolerance
     * @return oraclePrice Current oracle price
     * @return deviation Percentage deviation in basis points
     */
    function verifyPrice(string calldata asset, int256 signalPrice)
        external
        returns (
            bool isValid,
            int256 oraclePrice,
            uint256 deviation
        )
    {
        require(signalPrice > 0, "Invalid signal price");

        (int256 latestPrice, ) = this.getLatestPrice(asset);
        oraclePrice = latestPrice;

        // Calculate absolute deviation in basis points
        int256 diff = signalPrice > oraclePrice
            ? signalPrice - oraclePrice
            : oraclePrice - signalPrice;

        deviation = uint256((diff * 10000) / oraclePrice);
        isValid = deviation <= priceTolerance;

        emit PriceVerified(asset, signalPrice, oraclePrice, isValid);

        return (isValid, oraclePrice, deviation);
    }

    /**
     * @dev Verify signal price with custom tolerance
     * @param asset Asset symbol
     * @param signalPrice Price from signal
     * @param customTolerance Custom tolerance in basis points
     */
    function verifyPriceWithTolerance(
        string calldata asset,
        int256 signalPrice,
        uint256 customTolerance
    )
        external
        returns (
            bool isValid,
            int256 oraclePrice,
            uint256 deviation
        )
    {
        require(customTolerance <= 1000, "Tolerance cannot exceed 10%");
        require(signalPrice > 0, "Invalid signal price");

        (int256 latestPrice, ) = this.getLatestPrice(asset);
        oraclePrice = latestPrice;

        int256 diff = signalPrice > oraclePrice
            ? signalPrice - oraclePrice
            : oraclePrice - signalPrice;

        deviation = uint256((diff * 10000) / oraclePrice);
        isValid = deviation <= customTolerance;

        emit PriceVerified(asset, signalPrice, oraclePrice, isValid);

        return (isValid, oraclePrice, deviation);
    }

    /**
     * @dev Check if price feed exists for asset
     * @param asset Asset symbol
     */
    function hasPriceFeed(string calldata asset) external view returns (bool) {
        return address(priceFeeds[asset]) != address(0);
    }

    /**
     * @dev Get price feed decimals
     * @param asset Asset symbol
     */
    function getDecimals(string calldata asset) external view returns (uint8) {
        AggregatorV3Interface feed = priceFeeds[asset];
        require(address(feed) != address(0), "Price feed not found");
        return feed.decimals();
    }
}
