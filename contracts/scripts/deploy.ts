import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy CHULO Token
  console.log('\n--- Deploying CHULO Token ---');
  const initialSupply = ethers.parseEther('10000000'); // 10M tokens initial supply
  const CHULOFactory = await ethers.getContractFactory('CHULO');
  const chulo = await CHULOFactory.deploy(initialSupply);
  await chulo.waitForDeployment();
  const chuloAddress = await chulo.getAddress();

  console.log('CHULO Token deployed to:', chuloAddress);
  console.log('Initial supply:', ethers.formatEther(initialSupply));
  console.log('Max supply:', ethers.formatEther(await chulo.MAX_SUPPLY()));
  console.log('Deployer balance:', ethers.formatEther(await chulo.balanceOf(deployer.address)));

  // Deploy ChainlinkPriceOracle
  console.log('\n--- Deploying ChainlinkPriceOracle ---');
  const OracleFactory = await ethers.getContractFactory('ChainlinkPriceOracle');
  const oracle = await OracleFactory.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();

  console.log('ChainlinkPriceOracle deployed to:', oracleAddress);

  // Chainlink price feed addresses on Arbitrum Goerli
  // Note: Update these with actual Arbitrum Goerli addresses
  const priceFeeds = {
    BTC: '0x6550bc2301936011c1334555e62A87705A81C12C', // BTC/USD on Arbitrum Goerli
    ETH: '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08', // ETH/USD on Arbitrum Goerli
    // SOL: '0x...', // Add SOL/USD if available on Arbitrum Goerli
  };

  // Add price feeds
  console.log('\n--- Adding Price Feeds ---');
  for (const [asset, feedAddress] of Object.entries(priceFeeds)) {
    console.log(`Adding ${asset} price feed:`, feedAddress);
    const tx = await oracle.addPriceFeed(asset, feedAddress);
    await tx.wait();
    console.log(`✓ ${asset} price feed added`);
  }

  // Test price feed
  console.log('\n--- Testing Price Feed ---');
  try {
    const [btcPrice, timestamp] = await oracle.getLatestPrice('BTC');
    console.log('BTC Price:', ethers.formatUnits(btcPrice, 8), 'USD');
    console.log('Timestamp:', new Date(Number(timestamp) * 1000).toISOString());
  } catch (error) {
    console.log('⚠️  Could not fetch BTC price (may need mainnet/testnet connection)');
  }

  // Deploy TierNFT
  console.log('\n--- Deploying TierNFT ---');
  const TierNFTFactory = await ethers.getContractFactory('TierNFT');
  const tierNFT = await TierNFTFactory.deploy(chuloAddress);
  await tierNFT.waitForDeployment();
  const tierNFTAddress = await tierNFT.getAddress();

  console.log('TierNFT deployed to:', tierNFTAddress);
  console.log('Connected to CHULO token:', chuloAddress);

  // Deploy ValidatorStaking
  console.log('\n--- Deploying ValidatorStaking ---');
  const ValidatorStakingFactory = await ethers.getContractFactory('ValidatorStaking');
  const validatorStaking = await ValidatorStakingFactory.deploy(chuloAddress);
  await validatorStaking.waitForDeployment();
  const validatorStakingAddress = await validatorStaking.getAddress();

  console.log('ValidatorStaking deployed to:', validatorStakingAddress);
  console.log('Connected to CHULO token:', chuloAddress);
  console.log('Min stake:', ethers.formatEther(await validatorStaking.MIN_STAKE()), 'CHULO');
  console.log('Max stake:', ethers.formatEther(await validatorStaking.MAX_STAKE()), 'CHULO');

  // Grant MINTER_ROLE to ValidatorStaking
  console.log('\n--- Granting Permissions ---');
  const MINTER_ROLE = await chulo.MINTER_ROLE();
  console.log('Granting MINTER_ROLE to ValidatorStaking...');
  const grantTx = await chulo.grantRole(MINTER_ROLE, validatorStakingAddress);
  await grantTx.wait();
  console.log('✓ ValidatorStaking can now mint CHULO rewards');

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      CHULO: {
        address: chuloAddress,
        initialSupply: ethers.formatEther(initialSupply),
        maxSupply: ethers.formatEther(await chulo.MAX_SUPPLY()),
      },
      ChainlinkPriceOracle: {
        address: oracleAddress,
        priceFeeds: priceFeeds,
      },
      TierNFT: {
        address: tierNFTAddress,
        chuloToken: chuloAddress,
      },
      ValidatorStaking: {
        address: validatorStakingAddress,
        chuloToken: chuloAddress,
        minStake: ethers.formatEther(await validatorStaking.MIN_STAKE()),
        maxStake: ethers.formatEther(await validatorStaking.MAX_STAKE()),
      },
    },
    timestamp: new Date().toISOString(),
  };

  console.log('\n--- Deployment Summary ---');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for block confirmations before verifying
  console.log('\nWaiting for block confirmations...');
  await chulo.deploymentTransaction()?.wait(5);

  console.log('\n✅ Deployment complete!');
  console.log('\nTo verify contracts on Arbiscan, run:');
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${chuloAddress} "${initialSupply}"`);
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${oracleAddress}`);
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${tierNFTAddress} "${chuloAddress}"`);
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${validatorStakingAddress} "${chuloAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
