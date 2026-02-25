import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignalRegistry, CHULO, ValidatorStaking } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('SignalRegistry', function () {
  let signalRegistry: SignalRegistry;
  let chulo: CHULO;
  let validatorStaking: ValidatorStaking;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let validator1: SignerWithAddress;
  let validator2: SignerWithAddress;
  let validator3: SignerWithAddress;
  let validator4: SignerWithAddress;
  let validator5: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther('10000000');
  const MIN_STAKE = ethers.parseEther('10000');
  const BRONZE_GAS = ethers.parseEther('10');

  beforeEach(async function () {
    [owner, creator, validator1, validator2, validator3, validator4, validator5] =
      await ethers.getSigners();

    // Deploy CHULO token
    const CHULOFactory = await ethers.getContractFactory('CHULO');
    chulo = await CHULOFactory.deploy(INITIAL_SUPPLY);
    await chulo.waitForDeployment();

    // Deploy ValidatorStaking
    const ValidatorStakingFactory = await ethers.getContractFactory('ValidatorStaking');
    validatorStaking = await ValidatorStakingFactory.deploy(await chulo.getAddress());
    await validatorStaking.waitForDeployment();

    // Deploy SignalRegistry
    const SignalRegistryFactory = await ethers.getContractFactory('SignalRegistry');
    signalRegistry = await SignalRegistryFactory.deploy(
      await chulo.getAddress(),
      await validatorStaking.getAddress()
    );
    await signalRegistry.waitForDeployment();

    // Grant MINTER_ROLE to ValidatorStaking
    const MINTER_ROLE = await chulo.MINTER_ROLE();
    await chulo.grantRole(MINTER_ROLE, await validatorStaking.getAddress());

    // Distribute tokens
    await chulo.transfer(creator.address, ethers.parseEther('100000'));
    await chulo.transfer(validator1.address, ethers.parseEther('100000'));
    await chulo.transfer(validator2.address, ethers.parseEther('100000'));
    await chulo.transfer(validator3.address, ethers.parseEther('100000'));
    await chulo.transfer(validator4.address, ethers.parseEther('100000'));
    await chulo.transfer(validator5.address, ethers.parseEther('100000'));

    // Setup validators
    await chulo.connect(validator1).approve(await validatorStaking.getAddress(), MIN_STAKE);
    await validatorStaking.connect(validator1).stake(MIN_STAKE);

    await chulo.connect(validator2).approve(await validatorStaking.getAddress(), MIN_STAKE);
    await validatorStaking.connect(validator2).stake(MIN_STAKE);

    await chulo.connect(validator3).approve(await validatorStaking.getAddress(), MIN_STAKE);
    await validatorStaking.connect(validator3).stake(MIN_STAKE);

    await chulo.connect(validator4).approve(await validatorStaking.getAddress(), MIN_STAKE);
    await validatorStaking.connect(validator4).stake(MIN_STAKE);

    await chulo.connect(validator5).approve(await validatorStaking.getAddress(), MIN_STAKE);
    await validatorStaking.connect(validator5).stake(MIN_STAKE);

    // Approve SignalRegistry to burn tokens
    await chulo
      .connect(creator)
      .approve(await signalRegistry.getAddress(), ethers.parseEther('1000'));
  });

  describe('Deployment', function () {
    it('Should set the correct CHULO token', async function () {
      expect(await signalRegistry.chuloToken()).to.equal(await chulo.getAddress());
    });

    it('Should set the correct ValidatorStaking', async function () {
      expect(await signalRegistry.validatorStaking()).to.equal(await validatorStaking.getAddress());
    });

    it('Should initialize default gas costs', async function () {
      expect(await signalRegistry.gasCosts('BRONZE')).to.equal(ethers.parseEther('10'));
      expect(await signalRegistry.gasCosts('SILVER')).to.equal(ethers.parseEther('5'));
      expect(await signalRegistry.gasCosts('GOLD')).to.equal(ethers.parseEther('2'));
      expect(await signalRegistry.gasCosts('DIAMOND')).to.equal(ethers.parseEther('1'));
    });
  });

  describe('Signal Submission', function () {
    it('Should submit a valid LONG signal', async function () {
      const tx = await signalRegistry.connect(creator).submitSignal(
        'BTC',
        'LONG',
        50000_00000000, // entry $50k
        48000_00000000, // stop $48k
        55000_00000000, // target $55k
        85,
        'BRONZE'
      );

      await expect(tx)
        .to.emit(signalRegistry, 'SignalSubmitted')
        .withArgs(
          1,
          creator.address,
          'BTC',
          'LONG',
          50000_00000000,
          48000_00000000,
          55000_00000000,
          85
        );

      expect(await signalRegistry.signalCount()).to.equal(1);
    });

    it('Should submit a valid SHORT signal', async function () {
      await signalRegistry.connect(creator).submitSignal(
        'ETH',
        'SHORT',
        3000_00000000, // entry $3k
        3100_00000000, // stop $3.1k
        2800_00000000, // target $2.8k
        75,
        'BRONZE'
      );

      const signal = await signalRegistry.getSignal(1);
      expect(signal.direction).to.equal('SHORT');
      expect(signal.entry).to.equal(3000_00000000);
      expect(signal.stop).to.equal(3100_00000000);
      expect(signal.target).to.equal(2800_00000000);
    });

    it('Should burn gas cost on submission', async function () {
      const balanceBefore = await chulo.balanceOf(creator.address);

      await signalRegistry
        .connect(creator)
        .submitSignal('BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, 85, 'BRONZE');

      const balanceAfter = await chulo.balanceOf(creator.address);
      expect(balanceBefore - balanceAfter).to.equal(BRONZE_GAS);
    });

    it('Should reject signal with invalid direction', async function () {
      await expect(
        signalRegistry
          .connect(creator)
          .submitSignal(
            'BTC',
            'SIDEWAYS',
            50000_00000000,
            48000_00000000,
            55000_00000000,
            85,
            'BRONZE'
          )
      ).to.be.revertedWith('Invalid direction');
    });

    it('Should reject LONG signal with stop above entry', async function () {
      await expect(
        signalRegistry.connect(creator).submitSignal(
          'BTC',
          'LONG',
          50000_00000000,
          52000_00000000, // stop above entry
          55000_00000000,
          85,
          'BRONZE'
        )
      ).to.be.revertedWith('Stop must be below entry for LONG');
    });

    it('Should reject SHORT signal with stop below entry', async function () {
      await expect(
        signalRegistry.connect(creator).submitSignal(
          'BTC',
          'SHORT',
          50000_00000000,
          48000_00000000, // stop below entry
          45000_00000000,
          85,
          'BRONZE'
        )
      ).to.be.revertedWith('Stop must be above entry for SHORT');
    });

    it('Should reject signal with insufficient balance', async function () {
      // Create account with no tokens
      const [poorUser] = await ethers.getSigners();

      await expect(
        signalRegistry
          .connect(poorUser)
          .submitSignal('BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, 85, 'BRONZE')
      ).to.be.reverted;
    });
  });

  describe('Validator Voting', function () {
    beforeEach(async function () {
      // Submit a signal
      await signalRegistry
        .connect(creator)
        .submitSignal('BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, 85, 'BRONZE');
    });

    it('Should allow validator to vote', async function () {
      const tx = await signalRegistry.connect(validator1).voteOnSignal(1);

      await expect(tx).to.emit(signalRegistry, 'SignalVoted').withArgs(1, validator1.address, 1);

      expect(await signalRegistry.hasValidatorVoted(1, validator1.address)).to.be.true;
    });

    it('Should reject duplicate vote from same validator', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);

      await expect(signalRegistry.connect(validator1).voteOnSignal(1)).to.be.revertedWith(
        'Already voted'
      );
    });

    it('Should reject vote from non-validator', async function () {
      await expect(signalRegistry.connect(creator).voteOnSignal(1)).to.be.revertedWith(
        'Not a valid validator'
      );
    });

    it('Should track validator count', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);

      const signal = await signalRegistry.getSignal(1);
      expect(signal.validatorCount).to.equal(2);
    });
  });

  describe('Consensus Achievement', function () {
    beforeEach(async function () {
      // Submit a signal
      await signalRegistry
        .connect(creator)
        .submitSignal('BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, 85, 'BRONZE');
    });

    it('Should validate signal after 3 votes', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);

      const tx = await signalRegistry.connect(validator3).voteOnSignal(1);

      await expect(tx)
        .to.emit(signalRegistry, 'SignalValidated')
        .withArgs(1, 'BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, anyValue);

      const signal = await signalRegistry.getSignal(1);
      expect(signal.isValidated).to.be.true;
      expect(signal.validatedAt).to.be.gt(0);
    });

    it('Should not validate with only 2 votes', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);

      const signal = await signalRegistry.getSignal(1);
      expect(signal.isValidated).to.be.false;
    });

    it('Should reject votes after validation', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);
      await signalRegistry.connect(validator3).voteOnSignal(1);

      await expect(signalRegistry.connect(validator4).voteOnSignal(1)).to.be.revertedWith(
        'Signal already validated'
      );
    });

    it('Should reward all validators who voted', async function () {
      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);
      await signalRegistry.connect(validator3).voteOnSignal(1);

      // Check rewards were distributed
      const validator1Data = await validatorStaking.validators(validator1.address);
      const validator2Data = await validatorStaking.validators(validator2.address);
      const validator3Data = await validatorStaking.validators(validator3.address);

      expect(validator1Data.validationCount).to.equal(1);
      expect(validator2Data.validationCount).to.equal(1);
      expect(validator3Data.validationCount).to.equal(1);
    });
  });

  describe('View Functions', function () {
    beforeEach(async function () {
      await signalRegistry
        .connect(creator)
        .submitSignal('BTC', 'LONG', 50000_00000000, 48000_00000000, 55000_00000000, 85, 'BRONZE');

      await signalRegistry.connect(validator1).voteOnSignal(1);
      await signalRegistry.connect(validator2).voteOnSignal(1);
    });

    it('Should return signal details', async function () {
      const signal = await signalRegistry.getSignal(1);

      expect(signal.id).to.equal(1);
      expect(signal.creator).to.equal(creator.address);
      expect(signal.asset).to.equal('BTC');
      expect(signal.direction).to.equal('LONG');
      expect(signal.validatorCount).to.equal(2);
      expect(signal.isValidated).to.be.false;
    });

    it('Should return validator list for signal', async function () {
      const validators = await signalRegistry.getSignalValidators(1);

      expect(validators.length).to.equal(2);
      expect(validators).to.include(validator1.address);
      expect(validators).to.include(validator2.address);
    });

    it('Should check if validator voted', async function () {
      expect(await signalRegistry.hasValidatorVoted(1, validator1.address)).to.be.true;
      expect(await signalRegistry.hasValidatorVoted(1, validator3.address)).to.be.false;
    });
  });

  describe('Gas Cost Management', function () {
    it('Should allow owner to update gas costs', async function () {
      const newCost = ethers.parseEther('15');

      const tx = await signalRegistry.updateGasCost('BRONZE', newCost);

      await expect(tx).to.emit(signalRegistry, 'GasCostUpdated').withArgs('BRONZE', newCost);

      expect(await signalRegistry.gasCosts('BRONZE')).to.equal(newCost);
    });

    it('Should reject non-owner gas cost update', async function () {
      await expect(signalRegistry.connect(creator).updateGasCost('BRONZE', ethers.parseEther('15')))
        .to.be.reverted;
    });

    it('Should reject zero gas cost', async function () {
      await expect(signalRegistry.updateGasCost('BRONZE', 0)).to.be.revertedWith(
        'Cost must be positive'
      );
    });
  });
});

// Helper matcher
const anyValue = {
  asymmetricMatch: (value: any) => value !== undefined,
};
