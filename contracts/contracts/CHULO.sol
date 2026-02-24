// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CHULO Token
 * @dev ERC-20 token for ChuloBots network with burn and controlled minting
 *
 * Features:
 * - Fixed maximum supply: 100,000,000 tokens
 * - Burnable for gas payments (deflationary)
 * - Controlled minting for rewards (miners, validators)
 * - Role-based access control
 */
contract CHULO is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    uint256 public totalBurned;

    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event TokensMinted(address indexed to, uint256 amount, string reason);

    /**
     * @dev Constructor mints initial supply to deployer
     * @param initialSupply Initial supply to mint (in wei, with 18 decimals)
     */
    constructor(uint256 initialSupply) ERC20("ChuloBots", "CHULO") {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @dev Mints tokens for rewards (validators, miners)
     * @param to Address to receive minted tokens
     * @param amount Amount to mint (in wei)
     * @param reason Reason for minting (for tracking)
     */
    function mint(address to, uint256 amount, string calldata reason)
        external
        onlyRole(MINTER_ROLE)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Burns tokens for gas payments
     * @param amount Amount to burn (in wei)
     * @param reason Reason for burn (e.g., "gas_payment")
     */
    function burnForGas(uint256 amount, string calldata reason) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _burn(msg.sender, amount);
        totalBurned += amount;

        emit TokensBurned(msg.sender, amount, reason);
    }

    /**
     * @dev Override burn to track total burned
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount, "manual_burn");
    }

    /**
     * @dev Override burnFrom to track total burned
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        totalBurned += amount;
        emit TokensBurned(account, amount, "burn_from");
    }

    /**
     * @dev Returns circulating supply (total supply - burned)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Returns remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
