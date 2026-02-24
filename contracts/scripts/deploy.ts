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
    },
    timestamp: new Date().toISOString(),
  };

  console.log('\n--- Deployment Summary ---');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for block confirmations before verifying
  console.log('\nWaiting for block confirmations...');
  await chulo.deploymentTransaction()?.wait(5);

  console.log('\n✅ Deployment complete!');
  console.log('\nTo verify the contract on Arbiscan, run:');
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${chuloAddress} "${initialSupply}"`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
