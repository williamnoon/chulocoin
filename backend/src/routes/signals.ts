import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/signals/feed
 * Get validated signals (filtered by user tier)
 */
router.get('/feed', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress, limit = '50', offset = '0' } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Get user to check tier
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine signal delay based on tier
    const now = new Date();
    const delay = user.tier === 'OBSERVER' ? 24 * 60 * 60 * 1000 : 0; // 24h for observers
    const cutoffDate = new Date(now.getTime() - delay);

    // Get signals
    const signals = await prisma.signal.findMany({
      where: {
        status: 'validated',
        validatedAt: {
          lte: cutoffDate,
        },
      },
      orderBy: {
        validatedAt: 'desc',
      },
      take: parseInt(limit.toString()),
      skip: parseInt(offset.toString()),
    });

    // Limit observer to 25 signals per day
    const signalsToReturn = user.tier === 'OBSERVER' ? signals.slice(0, 25) : signals;

    res.status(200).json({
      success: true,
      data: {
        signals: signalsToReturn,
        tier: user.tier,
        delayed: user.tier === 'OBSERVER',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/signals/:id
 * Get signal details
 */
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const signal = await prisma.signal.findUnique({
      where: { id },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { signal },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/signals/submit
 * Submit new signal (from CLI miners)
 */
router.post('/submit', async (req: Request, res: Response, next) => {
  try {
    const { asset, direction, entry, stop, target, confidence, minerId, strategyId } = req.body;

    // Validation
    if (!asset || !direction || !entry || !stop || !target || !confidence) {
      throw new AppError('Missing required fields', 400);
    }

    if (!['LONG', 'SHORT'].includes(direction)) {
      throw new AppError('Invalid direction. Must be LONG or SHORT', 400);
    }

    if (confidence < 0 || confidence > 100) {
      throw new AppError('Confidence must be between 0 and 100', 400);
    }

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        asset,
        direction,
        entry: parseFloat(entry),
        stop: parseFloat(stop),
        target: parseFloat(target),
        confidence: parseFloat(confidence),
        minerId,
        strategyId,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      data: { signal },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
