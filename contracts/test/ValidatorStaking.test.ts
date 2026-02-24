import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CHULO, ValidatorStaking } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('ValidatorStaking', function () {
  let chulo: CHULO;
  let staking: ValidatorStaking;
  let owner: SignerWithAddress;
  let validator1: SignerWithAddress;
  let validator2: SignerWithAddress;
  let validator3: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther('10000000');
  const MIN_STAKE = ethers.parseEther('10000');
  const MAX_STAKE = ethers.parseEther('200000');

  beforeEach(async function () {
    [owner, validator1, validator2, validator3] = await ethers.getSigners();

    // Deploy CHULO
    const CHULOFactory = await ethers.getContractFactory('CHULO');
    chulo = await CHULOFactory.deploy(INITIAL_SUPPLY);
    await chulo.waitForDeployment();

    // Deploy ValidatorStaking
    const StakingFactory = await ethers.getContractFactory('ValidatorStaking');
    staking = await StakingFactory.deploy(await chulo.getAddress());
    await staking.waitForDeployment();

    // Grant minter role to staking contract for rewards
    const MINTER_ROLE = await chulo.MINTER_ROLE();
    await chulo.grantRole(MINTER_ROLE, await staking.getAddress());

    // Distribute CHULO to validators
    await chulo.transfer(validator1.address, ethers.parseEther('50000'));
    await chulo.transfer(validator2.address, ethers.parseEther('50000'));
    await chulo.transfer(validator3.address, ethers.parseEther('50000'));
  });

  describe('Staking', function () {
    it('Should allow staking minimum amount', async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);

      const [stake, , , isActive, reputation] = await staking.getValidator(validator1.address);
      expect(stake).to.equal(MIN_STAKE);
      expect(isActive).to.be.true;
      expect(reputation).to.equal(100);
    });

    it('Should allow staking maximum amount', async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MAX_STAKE);
      await staking.connect(validator1).stake(MAX_STAKE);

      const [stake] = await staking.getValidator(validator1.address);
      expect(stake).to.equal(MAX_STAKE);
    });

    it('Should emit ValidatorStaked event', async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);

      await expect(staking.connect(validator1).stake(MIN_STAKE))
        .to.emit(staking, 'ValidatorStaked')
        .withArgs(validator1.address, MIN_STAKE);
    });

    it('Should revert if staking below minimum', async function () {
      const tooLow = ethers.parseEther('5000');
      await chulo.connect(validator1).approve(await staking.getAddress(), tooLow);

      await expect(staking.connect(validator1).stake(tooLow)).to.be.revertedWith(
        'Stake below minimum'
      );
    });

    it('Should revert if staking above maximum', async function () {
      const tooHigh = ethers.parseEther('250000');
      await chulo.transfer(validator1.address, tooHigh);
      await chulo.connect(validator1).approve(await staking.getAddress(), tooHigh);

      await expect(staking.connect(validator1).stake(tooHigh)).to.be.revertedWith(
        'Stake above maximum'
      );
    });

    it('Should revert if already active validator', async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE * 2n);
      await staking.connect(validator1).stake(MIN_STAKE);

      await expect(staking.connect(validator1).stake(MIN_STAKE)).to.be.revertedWith(
        'Already active validator'
      );
    });

    it('Should update totalStaked', async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);

      expect(await staking.totalStaked()).to.equal(MIN_STAKE);
    });
  });

  describe('Unstaking', function () {
    beforeEach(async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);
    });

    it('Should allow unstaking after 7 days', async function () {
      // Fast forward 7 days
      await time.increase(7 * 24 * 60 * 60);

      const balanceBefore = await chulo.balanceOf(validator1.address);
      await staking.connect(validator1).unstake();
      const balanceAfter = await chulo.balanceOf(validator1.address);

      expect(balanceAfter - balanceBefore).to.equal(MIN_STAKE);
    });

    it('Should revert if unstaking before 7 days', async function () {
      await expect(staking.connect(validator1).unstake()).to.be.revertedWith(
        'Must wait 7 days after staking'
      );
    });

    it('Should emit ValidatorUnstaked event', async function () {
      await time.increase(7 * 24 * 60 * 60);

      await expect(staking.connect(validator1).unstake())
        .to.emit(staking, 'ValidatorUnstaked')
        .withArgs(validator1.address, MIN_STAKE);
    });

    it('Should mark validator as inactive', async function () {
      await time.increase(7 * 24 * 60 * 60);
      await staking.connect(validator1).unstake();

      const [, , , isActive] = await staking.getValidator(validator1.address);
      expect(isActive).to.be.false;
    });

    it('Should include earned rewards in withdrawal', async function () {
      // Record validation to earn rewards
      await staking.recordValidation(validator1.address, 1);

      await time.increase(7 * 24 * 60 * 60);

      const balanceBefore = await chulo.balanceOf(validator1.address);
      await staking.connect(validator1).unstake();
      const balanceAfter = await chulo.balanceOf(validator1.address);

      const expectedTotal = MIN_STAKE + ethers.parseEther('0.25'); // stake + reward
      expect(balanceAfter - balanceBefore).to.equal(expectedTotal);
    });
  });

  describe('Validation Recording', function () {
    beforeEach(async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);
    });

    it('Should record validation and pay reward', async function () {
      await staking.recordValidation(validator1.address, 123);

      const [, rewards, validations] = await staking.getValidator(validator1.address);
      expect(rewards).to.equal(ethers.parseEther('0.25'));
      expect(validations).to.equal(1);
    });

    it('Should emit ValidationCompleted and RewardPaid events', async function () {
      await expect(staking.recordValidation(validator1.address, 123))
        .to.emit(staking, 'ValidationCompleted')
        .withArgs(validator1.address, 123)
        .and.to.emit(staking, 'RewardPaid')
        .withArgs(validator1.address, ethers.parseEther('0.25'));
    });

    it('Should improve reputation', async function () {
      // Lower reputation first
      await staking.slashValidator(validator1.address, 'test');

      const [, , , , repBefore] = await staking.getValidator(validator1.address);

      await staking.recordValidation(validator1.address, 1);

      const [, , , , repAfter] = await staking.getValidator(validator1.address);
      expect(repAfter).to.be.gt(repBefore);
    });

    it('Should allow only owner to record validation', async function () {
      await expect(
        staking.connect(validator2).recordValidation(validator1.address, 1)
      ).to.be.reverted;
    });
  });

  describe('Slashing', function () {
    beforeEach(async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);
    });

    it('Should slash 10% of stake', async function () {
      const [stakeBefore] = await staking.getValidator(validator1.address);

      await staking.slashValidator(validator1.address, 'Bad behavior');

      const [stakeAfter] = await staking.getValidator(validator1.address);
      const slashed = stakeBefore - stakeAfter;
      const expectedSlash = (stakeBefore * 10n) / 100n;

      expect(slashed).to.equal(expectedSlash);
    });

    it('Should add slashed amount to burn pool', async function () {
      await staking.slashValidator(validator1.address, 'Bad behavior');

      const burnPool = await staking.burnPool();
      const expectedSlash = (MIN_STAKE * 10n) / 100n;

      expect(burnPool).to.equal(expectedSlash);
    });

    it('Should reduce reputation', async function () {
      const [, , , , repBefore] = await staking.getValidator(validator1.address);

      await staking.slashValidator(validator1.address, 'Misbehavior');

      const [, , , , repAfter] = await staking.getValidator(validator1.address);
      expect(repAfter).to.equal(repBefore - 20n);
    });

    it('Should emit ValidatorSlashed event', async function () {
      const expectedSlash = (MIN_STAKE * 10n) / 100n;

      await expect(staking.slashValidator(validator1.address, 'Test reason'))
        .to.emit(staking, 'ValidatorSlashed')
        .withArgs(validator1.address, expectedSlash, 'Test reason');
    });

    it('Should deactivate validator if stake falls below minimum', async function () {
      // Slash multiple times
      await staking.slashValidator(validator1.address, 'Slash 1');
      await staking.slashValidator(validator1.address, 'Slash 2');

      const [, , , isActive] = await staking.getValidator(validator1.address);
      expect(isActive).to.be.false;
    });
  });

  describe('Burn Pool Distribution', function () {
    beforeEach(async function () {
      // Setup multiple validators
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);

      await chulo.connect(validator2).approve(await staking.getAddress(), MIN_STAKE * 2n);
      await staking.connect(validator2).stake(MIN_STAKE * 2n);

      // Add funds to burn pool by slashing
      await staking.slashValidator(validator1.address, 'Add to pool');
    });

    it('Should distribute burn pool after 7 days', async function () {
      await time.increase(7 * 24 * 60 * 60);

      const [, rewardsBefore1] = await staking.getValidator(validator1.address);
      const [, rewardsBefore2] = await staking.getValidator(validator2.address);

      await staking.distributeBurnPool();

      const [, rewardsAfter1] = await staking.getValidator(validator1.address);
      const [, rewardsAfter2] = await staking.getValidator(validator2.address);

      expect(rewardsAfter1).to.be.gt(rewardsBefore1);
      expect(rewardsAfter2).to.be.gt(rewardsBefore2);
    });

    it('Should distribute proportionally to stake', async function () {
      await time.increase(7 * 24 * 60 * 60);

      await staking.distributeBurnPool();

      const [, rewards1] = await staking.getValidator(validator1.address);
      const [, rewards2] = await staking.getValidator(validator2.address);

      // Validator2 has 2x stake, should get 2x rewards
      expect(rewards2 / rewards1).to.be.closeTo(2n, 1n);
    });

    it('Should revert if called before 7 days', async function () {
      await expect(staking.distributeBurnPool()).to.be.revertedWith(
        'Distribution interval not passed'
      );
    });

    it('Should emit BurnPoolDistributed event', async function () {
      await time.increase(7 * 24 * 60 * 60);

      await expect(staking.distributeBurnPool()).to.emit(staking, 'BurnPoolDistributed');
    });

    it('Should reset burn pool after distribution', async function () {
      await time.increase(7 * 24 * 60 * 60);
      await staking.distributeBurnPool();

      expect(await staking.burnPool()).to.equal(0);
    });
  });

  describe('Validator Queries', function () {
    beforeEach(async function () {
      await chulo.connect(validator1).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator1).stake(MIN_STAKE);

      await chulo.connect(validator2).approve(await staking.getAddress(), MIN_STAKE);
      await staking.connect(validator2).stake(MIN_STAKE);
    });

    it('Should return correct validator count', async function () {
      expect(await staking.getValidatorCount()).to.equal(2);
    });

    it('Should return active validators', async function () {
      const activeValidators = await staking.getActiveValidators();
      expect(activeValidators.length).to.equal(2);
      expect(activeValidators).to.include(validator1.address);
      expect(activeValidators).to.include(validator2.address);
    });

    it('Should exclude inactive validators from count', async function () {
      await time.increase(7 * 24 * 60 * 60);
      await staking.connect(validator1).unstake();

      expect(await staking.getValidatorCount()).to.equal(1);
    });
  });
});
