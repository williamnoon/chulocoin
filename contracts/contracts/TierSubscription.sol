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
        OBSERVER,   // Free tier
        BRONZE,
        SILVER,
        GOLD,
        DIAMOND
    }

    enum SubscriptionPeriod {
        MONTHLY,
        YEARLY
    }

    struct Subscription {
        Tier tier;
        uint256 expiresAt;
        uint256 creditsRemaining;
        uint256 subscribedAt;
    }

    struct TierConfig {
        uint256 monthlyPrice;      // CHULO to burn per month
        uint256 yearlyPrice;       // CHULO to burn per year (discounted)
        uint256 monthlyCredits;    // Credits granted per month
        uint256 gasMultiplier;     // Gas fee multiplier (100 = 1.0x, 50 = 0.5x)
    }

    // Subscription duration
    uint256 public constant MONTH_DURATION = 30 days;
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
        // OBSERVER is free, no credits, standard gas
        tierConfigs[Tier.OBSERVER] = TierConfig({
            monthlyPrice: 0,
            yearlyPrice: 0,
            monthlyCredits: 0,
            gasMultiplier: 100 // 1.0x gas
        });

        // BRONZE: 100 CHULO/month, 10 months for yearly
        tierConfigs[Tier.BRONZE] = TierConfig({
            monthlyPrice: 100 * 10**18,
            yearlyPrice: 1000 * 10**18,  // ~16% discount
            monthlyCredits: 100,
            gasMultiplier: 90 // 0.9x gas
        });

        // SILVER: 250 CHULO/month, 10 months for yearly
        tierConfigs[Tier.SILVER] = TierConfig({
            monthlyPrice: 250 * 10**18,
            yearlyPrice: 2500 * 10**18,  // ~16% discount
            monthlyCredits: 300,
            gasMultiplier: 75 // 0.75x gas
        });

        // GOLD: 500 CHULO/month, 10 months for yearly
        tierConfigs[Tier.GOLD] = TierConfig({
            monthlyPrice: 500 * 10**18,
            yearlyPrice: 5000 * 10**18,  // ~16% discount
            monthlyCredits: 750,
            gasMultiplier: 60 // 0.6x gas
        });

        // DIAMOND: 1000 CHULO/month, 10 months for yearly
        tierConfigs[Tier.DIAMOND] = TierConfig({
            monthlyPrice: 1000 * 10**18,
            yearlyPrice: 10000 * 10**18, // ~16% discount
            monthlyCredits: 2000,
            gasMultiplier: 50 // 0.5x gas
        });
    }

    /**
     * @dev Subscribe to a tier by burning CHULO
     */
    function subscribe(Tier tier, SubscriptionPeriod period) external {
        require(tier != Tier.OBSERVER, "Cannot subscribe to Observer tier");
        require(tier > Tier.OBSERVER && tier <= Tier.DIAMOND, "Invalid tier");

        TierConfig memory config = tierConfigs[tier];
        uint256 price = (period == SubscriptionPeriod.MONTHLY)
            ? config.monthlyPrice
            : config.yearlyPrice;
        uint256 duration = (period == SubscriptionPeriod.MONTHLY)
            ? MONTH_DURATION
            : YEAR_DURATION;

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
        uint256 creditsToGrant = (period == SubscriptionPeriod.MONTHLY)
            ? config.monthlyCredits
            : config.monthlyCredits * 12;

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

        if (oldTier != tier && oldTier != Tier.OBSERVER) {
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
            return Tier.OBSERVER; // Subscription expired
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
        uint256 yearlyPrice,
        uint256 monthlyCredits,
        uint256 gasMultiplier
    ) {
        TierConfig memory config = tierConfigs[tier];
        return (
            config.monthlyPrice,
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
        uint256 yearlyPrice,
        uint256 monthlyCredits,
        uint256 gasMultiplier
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            monthlyPrice: monthlyPrice,
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
        if (tier == Tier.BRONZE) return "Bronze";
        if (tier == Tier.SILVER) return "Silver";
        if (tier == Tier.GOLD) return "Gold";
        if (tier == Tier.DIAMOND) return "Diamond";
        return "Observer";
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
