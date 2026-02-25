// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./CHULO.sol";

/**
 * @title TierSubscription
 * @dev Subscription-based tier system - burn CHULO for monthly/yearly access
 *
 * Features:
 * - Burn CHULO to subscribe (monthly or yearly with discount)
 * - Credits system for actions
 * - Gas fee multipliers (higher tiers pay less)
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
        QUARTERLY,  // Default - 3 months with discount
        YEARLY
    }

    struct Subscription {
        Tier tier;
        uint256 expiresAt;
        uint256 creditsRemaining;
        uint256 subscribedAt;
    }

    struct TierConfig {
        uint256 monthlyPrice;      // CHULO to burn per month (USD equivalent)
        uint256 quarterlyPrice;    // CHULO to burn per quarter (~10% discount)
        uint256 yearlyPrice;       // CHULO to burn per year (~20% discount)
        uint256 monthlyCredits;    // Credits granted per month
        uint256 gasMultiplier;     // Gas fee multiplier (100 = 1.0x, 50 = 0.5x)
    }

    // Subscription duration
    uint256 public constant MONTH_DURATION = 30 days;
    uint256 public constant QUARTER_DURATION = 90 days;  // 3 months
    uint256 public constant YEAR_DURATION = 365 days;

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
        // Quarterly (default): 10% discount
        // Yearly: 20% discount

        // FREE tier (default for everyone)
        tierConfigs[Tier.FREE] = TierConfig({
            monthlyPrice: 0,
            quarterlyPrice: 0,
            yearlyPrice: 0,
            monthlyCredits: 0,
            gasMultiplier: 100 // 1.0x gas (no discount)
        });

        // OBSERVER: $10/mo = 1,000 CHULO/mo
        tierConfigs[Tier.OBSERVER] = TierConfig({
            monthlyPrice: 1_000 * 10**18,
            quarterlyPrice: 2_700 * 10**18,   // $27 (10% off)
            yearlyPrice: 9_600 * 10**18,       // $96 (20% off)
            monthlyCredits: 100,
            gasMultiplier: 90 // 0.9x gas (10% discount)
        });

        // JUNIOR_QUANT: $30/mo = 3,000 CHULO/mo
        tierConfigs[Tier.JUNIOR_QUANT] = TierConfig({
            monthlyPrice: 3_000 * 10**18,
            quarterlyPrice: 8_100 * 10**18,    // $81 (10% off)
            yearlyPrice: 28_800 * 10**18,      // $288 (20% off)
            monthlyCredits: 500,
            gasMultiplier: 75 // 0.75x gas (25% discount)
        });

        // SENIOR_QUANT: $90/mo = 9,000 CHULO/mo
        tierConfigs[Tier.SENIOR_QUANT] = TierConfig({
            monthlyPrice: 9_000 * 10**18,
            quarterlyPrice: 24_300 * 10**18,   // $243 (10% off)
            yearlyPrice: 86_400 * 10**18,      // $864 (20% off)
            monthlyCredits: 2_000,
            gasMultiplier: 60 // 0.6x gas (40% discount)
        });

        // SAGE: $250/mo = 25,000 CHULO/mo
        tierConfigs[Tier.SAGE] = TierConfig({
            monthlyPrice: 25_000 * 10**18,
            quarterlyPrice: 67_500 * 10**18,   // $675 (10% off)
            yearlyPrice: 240_000 * 10**18,     // $2,400 (20% off)
            monthlyCredits: 10_000,
            gasMultiplier: 50 // 0.5x gas (50% discount)
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
        } else if (period == SubscriptionPeriod.QUARTERLY) {
            price = config.quarterlyPrice;
            duration = QUARTER_DURATION;
            monthsInPeriod = 3;
        } else {
            price = config.yearlyPrice;
            duration = YEAR_DURATION;
            monthsInPeriod = 12;
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
     * @dev Get gas multiplier for user
     */
    function getGasMultiplier(address user) external view returns (uint256) {
        Tier tier = _getActiveTier(user);
        return tierConfigs[tier].gasMultiplier;
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
     * @dev Get tier pricing
     */
    function getTierPricing(Tier tier) external view returns (
        uint256 monthlyPrice,
        uint256 quarterlyPrice,
        uint256 yearlyPrice,
        uint256 monthlyCredits,
        uint256 gasMultiplier
    ) {
        TierConfig memory config = tierConfigs[tier];
        return (
            config.monthlyPrice,
            config.quarterlyPrice,
            config.yearlyPrice,
            config.monthlyCredits,
            config.gasMultiplier
        );
    }

    /**
     * @dev Update tier configuration (owner only)
     */
    function updateTierConfig(
        Tier tier,
        uint256 monthlyPrice,
        uint256 quarterlyPrice,
        uint256 yearlyPrice,
        uint256 monthlyCredits,
        uint256 gasMultiplier
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            monthlyPrice: monthlyPrice,
            quarterlyPrice: quarterlyPrice,
            yearlyPrice: yearlyPrice,
            monthlyCredits: monthlyCredits,
            gasMultiplier: gasMultiplier
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
        for (uint8 i = 0; i <= uint8(Tier.DIAMOND); i++) {
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
