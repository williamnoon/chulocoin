import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CHULO } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('CHULO Token', function () {
  let chulo: CHULO;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther('10000000'); // 10M tokens
  const MAX_SUPPLY = ethers.parseEther('100000000'); // 100M tokens

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const CHULOFactory = await ethers.getContractFactory('CHULO');
    chulo = await CHULOFactory.deploy(INITIAL_SUPPLY);
    await chulo.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct name and symbol', async function () {
      expect(await chulo.name()).to.equal('ChuloBots');
      expect(await chulo.symbol()).to.equal('CHULO');
    });

    it('Should mint initial supply to deployer', async function () {
      expect(await chulo.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it('Should set the correct max supply', async function () {
      expect(await chulo.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it('Should grant admin and minter roles to deployer', async function () {
      const DEFAULT_ADMIN_ROLE = await chulo.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await chulo.MINTER_ROLE();

      expect(await chulo.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await chulo.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it('Should revert if initial supply exceeds max supply', async function () {
      const CHULOFactory = await ethers.getContractFactory('CHULO');
      const tooMuch = ethers.parseEther('100000001'); // Over 100M

      await expect(CHULOFactory.deploy(tooMuch)).to.be.revertedWith(
        'Initial supply exceeds max supply'
      );
    });

    it('Should deploy with zero initial supply', async function () {
      const CHULOFactory = await ethers.getContractFactory('CHULO');
      const zeroSupply = await CHULOFactory.deploy(0);
      await zeroSupply.waitForDeployment();

      expect(await zeroSupply.totalSupply()).to.equal(0);
    });
  });

  describe('Minting', function () {
    beforeEach(async function () {
      const MINTER_ROLE = await chulo.MINTER_ROLE();
      await chulo.grantRole(MINTER_ROLE, minter.address);
    });

    it('Should allow minter to mint tokens', async function () {
      const amount = ethers.parseEther('1000');
      await chulo.connect(minter).mint(user1.address, amount, 'reward');

      expect(await chulo.balanceOf(user1.address)).to.equal(amount);
    });

    it('Should emit TokensMinted event', async function () {
      const amount = ethers.parseEther('1000');
      await expect(chulo.connect(minter).mint(user1.address, amount, 'validator_reward'))
        .to.emit(chulo, 'TokensMinted')
        .withArgs(user1.address, amount, 'validator_reward');
    });

    it('Should revert if non-minter tries to mint', async function () {
      const amount = ethers.parseEther('1000');
      await expect(chulo.connect(user1).mint(user2.address, amount, 'reward')).to.be.reverted;
    });

    it('Should revert if minting to zero address', async function () {
      const amount = ethers.parseEther('1000');
      await expect(
        chulo.connect(minter).mint(ethers.ZeroAddress, amount, 'reward')
      ).to.be.revertedWith('Cannot mint to zero address');
    });

    it('Should revert if minting exceeds max supply', async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      const tooMuch = remaining + ethers.parseEther('1');

      await expect(chulo.connect(minter).mint(user1.address, tooMuch, 'reward')).to.be.revertedWith(
        'Exceeds max supply'
      );
    });

    it('Should mint up to max supply', async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      await chulo.connect(minter).mint(user1.address, remaining, 'max_mint');

      expect(await chulo.totalSupply()).to.equal(MAX_SUPPLY);
      expect(await chulo.remainingSupply()).to.equal(0);
    });
  });

  describe('Burning', function () {
    beforeEach(async function () {
      // Transfer some tokens to user1 for testing
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
    });

    it('Should allow users to burn their tokens', async function () {
      const burnAmount = ethers.parseEther('100');
      const initialBalance = await chulo.balanceOf(user1.address);

      await chulo.connect(user1).burn(burnAmount);

      expect(await chulo.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await chulo.totalBurned()).to.equal(burnAmount);
    });

    it('Should track total burned correctly', async function () {
      await chulo.connect(user1).burn(ethers.parseEther('50'));
      await chulo.connect(user1).burn(ethers.parseEther('30'));

      expect(await chulo.totalBurned()).to.equal(ethers.parseEther('80'));
    });

    it('Should emit TokensBurned event on burn', async function () {
      const burnAmount = ethers.parseEther('100');
      await expect(chulo.connect(user1).burn(burnAmount))
        .to.emit(chulo, 'TokensBurned')
        .withArgs(user1.address, burnAmount, 'manual_burn');
    });
  });

  describe('Burn for Gas', function () {
    beforeEach(async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
    });

    it('Should burn tokens for gas payment', async function () {
      const burnAmount = ethers.parseEther('10');
      const initialBalance = await chulo.balanceOf(user1.address);

      await chulo.connect(user1).burnForGas(burnAmount, 'gas_payment');

      expect(await chulo.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await chulo.totalBurned()).to.equal(burnAmount);
    });

    it('Should emit TokensBurned event with reason', async function () {
      const burnAmount = ethers.parseEther('10');
      await expect(chulo.connect(user1).burnForGas(burnAmount, 'gas_payment_bronze'))
        .to.emit(chulo, 'TokensBurned')
        .withArgs(user1.address, burnAmount, 'gas_payment_bronze');
    });

    it('Should revert if burning zero amount', async function () {
      await expect(chulo.connect(user1).burnForGas(0, 'gas_payment')).to.be.revertedWith(
        'Amount must be greater than 0'
      );
    });

    it('Should revert if insufficient balance', async function () {
      const tooMuch = ethers.parseEther('10000');
      await expect(chulo.connect(user1).burnForGas(tooMuch, 'gas_payment')).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });

  describe('BurnFrom', function () {
    beforeEach(async function () {
      await chulo.transfer(user1.address, ethers.parseEther('1000'));
    });

    it('Should burn tokens from approved account', async function () {
      const burnAmount = ethers.parseEther('100');
      await chulo.connect(user1).approve(user2.address, burnAmount);

      await chulo.connect(user2).burnFrom(user1.address, burnAmount);

      expect(await chulo.totalBurned()).to.equal(burnAmount);
    });

    it('Should emit TokensBurned event', async function () {
      const burnAmount = ethers.parseEther('100');
      await chulo.connect(user1).approve(user2.address, burnAmount);

      await expect(chulo.connect(user2).burnFrom(user1.address, burnAmount))
        .to.emit(chulo, 'TokensBurned')
        .withArgs(user1.address, burnAmount, 'burn_from');
    });
  });

  describe('View Functions', function () {
    it('Should return correct circulating supply', async function () {
      expect(await chulo.circulatingSupply()).to.equal(await chulo.totalSupply());
    });

    it('Should return correct remaining supply', async function () {
      const expected = MAX_SUPPLY - INITIAL_SUPPLY;
      expect(await chulo.remainingSupply()).to.equal(expected);
    });

    it('Should update remaining supply after minting', async function () {
      const MINTER_ROLE = await chulo.MINTER_ROLE();
      await chulo.grantRole(MINTER_ROLE, minter.address);

      const mintAmount = ethers.parseEther('1000000');
      await chulo.connect(minter).mint(user1.address, mintAmount, 'test');

      const expected = MAX_SUPPLY - INITIAL_SUPPLY - mintAmount;
      expect(await chulo.remainingSupply()).to.equal(expected);
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant minter role', async function () {
      const MINTER_ROLE = await chulo.MINTER_ROLE();
      await chulo.grantRole(MINTER_ROLE, user1.address);

      expect(await chulo.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it('Should allow admin to revoke minter role', async function () {
      const MINTER_ROLE = await chulo.MINTER_ROLE();
      await chulo.grantRole(MINTER_ROLE, user1.address);
      await chulo.revokeRole(MINTER_ROLE, user1.address);

      expect(await chulo.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it('Should prevent non-admin from granting roles', async function () {
      const MINTER_ROLE = await chulo.MINTER_ROLE();
      await expect(chulo.connect(user1).grantRole(MINTER_ROLE, user2.address)).to.be.reverted;
    });
  });

  describe('ERC20 Standard Functions', function () {
    it('Should transfer tokens between accounts', async function () {
      const amount = ethers.parseEther('100');
      await chulo.transfer(user1.address, amount);

      expect(await chulo.balanceOf(user1.address)).to.equal(amount);
    });

    it('Should allow approved spending', async function () {
      const amount = ethers.parseEther('100');
      await chulo.approve(user1.address, amount);
      await chulo.connect(user1).transferFrom(owner.address, user2.address, amount);

      expect(await chulo.balanceOf(user2.address)).to.equal(amount);
    });

    it('Should return correct decimals', async function () {
      expect(await chulo.decimals()).to.equal(18);
    });
  });
});
