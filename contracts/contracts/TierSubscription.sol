// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./CHULO.sol";

/**
 * @title TierSubscription
 * @dev Subscription-based tier system - burn CHULO for monthly/quarterly access
 *
 * Features:
 * - Burn CHULO to subscribe (monthly or quarterly with discount)
 * - Credits system for actions
 * - Feature-based tier limits (bots, positions, position size)
 * - NFT badges as proof of subscription
 * - No balance requirement - just active subscription
 */
contract TierSubscription is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    CHULO public chuloToken;

    enum Tier {
        FREE,           // Free tier (was OBSERVER)
        OBSERVER,       // $10/mo
        JUNIOR_QUANT,   // $30/mo
        SENIOR_QUANT,   // $90/mo
        SAGE            // $250/mo
    }

    enum SubscriptionPeriod {
        MONTHLY,
        QUARTERLY  // Default - 3 months with tiered discount
    }

    struct Subscription {
        Tier tier;
        uint256 expiresAt;
        uint256 creditsRemaining;
        uint256 subscribedAt;
    }

    struct TierConfig {
        uint256 monthlyPrice;       // CHULO to burn per month (USD equivalent)
        uint256 quarterlyPrice;     // CHULO to burn per quarter (monthly * 3 * discount)
        uint256 monthlyCredits;     // Credits granted per month
        uint256 maxBots;            // Maximum number of bots allowed
        uint256 maxActivePositions; // Maximum active positions
        uint256 maxPositionSize;    // Maximum position size in USD
        uint256 signalDelaySeconds; // Signal delay (0 = real-time, 86400 = 24hr)
        uint256 strategyAccessLevel; // 0 = none, 1 = basic, 2 = intermediate, 3 = advanced, 4 = all + custom
    }

    // Subscription duration
    uint256 public constant MONTH_DURATION = 30 days;
    uint256 public constant QUARTER_DURATION = 90 days;  // 3 months

    // User subscriptions
    mapping(address => Subscription) public subscriptions;

    // Tier configurations
    mapping(Tier => TierConfig) public tierConfigs;

    // Token ID tracking
    uint256 private _nextTokenId;

    // NFT badge tracking (user => tier => tokenId)
    mapping(address => mapping(Tier => uint256)) public userTierBadges;

    event Subscribed(
        address indexed user,
        Tier tier,
        SubscriptionPeriod period,
        uint256 amountBurned,
        uint256 expiresAt,
        uint256 creditsGranted
    );
    event SubscriptionRenewed(address indexed user, Tier tier, uint256 newExpiresAt);
    event SubscriptionUpgraded(address indexed user, Tier oldTier, Tier newTier);
    event CreditsUsed(address indexed user, uint256 amount, string action);
    event BadgeMinted(address indexed user, Tier tier, uint256 tokenId);

    constructor(address _chuloToken)
        ERC721("ChuloBots Subscription Badge", "CHULO-SUB")
        Ownable(msg.sender)
    {
        require(_chuloToken != address(0), "Invalid CHULO token");
        chuloToken = CHULO(_chuloToken);
        _nextTokenId = 1;

        // Initialize tier configs
        // Assuming $0.01 per CHULO for pricing conversions
        // Quarterly discounts: 5%, 10%, 20%, 40% respectively

        // FREE tier (default for everyone)
        tierConfigs[Tier.FREE] = TierConfig({
            monthlyPrice: 0,
            quarterlyPrice: 0,
            monthlyCredits: 0,
            maxBots: 0,
            maxActivePositions: 1,
            maxPositionSize: 100, // $100 max
            signalDelaySeconds: 86400, // 24 hour delay
            strategyAccessLevel: 0 // No strategies
        });

        // OBSERVER: $10/mo = 1,000 CHULO/mo
        // Quarterly: $10 * 3 * 0.95 = $28.50 = 2,850 CHULO (5% off)
        tierConfigs[Tier.OBSERVER] = TierConfig({
            monthlyPrice: 1_000 * 10**18,
            quarterlyPrice: 2_850 * 10**18,
            monthlyCredits: 100,
            maxBots: 1,
            maxActivePositions: 3,
            maxPositionSize: 500, // $500 max
            signalDelaySeconds: 0, // Real-time signals
            strategyAccessLevel: 1 // Basic strategies
        });

        // JUNIOR_QUANT: $30/mo = 3,000 CHULO/mo
        // Quarterly: $30 * 3 * 0.90 = $81 = 8,100 CHULO (10% off)
        tierConfigs[Tier.JUNIOR_QUANT] = TierConfig({
            monthlyPrice: 3_000 * 10**18,
            quarterlyPrice: 8_100 * 10**18,
            monthlyCredits: 500,
            maxBots: 3,
            maxActivePositions: 10,
            maxPositionSize: 2_500, // $2,500 max
            signalDelaySeconds: 0, // Real-time signals
            strategyAccessLevel: 2 // Intermediate strategies
        });

        // SENIOR_QUANT: $90/mo = 9,000 CHULO/mo
        // Quarterly: $90 * 3 * 0.80 = $216 = 21,600 CHULO (20% off)
        tierConfigs[Tier.SENIOR_QUANT] = TierConfig({
            monthlyPrice: 9_000 * 10**18,
            quarterlyPrice: 21_600 * 10**18,
            monthlyCredits: 2_000,
            maxBots: 10,
            maxActivePositions: 50,
            maxPositionSize: 10_000, // $10,000 max
            signalDelaySeconds: 0, // Real-time signals
            strategyAccessLevel: 3 // Advanced strategies
        });

        // SAGE: $250/mo = 25,000 CHULO/mo
        // Quarterly: $250 * 3 * 0.60 = $450 = 45,000 CHULO (40% off)
        tierConfigs[Tier.SAGE] = TierConfig({
            monthlyPrice: 25_000 * 10**18,
            quarterlyPrice: 45_000 * 10**18,
            monthlyCredits: 10_000,
            maxBots: 50,
            maxActivePositions: 200,
            maxPositionSize: 100_000, // $100,000 max
            signalDelaySeconds: 0, // Real-time signals
            strategyAccessLevel: 4 // All strategies + custom
        });
    }

    /**
     * @dev Subscribe to a tier by burning CHULO
     */
    function subscribe(Tier tier, SubscriptionPeriod period) external {
        require(tier != Tier.FREE, "Cannot subscribe to Free tier");
        require(tier > Tier.FREE && tier <= Tier.SAGE, "Invalid tier");

        TierConfig memory config = tierConfigs[tier];

        // Get price and duration based on period
        uint256 price;
        uint256 duration;
        uint256 monthsInPeriod;

        if (period == SubscriptionPeriod.MONTHLY) {
            price = config.monthlyPrice;
            duration = MONTH_DURATION;
            monthsInPeriod = 1;
        } else {
            // QUARTERLY
            price = config.quarterlyPrice;
            duration = QUARTER_DURATION;
            monthsInPeriod = 3;
        }

        require(chuloToken.balanceOf(msg.sender) >= price, "Insufficient CHULO");

        Subscription storage sub = subscriptions[msg.sender];
        Tier oldTier = _getActiveTier(msg.sender);

        // Burn CHULO for subscription
        chuloToken.burnFrom(msg.sender, price);

        // Calculate new expiration (extend if already subscribed)
        uint256 startTime = (sub.expiresAt > block.timestamp)
            ? sub.expiresAt
            : block.timestamp;
        uint256 newExpiresAt = startTime + duration;

        // Grant credits based on period
        uint256 creditsToGrant = config.monthlyCredits * monthsInPeriod;

        // Update subscription
        sub.tier = tier;
        sub.expiresAt = newExpiresAt;
        sub.creditsRemaining += creditsToGrant;
        sub.subscribedAt = block.timestamp;

        // Mint badge NFT if first time subscribing to this tier
        if (userTierBadges[msg.sender][tier] == 0) {
            _mintBadge(msg.sender, tier);
        }

        emit Subscribed(msg.sender, tier, period, price, newExpiresAt, creditsToGrant);

        if (oldTier != tier && oldTier != Tier.FREE) {
            emit SubscriptionUpgraded(msg.sender, oldTier, tier);
        }
    }

    /**
     * @dev Mint a tier badge NFT
     */
    function _mintBadge(address user, Tier tier) internal {
        uint256 tokenId = _nextTokenId++;
        _safeMint(user, tokenId);

        userTierBadges[user][tier] = tokenId;

        emit BadgeMinted(user, tier, tokenId);
    }

    /**
     * @dev Use credits for an action
     */
    function useCredits(address user, uint256 amount, string calldata action) external onlyOwner {
        Subscription storage sub = subscriptions[user];
        require(sub.creditsRemaining >= amount, "Insufficient credits");

        sub.creditsRemaining -= amount;

        emit CreditsUsed(user, amount, action);
    }

    /**
     * @dev Get user's active tier (considering expiration)
     */
    function getActiveTier(address user) external view returns (Tier) {
        return _getActiveTier(user);
    }

    function _getActiveTier(address user) internal view returns (Tier) {
        Subscription memory sub = subscriptions[user];

        if (sub.expiresAt < block.timestamp) {
            return Tier.FREE; // Subscription expired - revert to free tier
        }

        return sub.tier;
    }

    /**
     * @dev Check if subscription is active
     */
    function isSubscriptionActive(address user) external view returns (bool) {
        return subscriptions[user].expiresAt >= block.timestamp;
    }

    /**
     * @dev Get tier limits for user
     */
    function getTierLimits(address user) external view returns (
        uint256 maxBots,
        uint256 maxActivePositions,
        uint256 maxPositionSize,
        uint256 signalDelaySeconds,
        uint256 strategyAccessLevel
    ) {
        Tier tier = _getActiveTier(user);
        TierConfig memory config = tierConfigs[tier];
        return (
            config.maxBots,
            config.maxActivePositions,
            config.maxPositionSize,
            config.signalDelaySeconds,
            config.strategyAccessLevel
        );
    }

    /**
     * @dev Get credits remaining
     */
    function getCreditsRemaining(address user) external view returns (uint256) {
        return subscriptions[user].creditsRemaining;
    }

    /**
     * @dev Get subscription info
     */
    function getSubscriptionInfo(address user) external view returns (
        Tier activeTier,
        uint256 expiresAt,
        uint256 creditsRemaining,
        uint256 daysRemaining,
        bool isActive
    ) {
        Subscription memory sub = subscriptions[user];
        activeTier = _getActiveTier(user);
        expiresAt = sub.expiresAt;
        creditsRemaining = sub.creditsRemaining;

        if (sub.expiresAt > block.timestamp) {
            daysRemaining = (sub.expiresAt - block.timestamp) / 1 days;
            isActive = true;
        } else {
            daysRemaining = 0;
            isActive = false;
        }
    }

    /**
     * @dev Get tier pricing and limits
     */
    function getTierPricing(Tier tier) external view returns (
        uint256 monthlyPrice,
        uint256 quarterlyPrice,
        uint256 monthlyCredits,
        uint256 maxBots,
        uint256 maxActivePositions,
        uint256 maxPositionSize,
        uint256 signalDelaySeconds,
        uint256 strategyAccessLevel
    ) {
        TierConfig memory config = tierConfigs[tier];
        return (
            config.monthlyPrice,
            config.quarterlyPrice,
            config.monthlyCredits,
            config.maxBots,
            config.maxActivePositions,
            config.maxPositionSize,
            config.signalDelaySeconds,
            config.strategyAccessLevel
        );
    }

    /**
     * @dev Update tier configuration (owner only)
     */
    function updateTierConfig(
        Tier tier,
        uint256 monthlyPrice,
        uint256 quarterlyPrice,
        uint256 monthlyCredits,
        uint256 maxBots,
        uint256 maxActivePositions,
        uint256 maxPositionSize,
        uint256 signalDelaySeconds,
        uint256 strategyAccessLevel
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            monthlyPrice: monthlyPrice,
            quarterlyPrice: quarterlyPrice,
            monthlyCredits: monthlyCredits,
            maxBots: maxBots,
            maxActivePositions: maxActivePositions,
            maxPositionSize: maxPositionSize,
            signalDelaySeconds: signalDelaySeconds,
            strategyAccessLevel: strategyAccessLevel
        });
    }

    /**
     * @dev Override transfers to make badges non-transferable
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Allow minting (from = address(0)) and burning (to = address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert("Subscription badges are non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Generate token URI with subscription info
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        address owner = ownerOf(tokenId);
        Tier activeTier = _getActiveTier(owner);
        Subscription memory sub = subscriptions[owner];

        // Find which tier this badge represents
        Tier badgeTier = Tier.OBSERVER;
        for (uint8 i = 0; i <= uint8(Tier.SAGE); i++) {
            if (userTierBadges[owner][Tier(i)] == tokenId) {
                badgeTier = Tier(i);
                break;
            }
        }

        string memory tierName = _getTierName(badgeTier);
        string memory status = (activeTier == badgeTier && sub.expiresAt >= block.timestamp)
            ? "Active"
            : "Inactive";

        string memory json = string(
            abi.encodePacked(
                '{"name":"ChuloBots ',
                tierName,
                ' Badge","description":"Subscription badge for ChuloBots network","tier":"',
                tierName,
                '","status":"',
                status,
                '","expires_at":',
                sub.expiresAt.toString(),
                ',"credits":',
                sub.creditsRemaining.toString(),
                "}"
            )
        );

        return string(abi.encodePacked("data:application/json;utf8,", json));
    }

    function _getTierName(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.OBSERVER) return "Observer";
        if (tier == Tier.JUNIOR_QUANT) return "Junior Quant";
        if (tier == Tier.SENIOR_QUANT) return "Senior Quant";
        if (tier == Tier.SAGE) return "Sage";
        return "Free";
    }

    /**
     * @dev Required override for ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
