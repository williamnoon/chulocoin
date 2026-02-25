// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CHULO.sol";

/**
 * @title ValidatorStaking
 * @dev Staking contract for ChuloBots validators
 *
 * Features:
 * - Stake 10k-200k CHULO to become validator
 * - Earn rewards for signal validation (0.25 CHULO per validation)
 * - Slashing for misbehavior
 * - Share of burn pool distribution (2-5% based on stake)
 */
contract ValidatorStaking is Ownable, ReentrancyGuard {
    CHULO public chuloToken;

    uint256 public constant MIN_STAKE = 1_000 * 10**18; // 1k CHULO (lowered for accessibility)
    uint256 public constant MAX_STAKE = 100_000 * 10**18; // 100k CHULO
    uint256 public constant REWARD_PER_VALIDATION = 0.25 * 10**18; // 0.25 CHULO
    uint256 public constant SLASH_PERCENTAGE = 10; // 10% slash on misbehavior

    struct Validator {
        uint256 stake;
        uint256 rewardsEarned;
        uint256 validationCount;
        uint256 stakedAt;
        bool isActive;
        uint256 reputation; // 0-100 score
    }

    // Validator address => Validator info
    mapping(address => Validator) public validators;

    // List of all validator addresses
    address[] public validatorList;

    // Total staked across all validators
    uint256 public totalStaked;

    // Burn pool accumulated from gas payments
    uint256 public burnPool;

    // Last burn pool distribution timestamp
    uint256 public lastBurnDistribution;

    // Burn pool distribution interval (7 days)
    uint256 public constant BURN_DISTRIBUTION_INTERVAL = 7 days;

    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorUnstaked(address indexed validator, uint256 amount);
    event RewardPaid(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event BurnPoolDistributed(uint256 totalAmount, uint256 validatorCount);
    event ValidationCompleted(address indexed validator, uint256 signalId);

    constructor(address _chuloToken) Ownable(msg.sender) {
        require(_chuloToken != address(0), "Invalid CHULO token address");
        chuloToken = CHULO(_chuloToken);
        lastBurnDistribution = block.timestamp;
    }

    /**
     * @dev Stake CHULO to become validator
     * @param amount Amount to stake (must be between MIN_STAKE and MAX_STAKE)
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount >= MIN_STAKE, "Stake below minimum");
        require(amount <= MAX_STAKE, "Stake above maximum");
        require(!validators[msg.sender].isActive, "Already active validator");
        require(
            chuloToken.balanceOf(msg.sender) >= amount,
            "Insufficient CHULO balance"
        );

        // Transfer CHULO to contract
        require(
            chuloToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Create validator record
        validators[msg.sender] = Validator({
            stake: amount,
            rewardsEarned: 0,
            validationCount: 0,
            stakedAt: block.timestamp,
            isActive: true,
            reputation: 100 // Start with perfect reputation
        });

        validatorList.push(msg.sender);
        totalStaked += amount;

        emit ValidatorStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake and withdraw CHULO
     */
    function unstake() external nonReentrant {
        Validator storage validator = validators[msg.sender];
        require(validator.isActive, "Not an active validator");
        require(
            block.timestamp >= validator.stakedAt + 7 days,
            "Must wait 7 days after staking"
        );

        uint256 amount = validator.stake + validator.rewardsEarned;

        // Mark inactive
        validator.isActive = false;
        totalStaked -= validator.stake;

        // Transfer tokens back
        require(chuloToken.transfer(msg.sender, amount), "Transfer failed");

        emit ValidatorUnstaked(msg.sender, amount);
    }

    /**
     * @dev Record successful validation and pay reward
     * @param validatorAddress Address of validator who completed validation
     * @param signalId ID of validated signal
     */
    function recordValidation(address validatorAddress, uint256 signalId)
        external
        onlyOwner
    {
        Validator storage validator = validators[validatorAddress];
        require(validator.isActive, "Validator not active");

        // Increment validation count
        validator.validationCount++;

        // Pay reward
        validator.rewardsEarned += REWARD_PER_VALIDATION;

        // Improve reputation slightly
        if (validator.reputation < 100) {
            validator.reputation = _min(validator.reputation + 1, 100);
        }

        emit ValidationCompleted(validatorAddress, signalId);
        emit RewardPaid(validatorAddress, REWARD_PER_VALIDATION);
    }

    /**
     * @dev Slash validator for misbehavior
     * @param validatorAddress Address of misbehaving validator
     * @param reason Reason for slashing
     */
    function slashValidator(address validatorAddress, string calldata reason)
        external
        onlyOwner
    {
        Validator storage validator = validators[validatorAddress];
        require(validator.isActive, "Validator not active");

        // Calculate slash amount (10% of stake)
        uint256 slashAmount = (validator.stake * SLASH_PERCENTAGE) / 100;

        // Reduce stake
        validator.stake -= slashAmount;
        totalStaked -= slashAmount;

        // Add to burn pool
        burnPool += slashAmount;

        // Reduce reputation significantly
        if (validator.reputation > 20) {
            validator.reputation -= 20;
        } else {
            validator.reputation = 0;
        }

        // If stake falls below minimum, deactivate
        if (validator.stake < MIN_STAKE) {
            validator.isActive = false;
        }

        emit ValidatorSlashed(validatorAddress, slashAmount, reason);
    }

    /**
     * @dev Distribute burn pool to validators
     * Can be called by anyone once per week
     */
    function distributeBurnPool() external nonReentrant {
        require(
            block.timestamp >= lastBurnDistribution + BURN_DISTRIBUTION_INTERVAL,
            "Distribution interval not passed"
        );
        require(burnPool > 0, "No funds in burn pool");

        uint256 poolToDistribute = burnPool;
        uint256 activeValidators = 0;

        // Count active validators
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeValidators++;
            }
        }

        require(activeValidators > 0, "No active validators");

        // Distribute proportionally based on stake
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validatorAddr = validatorList[i];
            Validator storage validator = validators[validatorAddr];

            if (validator.isActive) {
                // Share = (validator stake / total staked) * pool
                uint256 share = (validator.stake * poolToDistribute) / totalStaked;
                validator.rewardsEarned += share;
            }
        }

        // Reset burn pool and update timestamp
        burnPool = 0;
        lastBurnDistribution = block.timestamp;

        emit BurnPoolDistributed(poolToDistribute, activeValidators);
    }

    /**
     * @dev Add funds to burn pool (called when users pay gas)
     * @param amount Amount to add
     */
    function addToBurnPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        burnPool += amount;
    }

    /**
     * @dev Get validator info
     */
    function getValidator(address validatorAddress)
        external
        view
        returns (
            uint256 stakedAmount,
            uint256 rewards,
            uint256 validations,
            bool isActive,
            uint256 reputation
        )
    {
        Validator memory validator = validators[validatorAddress];
        return (
            validator.stake,
            validator.rewardsEarned,
            validator.validationCount,
            validator.isActive,
            validator.reputation
        );
    }

    /**
     * @dev Get total number of validators
     */
    function getValidatorCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Get all active validators
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 activeCount = 0;

        // Count active validators
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeCount++;
            }
        }

        // Create array of active validators
        address[] memory active = new address[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                active[index] = validatorList[i];
                index++;
            }
        }

        return active;
    }

    /**
     * @dev Helper function for minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
