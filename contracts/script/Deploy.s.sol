// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/CHULO.sol";
import "../contracts/ChainlinkPriceOracle.sol";
import "../contracts/TierNFT.sol";
import "../contracts/ValidatorStaking.sol";
import "../contracts/SignalRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy CHULO token
        CHULO chulo = new CHULO(10_000_000 * 10**18);
        console.log("CHULO deployed to:", address(chulo));

        // Deploy ChainlinkPriceOracle
        // Note: Update feed addresses for your target network
        address ethUsdFeed = 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612; // Arbitrum One
        address btcUsdFeed = 0x6ce185860a4963106506C203335A2910413708e9; // Arbitrum One

        ChainlinkPriceOracle priceOracle = new ChainlinkPriceOracle();
        priceOracle.addPriceFeed("ETH/USD", ethUsdFeed);
        priceOracle.addPriceFeed("BTC/USD", btcUsdFeed);
        console.log("ChainlinkPriceOracle deployed to:", address(priceOracle));

        // Deploy TierNFT
        TierNFT tierNFT = new TierNFT(
            "ChuloBots Tier NFT",
            "CBTIER",
            "https://api.chulobots.com/metadata/"
        );
        console.log("TierNFT deployed to:", address(tierNFT));

        // Deploy ValidatorStaking
        ValidatorStaking staking = new ValidatorStaking(
            address(chulo),
            address(tierNFT)
        );
        console.log("ValidatorStaking deployed to:", address(staking));

        // Deploy SignalRegistry
        SignalRegistry signalRegistry = new SignalRegistry(
            address(staking),
            address(tierNFT),
            address(priceOracle)
        );
        console.log("SignalRegistry deployed to:", address(signalRegistry));

        // Setup permissions
        tierNFT.grantRole(tierNFT.MINTER_ROLE(), address(staking));
        console.log("Granted MINTER_ROLE to ValidatorStaking");

        vm.stopBroadcast();

        // Log summary
        console.log("\n=== Deployment Summary ===");
        console.log("CHULO:", address(chulo));
        console.log("ChainlinkPriceOracle:", address(priceOracle));
        console.log("TierNFT:", address(tierNFT));
        console.log("ValidatorStaking:", address(staking));
        console.log("SignalRegistry:", address(signalRegistry));
    }
}
