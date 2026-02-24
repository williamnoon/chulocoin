import { Router, Request, Response } from 'express';
import { getOracleService } from '../services/priceOracle';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/oracle/price/:asset
 * Get latest price for an asset
 */
router.get('/price/:asset', async (req: Request, res: Response, next) => {
  try {
    const { asset } = req.params;
    const oracle = getOracleService();

    const hasFeed = await oracle.hasPriceFeed(asset.toUpperCase());
    if (!hasFeed) {
      throw new AppError(`Price feed not available for ${asset}`, 404);
    }

    const priceData = await oracle.getLatestPrice(asset.toUpperCase());

    res.status(200).json({
      success: true,
      data: {
        asset: asset.toUpperCase(),
        price: priceData.price,
        timestamp: priceData.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/oracle/verify
 * Verify signal price against oracle
 */
router.post('/verify', async (req: Request, res: Response, next) => {
  try {
    const { asset, price } = req.body;

    if (!asset || !price) {
      throw new AppError('Asset and price are required', 400);
    }

    if (price <= 0) {
      throw new AppError('Price must be greater than 0', 400);
    }

    const oracle = getOracleService();
    const verification = await oracle.verifySignalPrice(asset.toUpperCase(), price);

    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/oracle/verify-batch
 * Verify multiple signal prices
 */
router.post('/verify-batch', async (req: Request, res: Response, next) => {
  try {
    const { signals } = req.body;

    if (!Array.isArray(signals) || signals.length === 0) {
      throw new AppError('Signals array is required', 400);
    }

    const oracle = getOracleService();
    const results = await oracle.verifyMultipleSignals(
      signals.map(s => ({ asset: s.asset.toUpperCase(), price: s.price }))
    );

    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/status
 * Get oracle configuration and status
 */
router.get('/status', async (req: Request, res: Response, next) => {
  try {
    const oracle = getOracleService();
    const tolerance = await oracle.getPriceTolerance();

    // Check if major assets have price feeds
    const assets = ['BTC', 'ETH', 'SOL'];
    const feedStatus = await Promise.all(
      assets.map(async asset => ({
        asset,
        available: await oracle.hasPriceFeed(asset),
        fresh: await oracle.isPriceFresh(asset).catch(() => false),
      }))
    );

    res.status(200).json({
      success: true,
      data: {
        tolerance: tolerance / 100, // Convert basis points to percentage
        toleranceBps: tolerance,
        priceFeeds: feedStatus,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
