import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CHULO, TierNFT } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('TierNFT', function () {
  let chulo: CHULO;
  let tierNFT: TierNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther('10000000');

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy CHULO token
    const CHULOFactory = await ethers.getContractFactory('CHULO');
    chulo = await CHULOFactory.deploy(INITIAL_SUPPLY);
    await chulo.waitForDeployment();

    // Deploy TierNFT
    const TierNFTFactory = await ethers.getContractFactory('TierNFT');
    tierNFT = await TierNFTFactory.deploy(await chulo.getAddress());
    await tierNFT.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set correct CHULO token address', async function () {
      expect(await tierNFT.chuloToken()).to.equal(await chulo.getAddress());
    });

    it('Should set correct tier thresholds', async function () {
      expect(await tierNFT.BRONZE_THRESHOLD()).to.equal(ethers.parseEther('1000'));
      expect(await tierNFT.SILVER_THRESHOLD()).to.equal(ethers.parseEther('5000'));
      expect(await tierNFT.GOLD_THRESHOLD()).to.equal(ethers.parseEther('25000'));
      expect(await tierNFT.DIAMOND_THRESHOLD()).to.equal(ethers.parseEther('100000'));
    });

    it('Should have correct NFT name and symbol', async function () {
      expect(await tierNFT.name()).to.equal('ChuloBots Tier Badge');
      expect(await tierNFT.symbol()).to.equal('CHULO-TIER');
    });
  });

  describe('Tier Unlocking', function () {
    it('Should mint Bronze NFT when user reaches 1k CHULO', async function () {
      // Transfer 1k CHULO to user1
      await chulo.transfer(user1.address, ethers.parseEther('1000'));

      // Update tier
      await tierNFT.updateUserTier(user1.address);

      // Check tier
      const tier = await tierNFT.getUserTier(user1.address);
      expect(tier).to.equal(1); // BRONZE = 1

      // Check NFT ownership
      const tokenId = await tierNFT.userTierToken(user1.address);
      expect(await tierNFT.ownerOf(tokenId)).to.equal(user1.address);
    });

    it('Should mint Silver NFT at 5k CHULO', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('5000'));
      await tierNFT.updateUserTier(user1.address);

      const tier = await tierNFT.getUserTier(user1.address);
      expect(tier).to.equal(2); // SILVER = 2
    });

    it('Should mint Gold NFT at 25k CHULO', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('25000'));
      await tierNFT.updateUserTier(user1.address);

      const tier = await tierNFT.getUserTier(user1.address);
      expect(tier).to.equal(3); // GOLD = 3
    });

    it('Should mint Diamond NFT at 100k CHULO', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('100000'));
      await tierNFT.updateUserTier(user1.address);

      const tier = await tierNFT.getUserTier(user1.address);
      expect(tier).to.equal(4); // DIAMOND = 4
    });

    it('Should emit TierUnlocked event on first tier', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));

      await expect(tierNFT.updateUserTier(user1.address))
        .to.emit(tierNFT, 'TierUnlocked')
        .withArgs(user1.address, 1, 0); // Bronze tier, token ID 0
    });
  });

  describe('Tier Upgrades', function () {
    it('Should upgrade from Bronze to Silver and burn old NFT', async function () {
      // Start at Bronze
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);
      const bronzeTokenId = await tierNFT.userTierToken(user1.address);

      // Upgrade to Silver
      await chulo.transfer(user1.address, ethers.parseEther('4000')); // Total 5k
      await tierNFT.updateUserTier(user1.address);

      // Check Bronze NFT is burned
      await expect(tierNFT.ownerOf(bronzeTokenId)).to.be.reverted;

      // Check Silver NFT exists
      const silverTokenId = await tierNFT.userTierToken(user1.address);
      expect(silverTokenId).to.not.equal(bronzeTokenId);
      expect(await tierNFT.ownerOf(silverTokenId)).to.equal(user1.address);

      // Check tier
      expect(await tierNFT.getUserTier(user1.address)).to.equal(2); // SILVER
    });

    it('Should emit TierUpgraded event', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);

      await chulo.transfer(user1.address, ethers.parseEther('4000'));
      await expect(tierNFT.updateUserTier(user1.address))
        .to.emit(tierNFT, 'TierUpgraded');
    });

    it('Should allow multiple upgrades', async function () {
      // Bronze
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(1);

      // Silver
      await chulo.transfer(user1.address, ethers.parseEther('4000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(2);

      // Gold
      await chulo.transfer(user1.address, ethers.parseEther('20000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(3);

      // Diamond
      await chulo.transfer(user1.address, ethers.parseEther('75000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(4);
    });
  });

  describe('Tier Downgrades', function () {
    it('Should downgrade and burn NFT when balance drops', async function () {
      // Start at Gold
      await chulo.transfer(user1.address, ethers.parseEther('25000'));
      await tierNFT.updateUserTier(user1.address);
      const goldTokenId = await tierNFT.userTierToken(user1.address);

      // Burn CHULO to drop below Gold threshold
      await chulo.connect(user1).burn(ethers.parseEther('15000')); // 10k remaining = Silver

      // Update tier
      await tierNFT.updateUserTier(user1.address);

      // Check Gold NFT is burned
      await expect(tierNFT.ownerOf(goldTokenId)).to.be.reverted;

      // Check downgrade to Silver
      expect(await tierNFT.getUserTier(user1.address)).to.equal(2); // SILVER
      expect(await tierNFT.userTierToken(user1.address)).to.equal(0); // No token until re-mint
    });

    it('Should emit TierDowngraded event', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('5000'));
      await tierNFT.updateUserTier(user1.address);

      await chulo.connect(user1).burn(ethers.parseEther('4500'));

      await expect(tierNFT.updateUserTier(user1.address))
        .to.emit(tierNFT, 'TierDowngraded');
    });
  });

  describe('Token Metadata', function () {
    it('Should store correct metadata on mint', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);

      const tokenId = await tierNFT.userTierToken(user1.address);
      const [tier, unlockedAt, balance] = await tierNFT.getTokenMetadata(tokenId);

      expect(tier).to.equal(1); // BRONZE
      expect(unlockedAt).to.be.gt(0);
      expect(balance).to.equal(ethers.parseEther('1000'));
    });

    it('Should generate correct tokenURI', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('5000'));
      await tierNFT.updateUserTier(user1.address);

      const tokenId = await tierNFT.userTierToken(user1.address);
      const uri = await tierNFT.tokenURI(tokenId);

      expect(uri).to.include('ChuloBots Silver Tier');
      expect(uri).to.include('unlocked_at');
      expect(uri).to.include('chulo_balance');
    });
  });

  describe('Non-Transferability (Soulbound)', function () {
    it('Should prevent transfers between users', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);

      const tokenId = await tierNFT.userTierToken(user1.address);

      // Attempt transfer
      await expect(
        tierNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId)
      ).to.be.revertedWith('Tier NFTs are non-transferable');
    });

    it('Should allow burning (for downgrades)', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);
      const tokenId = await tierNFT.userTierToken(user1.address);

      // Downgrade triggers burn
      await chulo.connect(user1).burn(ethers.parseEther('500'));
      await tierNFT.updateUserTier(user1.address);

      // NFT should be burned
      await expect(tierNFT.ownerOf(tokenId)).to.be.reverted;
    });
  });

  describe('Edge Cases', function () {
    it('Should handle no tier (balance = 0)', async function () {
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(0); // NONE
    });

    it('Should not change tier if balance unchanged', async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);

      const tokenId1 = await tierNFT.userTierToken(user1.address);

      // Update again without balance change
      await tierNFT.updateUserTier(user1.address);

      const tokenId2 = await tierNFT.userTierToken(user1.address);
      expect(tokenId1).to.equal(tokenId2);
    });

    it('Should handle exact threshold amounts', async function () {
      // Exactly 1k = Bronze
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(1);

      // Exactly 5k = Silver
      await chulo.transfer(user1.address, ethers.parseEther('4000'));
      await tierNFT.updateUserTier(user1.address);
      expect(await tierNFT.getUserTier(user1.address)).to.equal(2);
    });

    it('Should revert on invalid user address', async function () {
      await expect(tierNFT.updateUserTier(ethers.ZeroAddress)).to.be.revertedWith(
        'Invalid user address'
      );
    });
  });

  describe('Helper Functions', function () {
    it('Should return correct tier names', async function () {
      expect(await tierNFT.getTierName(0)).to.equal('None');
      expect(await tierNFT.getTierName(1)).to.equal('Bronze');
      expect(await tierNFT.getTierName(2)).to.equal('Silver');
      expect(await tierNFT.getTierName(3)).to.equal('Gold');
      expect(await tierNFT.getTierName(4)).to.equal('Diamond');
    });
  });
});
