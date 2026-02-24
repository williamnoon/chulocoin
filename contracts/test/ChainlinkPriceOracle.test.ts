import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ChainlinkPriceOracle } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ChainlinkPriceOracle', function () {
  let oracle: ChainlinkPriceOracle;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let mockPriceFeed: any;

  // Mock price feed contract
  const deployMockPriceFeed = async (initialPrice: number, decimals: number = 8) => {
    const MockPriceFeed = await ethers.getContractFactory('MockV3Aggregator');
    const feed = await MockPriceFeed.deploy(decimals, initialPrice);
    await feed.waitForDeployment();
    return feed;
  };

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy oracle
    const OracleFactory = await ethers.getContractFactory('ChainlinkPriceOracle');
    oracle = await OracleFactory.deploy();
    await oracle.waitForDeployment();

    // Deploy mock price feed for BTC (price: $50,000)
    mockPriceFeed = await deployMockPriceFeed(5000000000000); // 50000 * 10^8
  });

  describe('Deployment', function () {
    it('Should set the correct owner', async function () {
      expect(await oracle.owner()).to.equal(owner.address);
    });

    it('Should set default price tolerance to 2%', async function () {
      expect(await oracle.priceTolerance()).to.equal(200);
    });

    it('Should set default stale price threshold to 1 hour', async function () {
      expect(await oracle.stalePriceThreshold()).to.equal(3600);
    });
  });

  describe('Price Feed Management', function () {
    it('Should allow owner to add price feed', async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());
      expect(await oracle.hasPriceFeed('BTC')).to.be.true;
    });

    it('Should emit PriceFeedAdded event', async function () {
      const feedAddress = await mockPriceFeed.getAddress();
      await expect(oracle.addPriceFeed('BTC', feedAddress))
        .to.emit(oracle, 'PriceFeedAdded')
        .withArgs('BTC', feedAddress);
    });

    it('Should revert if adding feed with zero address', async function () {
      await expect(
        oracle.addPriceFeed('BTC', ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid feed address');
    });

    it('Should revert if price feed already exists', async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());
      await expect(
        oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress())
      ).to.be.revertedWith('Price feed already exists');
    });

    it('Should prevent non-owner from adding price feed', async function () {
      await expect(
        oracle.connect(user).addPriceFeed('BTC', await mockPriceFeed.getAddress())
      ).to.be.reverted;
    });

    it('Should allow owner to update price feed', async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());

      const newFeed = await deployMockPriceFeed(5100000000000);
      await oracle.updatePriceFeed('BTC', await newFeed.getAddress());

      expect(await oracle.priceFeeds('BTC')).to.equal(await newFeed.getAddress());
    });

    it('Should emit PriceFeedUpdated event', async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());

      const newFeed = await deployMockPriceFeed(5100000000000);
      const newFeedAddress = await newFeed.getAddress();

      await expect(oracle.updatePriceFeed('BTC', newFeedAddress))
        .to.emit(oracle, 'PriceFeedUpdated')
        .withArgs('BTC', newFeedAddress);
    });

    it('Should revert update if price feed does not exist', async function () {
      await expect(
        oracle.updatePriceFeed('BTC', await mockPriceFeed.getAddress())
      ).to.be.revertedWith('Price feed does not exist');
    });
  });

  describe('Price Tolerance', function () {
    it('Should allow owner to update price tolerance', async function () {
      await oracle.setPriceTolerance(300); // 3%
      expect(await oracle.priceTolerance()).to.equal(300);
    });

    it('Should emit PriceToleranceUpdated event', async function () {
      await expect(oracle.setPriceTolerance(300))
        .to.emit(oracle, 'PriceToleranceUpdated')
        .withArgs(200, 300);
    });

    it('Should revert if tolerance exceeds 10%', async function () {
      await expect(oracle.setPriceTolerance(1001)).to.be.revertedWith(
        'Tolerance cannot exceed 10%'
      );
    });

    it('Should prevent non-owner from updating tolerance', async function () {
      await expect(oracle.connect(user).setPriceTolerance(300)).to.be.reverted;
    });
  });

  describe('Stale Price Threshold', function () {
    it('Should allow owner to update stale price threshold', async function () {
      await oracle.setStalePriceThreshold(7200); // 2 hours
      expect(await oracle.stalePriceThreshold()).to.equal(7200);
    });

    it('Should revert if threshold is zero', async function () {
      await expect(oracle.setStalePriceThreshold(0)).to.be.revertedWith(
        'Threshold must be greater than 0'
      );
    });
  });

  describe('Get Latest Price', function () {
    beforeEach(async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());
    });

    it('Should return latest price', async function () {
      const [price, timestamp] = await oracle.getLatestPrice('BTC');
      expect(price).to.equal(5000000000000); // $50,000
      expect(timestamp).to.be.gt(0);
    });

    it('Should revert if price feed not found', async function () {
      await expect(oracle.getLatestPrice('ETH')).to.be.revertedWith(
        'Price feed not found'
      );
    });

    it('Should return correct decimals', async function () {
      expect(await oracle.getDecimals('BTC')).to.equal(8);
    });
  });

  describe('Verify Price', function () {
    beforeEach(async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());
    });

    it('Should verify price within tolerance', async function () {
      // Oracle price: $50,000
      // Signal price: $50,500 (1% difference)
      const signalPrice = 5050000000000;
      const [isValid, oraclePrice, deviation] = await oracle.verifyPrice('BTC', signalPrice);

      expect(isValid).to.be.true;
      expect(oraclePrice).to.equal(5000000000000);
      expect(deviation).to.be.lte(200); // Within 2% tolerance
    });

    it('Should reject price outside tolerance', async function () {
      // Oracle price: $50,000
      // Signal price: $52,000 (4% difference, exceeds 2% tolerance)
      const signalPrice = 5200000000000;
      const [isValid, oraclePrice, deviation] = await oracle.verifyPrice('BTC', signalPrice);

      expect(isValid).to.be.false;
      expect(deviation).to.be.gt(200);
    });

    it('Should emit PriceVerified event', async function () {
      const signalPrice = 5050000000000;
      await expect(oracle.verifyPrice('BTC', signalPrice))
        .to.emit(oracle, 'PriceVerified')
        .withArgs('BTC', signalPrice, 5000000000000, true);
    });

    it('Should handle price below oracle price', async function () {
      // Signal price: $49,000 (2% below, should be valid)
      const signalPrice = 4900000000000;
      const [isValid] = await oracle.verifyPrice('BTC', signalPrice);
      expect(isValid).to.be.true;
    });

    it('Should revert if signal price is zero or negative', async function () {
      await expect(oracle.verifyPrice('BTC', 0)).to.be.revertedWith('Invalid signal price');
      await expect(oracle.verifyPrice('BTC', -1)).to.be.revertedWith('Invalid signal price');
    });
  });

  describe('Verify Price with Custom Tolerance', function () {
    beforeEach(async function () {
      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());
    });

    it('Should verify with custom tolerance', async function () {
      // Signal price 5% away from oracle, but using 10% tolerance
      const signalPrice = 5250000000000; // $52,500
      const [isValid, , deviation] = await oracle.verifyPriceWithTolerance(
        'BTC',
        signalPrice,
        1000 // 10% tolerance
      );

      expect(isValid).to.be.true;
      expect(deviation).to.be.lte(1000);
    });

    it('Should reject with tighter custom tolerance', async function () {
      // Signal price 1.5% away, using 1% tolerance
      const signalPrice = 5075000000000;
      const [isValid] = await oracle.verifyPriceWithTolerance('BTC', signalPrice, 100);

      expect(isValid).to.be.false;
    });

    it('Should revert if custom tolerance exceeds 10%', async function () {
      await expect(
        oracle.verifyPriceWithTolerance('BTC', 5050000000000, 1001)
      ).to.be.revertedWith('Tolerance cannot exceed 10%');
    });
  });

  describe('Helper Functions', function () {
    it('Should correctly identify existing price feeds', async function () {
      expect(await oracle.hasPriceFeed('BTC')).to.be.false;

      await oracle.addPriceFeed('BTC', await mockPriceFeed.getAddress());

      expect(await oracle.hasPriceFeed('BTC')).to.be.true;
      expect(await oracle.hasPriceFeed('ETH')).to.be.false;
    });
  });
});
