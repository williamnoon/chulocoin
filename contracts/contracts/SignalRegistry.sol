// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CHULO.sol";
import "./ValidatorStaking.sol";

/**
 * @title SignalRegistry
 * @notice Central registry for validated trading signals
 * @dev Validators vote on signals, consensus triggers validation
 */
contract SignalRegistry is Ownable, ReentrancyGuard {
    CHULO public immutable chuloToken;
    ValidatorStaking public immutable validatorStaking;

    // Signal metadata
    struct Signal {
        uint256 id;
        address creator;
        string asset;
        string direction; // "LONG" or "SHORT"
        int256 entry;
        int256 stop;
        int256 target;
        uint256 confidence; // 0-100
        uint256 createdAt;
        uint256 validatedAt;
        uint8 validatorCount;
        bool isValidated;
        mapping(address => bool) validatorVotes;
    }

    // Gas costs (in CHULO tokens, 18 decimals)
    mapping(string => uint256) public gasCosts; // tier => cost

    // Consensus threshold
    uint8 public constant CONSENSUS_THRESHOLD = 3;
    uint8 public constant MAX_VALIDATORS = 5;

    // Storage
    mapping(uint256 => Signal) public signals;
    uint256 public signalCount;

    // Mapping to track which signals each validator has voted on
    mapping(uint256 => address[]) public signalValidators;

    // Events
    event SignalSubmitted(
        uint256 indexed signalId,
        address indexed creator,
        string asset,
        string direction,
        int256 entry,
        int256 stop,
        int256 target,
        uint256 confidence
    );

    event SignalVoted(
        uint256 indexed signalId,
        address indexed validator,
        uint8 voteCount
    );

    event SignalValidated(
        uint256 indexed signalId,
        string asset,
        string direction,
        int256 entry,
        int256 stop,
        int256 target,
        uint256 validatedAt
    );

    event GasCostUpdated(string tier, uint256 newCost);

    /**
     * @notice Constructor
     * @param _chuloToken CHULO token address
     * @param _validatorStaking ValidatorStaking contract address
     */
    constructor(
        address _chuloToken,
        address _validatorStaking
    ) Ownable(msg.sender) {
        require(_chuloToken != address(0), "Invalid CHULO address");
        require(_validatorStaking != address(0), "Invalid staking address");

        chuloToken = CHULO(_chuloToken);
        validatorStaking = ValidatorStaking(_validatorStaking);

        // Set default gas costs (in CHULO with 18 decimals)
        gasCosts["BRONZE"] = 10 * 10**18;
        gasCosts["SILVER"] = 5 * 10**18;
        gasCosts["GOLD"] = 2 * 10**18;
        gasCosts["DIAMOND"] = 1 * 10**18;
    }

    /**
     * @notice Submit a trading signal for validation
     * @param asset Asset symbol (e.g., "BTC", "ETH")
     * @param direction "LONG" or "SHORT"
     * @param entry Entry price (8 decimals)
     * @param stop Stop loss price (8 decimals)
     * @param target Take profit price (8 decimals)
     * @param confidence Confidence score (0-100)
     * @param tier User's tier for gas calculation
     */
    function submitSignal(
        string calldata asset,
        string calldata direction,
        int256 entry,
        int256 stop,
        int256 target,
        uint256 confidence,
        string calldata tier
    ) external nonReentrant returns (uint256) {
        require(bytes(asset).length > 0, "Asset required");
        require(
            keccak256(bytes(direction)) == keccak256(bytes("LONG")) ||
            keccak256(bytes(direction)) == keccak256(bytes("SHORT")),
            "Invalid direction"
        );
        require(entry > 0, "Invalid entry price");
        require(stop > 0, "Invalid stop price");
        require(target > 0, "Invalid target price");
        require(confidence <= 100, "Confidence must be 0-100");

        // Validate stop/target based on direction
        if (keccak256(bytes(direction)) == keccak256(bytes("LONG"))) {
            require(stop < entry, "Stop must be below entry for LONG");
            require(target > entry, "Target must be above entry for LONG");
        } else {
            require(stop > entry, "Stop must be above entry for SHORT");
            require(target < entry, "Target must be below entry for SHORT");
        }

        // Burn gas cost
        uint256 gasCost = gasCosts[tier];
        require(gasCost > 0, "Invalid tier");
        require(
            chuloToken.balanceOf(msg.sender) >= gasCost,
            "Insufficient CHULO for gas"
        );

        // Transfer tokens from user to this contract, then burn
        require(
            chuloToken.transferFrom(msg.sender, address(this), gasCost),
            "Transfer failed"
        );
        chuloToken.burnForGas(gasCost, "Signal submission");

        // Create signal
        signalCount++;
        Signal storage signal = signals[signalCount];
        signal.id = signalCount;
        signal.creator = msg.sender;
        signal.asset = asset;
        signal.direction = direction;
        signal.entry = entry;
        signal.stop = stop;
        signal.target = target;
        signal.confidence = confidence;
        signal.createdAt = block.timestamp;
        signal.validatorCount = 0;
        signal.isValidated = false;

        emit SignalSubmitted(
            signalCount,
            msg.sender,
            asset,
            direction,
            entry,
            stop,
            target,
            confidence
        );

        return signalCount;
    }

    /**
     * @notice Validator votes on a signal
     * @param signalId Signal ID to vote on
     */
    function voteOnSignal(uint256 signalId) external nonReentrant {
        require(signalId > 0 && signalId <= signalCount, "Invalid signal ID");
        Signal storage signal = signals[signalId];
        require(!signal.isValidated, "Signal already validated");
        require(!signal.validatorVotes[msg.sender], "Already voted");

        // Check if caller is a valid staked validator
        (uint256 stakedAmount, , , , , ) = validatorStaking.validators(msg.sender);
        require(
            stakedAmount >= validatorStaking.MIN_STAKE(),
            "Not a valid validator"
        );

        // Record vote
        signal.validatorVotes[msg.sender] = true;
        signal.validatorCount++;
        signalValidators[signalId].push(msg.sender);

        emit SignalVoted(signalId, msg.sender, signal.validatorCount);

        // Check for consensus
        if (signal.validatorCount >= CONSENSUS_THRESHOLD) {
            signal.isValidated = true;
            signal.validatedAt = block.timestamp;

            // Reward validators who voted
            for (uint256 i = 0; i < signalValidators[signalId].length; i++) {
                validatorStaking.recordValidation(
                    signalValidators[signalId][i],
                    signalId
                );
            }

            emit SignalValidated(
                signalId,
                signal.asset,
                signal.direction,
                signal.entry,
                signal.stop,
                signal.target,
                signal.validatedAt
            );
        }
    }

    /**
     * @notice Get signal details
     * @param signalId Signal ID
     */
    function getSignal(uint256 signalId)
        external
        view
        returns (
            uint256 id,
            address creator,
            string memory asset,
            string memory direction,
            int256 entry,
            int256 stop,
            int256 target,
            uint256 confidence,
            uint256 createdAt,
            uint256 validatedAt,
            uint8 validatorCount,
            bool isValidated
        )
    {
        require(signalId > 0 && signalId <= signalCount, "Invalid signal ID");
        Signal storage signal = signals[signalId];

        return (
            signal.id,
            signal.creator,
            signal.asset,
            signal.direction,
            signal.entry,
            signal.stop,
            signal.target,
            signal.confidence,
            signal.createdAt,
            signal.validatedAt,
            signal.validatorCount,
            signal.isValidated
        );
    }

    /**
     * @notice Check if validator has voted on a signal
     * @param signalId Signal ID
     * @param validator Validator address
     */
    function hasValidatorVoted(uint256 signalId, address validator)
        external
        view
        returns (bool)
    {
        require(signalId > 0 && signalId <= signalCount, "Invalid signal ID");
        return signals[signalId].validatorVotes[validator];
    }

    /**
     * @notice Get all validators who voted on a signal
     * @param signalId Signal ID
     */
    function getSignalValidators(uint256 signalId)
        external
        view
        returns (address[] memory)
    {
        require(signalId > 0 && signalId <= signalCount, "Invalid signal ID");
        return signalValidators[signalId];
    }

    /**
     * @notice Update gas cost for a tier
     * @param tier Tier name
     * @param newCost New gas cost (18 decimals)
     */
    function updateGasCost(string calldata tier, uint256 newCost)
        external
        onlyOwner
    {
        require(newCost > 0, "Cost must be positive");
        gasCosts[tier] = newCost;
        emit GasCostUpdated(tier, newCost);
    }
}
