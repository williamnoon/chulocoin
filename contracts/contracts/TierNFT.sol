// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./CHULO.sol";

/**
 * @title TierNFT
 * @dev Auto-minting NFT badges for ChuloBots tier system
 *
 * Features:
 * - Auto-mint NFT when user reaches tier threshold
 * - Auto-burn previous tier NFT on upgrade
 * - On-chain metadata with tier info and unlock date
 * - Non-transferable (soulbound) tier badges
 */
contract TierNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    CHULO public chuloToken;

    enum Tier {
        NONE,
        BRONZE,
        SILVER,
        GOLD,
        DIAMOND
    }

    struct TierMetadata {
        Tier tier;
        uint256 unlockedAt;
        uint256 chuloBalanceAtUnlock;
    }

    // Tier thresholds (in wei, 18 decimals)
    uint256 public constant BRONZE_THRESHOLD = 1_000 * 10**18;
    uint256 public constant SILVER_THRESHOLD = 5_000 * 10**18;
    uint256 public constant GOLD_THRESHOLD = 25_000 * 10**18;
    uint256 public constant DIAMOND_THRESHOLD = 100_000 * 10**18;

    // User address => current tier token ID
    mapping(address => uint256) public userTierToken;

    // Token ID => tier metadata
    mapping(uint256 => TierMetadata) public tokenMetadata;

    // User address => current tier
    mapping(address => Tier) public userCurrentTier;

    uint256 private _nextTokenId;

    event TierUnlocked(address indexed user, Tier tier, uint256 tokenId);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier, uint256 newTokenId);
    event TierDowngraded(address indexed user, Tier oldTier, Tier newTier);

    constructor(address _chuloToken) ERC721("ChuloBots Tier Badge", "CHULO-TIER") Ownable(msg.sender) {
        require(_chuloToken != address(0), "Invalid CHULO token address");
        chuloToken = CHULO(_chuloToken);
    }

    /**
     * @dev Check and update user's tier based on CHULO balance
     * @param user User address to check
     */
    function updateUserTier(address user) external {
        require(user != address(0), "Invalid user address");

        uint256 balance = chuloToken.balanceOf(user);
        Tier currentTier = userCurrentTier[user];
        Tier newTier = _calculateTier(balance);

        if (newTier == currentTier) {
            return; // No change
        }

        if (newTier > currentTier) {
            // Upgrade: burn old NFT, mint new one
            _upgradeTier(user, currentTier, newTier, balance);
        } else {
            // Downgrade: burn current NFT
            _downgradeTier(user, currentTier, newTier);
        }
    }

    /**
     * @dev Calculate tier based on CHULO balance
     */
    function _calculateTier(uint256 balance) internal pure returns (Tier) {
        if (balance >= DIAMOND_THRESHOLD) return Tier.DIAMOND;
        if (balance >= GOLD_THRESHOLD) return Tier.GOLD;
        if (balance >= SILVER_THRESHOLD) return Tier.SILVER;
        if (balance >= BRONZE_THRESHOLD) return Tier.BRONZE;
        return Tier.NONE;
    }

    /**
     * @dev Upgrade user to higher tier
     */
    function _upgradeTier(
        address user,
        Tier oldTier,
        Tier newTier,
        uint256 balance
    ) internal {
        // Burn old tier NFT if exists
        uint256 oldTokenId = userTierToken[user];
        if (oldTokenId > 0 && _ownerOf(oldTokenId) == user) {
            _burn(oldTokenId);
        }

        // Mint new tier NFT
        uint256 newTokenId = _nextTokenId++;
        _safeMint(user, newTokenId);

        // Store metadata
        tokenMetadata[newTokenId] = TierMetadata({
            tier: newTier,
            unlockedAt: block.timestamp,
            chuloBalanceAtUnlock: balance
        });

        // Update mappings
        userTierToken[user] = newTokenId;
        userCurrentTier[user] = newTier;

        if (oldTier == Tier.NONE) {
            emit TierUnlocked(user, newTier, newTokenId);
        } else {
            emit TierUpgraded(user, oldTier, newTier, newTokenId);
        }
    }

    /**
     * @dev Downgrade user to lower tier
     */
    function _downgradeTier(
        address user,
        Tier oldTier,
        Tier newTier
    ) internal {
        // Burn current tier NFT
        uint256 oldTokenId = userTierToken[user];
        if (oldTokenId > 0 && _ownerOf(oldTokenId) == user) {
            _burn(oldTokenId);
        }

        // Update mappings
        userTierToken[user] = 0;
        userCurrentTier[user] = newTier;

        emit TierDowngraded(user, oldTier, newTier);
    }

    /**
     * @dev Get user's current tier
     */
    function getUserTier(address user) external view returns (Tier) {
        return userCurrentTier[user];
    }

    /**
     * @dev Get tier name as string
     */
    function getTierName(Tier tier) public pure returns (string memory) {
        if (tier == Tier.BRONZE) return "Bronze";
        if (tier == Tier.SILVER) return "Silver";
        if (tier == Tier.GOLD) return "Gold";
        if (tier == Tier.DIAMOND) return "Diamond";
        return "None";
    }

    /**
     * @dev Get token metadata
     */
    function getTokenMetadata(uint256 tokenId)
        external
        view
        returns (
            Tier tier,
            uint256 unlockedAt,
            uint256 chuloBalance
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        TierMetadata memory metadata = tokenMetadata[tokenId];
        return (metadata.tier, metadata.unlockedAt, metadata.chuloBalanceAtUnlock);
    }

    /**
     * @dev Override transfers to make NFTs non-transferable (soulbound)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from = 0) and burning (to = 0)
        // Block transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert("Tier NFTs are non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Generate on-chain token URI with metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        TierMetadata memory metadata = tokenMetadata[tokenId];
        string memory tierName = getTierName(metadata.tier);

        // Simple JSON metadata (in production, use proper JSON encoding)
        string memory json = string(
            abi.encodePacked(
                '{"name":"ChuloBots ',
                tierName,
                ' Tier","description":"Tier badge for ChuloBots network","tier":"',
                tierName,
                '","unlocked_at":',
                metadata.unlockedAt.toString(),
                ',"chulo_balance":',
                (metadata.chuloBalanceAtUnlock / 10**18).toString(),
                "}"
            )
        );

        return string(abi.encodePacked("data:application/json;utf8,", json));
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
