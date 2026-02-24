import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { getWebSocketService } from '../services/websocket';

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
 * POST /api/signals/submit
 * Submit signal for validation
 */
router.post('/submit', async (req: Request, res: Response, next) => {
  try {
    const { asset, direction, entry, stop, target, confidence, minerId, strategyId } = req.body;

    // Validation
    if (!asset || !direction || !entry || !stop || !target || confidence === undefined) {
      throw new AppError('Missing required fields', 400);
    }

    if (!['LONG', 'SHORT'].includes(direction)) {
      throw new AppError('Invalid direction. Must be LONG or SHORT', 400);
    }

    if (confidence < 0 || confidence > 100) {
      throw new AppError('Confidence must be between 0 and 100', 400);
    }

    // Validate price levels
    const entryPrice = parseFloat(entry);
    const stopPrice = parseFloat(stop);
    const targetPrice = parseFloat(target);

    if (direction === 'LONG') {
      if (stopPrice >= entryPrice) {
        throw new AppError('Stop loss must be below entry for LONG positions', 400);
      }
      if (targetPrice <= entryPrice) {
        throw new AppError('Target must be above entry for LONG positions', 400);
      }
    } else {
      if (stopPrice <= entryPrice) {
        throw new AppError('Stop loss must be above entry for SHORT positions', 400);
      }
      if (targetPrice >= entryPrice) {
        throw new AppError('Target must be below entry for SHORT positions', 400);
      }
    }

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        asset: asset.toUpperCase(),
        direction,
        entry: entryPrice,
        stop: stopPrice,
        target: targetPrice,
        confidence: parseFloat(confidence.toString()),
        minerId,
        strategyId,
        status: 'pending',
      },
    });

    // Broadcast to validators via WebSocket
    try {
      const wsService = getWebSocketService();
      wsService.broadcastSignal({
        type: 'pending',
        signal,
      });
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.status(201).json({
      success: true,
      data: { signal },
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
      include: {
        positions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
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
 * GET /api/signals/history
 * Signal history with filters
 */
router.get('/history', async (req: Request, res: Response, next) => {
  try {
    const {
      walletAddress,
      status,
      asset,
      direction,
      minConfidence,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
    } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Build filter conditions
    const where: any = {};

    if (status) {
      where.status = status.toString();
    }

    if (asset) {
      where.asset = asset.toString().toUpperCase();
    }

    if (direction && ['LONG', 'SHORT'].includes(direction.toString())) {
      where.direction = direction.toString();
    }

    if (minConfidence) {
      where.confidence = {
        gte: parseFloat(minConfidence.toString()),
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate.toString());
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate.toString());
      }
    }

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit.toString()),
        skip: parseInt(offset.toString()),
      }),
      prisma.signal.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        signals,
        pagination: {
          total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore: total > parseInt(offset.toString()) + parseInt(limit.toString()),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/signals/:id/validate
 * Validator vote endpoint
 */
router.post('/:id/validate', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { walletAddress, vote } = req.body;

    if (!walletAddress || vote === undefined) {
      throw new AppError('Wallet address and vote are required', 400);
    }

    if (typeof vote !== 'boolean') {
      throw new AppError('Vote must be boolean (true/false)', 400);
    }

    // Verify validator exists and is active
    const validator = await prisma.validator.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!validator) {
      throw new AppError('Validator not found', 404);
    }

    if (!validator.isActive) {
      throw new AppError('Validator is not active', 403);
    }

    // Get signal
    const signal = await prisma.signal.findUnique({
      where: { id },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    if (signal.status !== 'pending') {
      throw new AppError('Signal is not pending validation', 400);
    }

    // Update validator votes
    const newVoteCount = vote ? signal.validatorVotes + 1 : signal.validatorVotes - 1;

    // Validation threshold: 3+ votes = validated, -3 votes = rejected
    let newStatus = signal.status;
    let validatedAt = signal.validatedAt;

    if (newVoteCount >= 3) {
      newStatus = 'validated';
      validatedAt = new Date();
    } else if (newVoteCount <= -3) {
      newStatus = 'rejected';
    }

    // Update signal
    const updatedSignal = await prisma.signal.update({
      where: { id },
      data: {
        validatorVotes: newVoteCount,
        status: newStatus,
        validatedAt,
      },
    });

    // Update validator stats
    await prisma.validator.update({
      where: { walletAddress: walletAddress.toLowerCase() },
      data: {
        validations: { increment: 1 },
        rewardsEarned: { increment: newStatus === 'validated' ? 10 : 0 }, // 10 CHULO reward per validation
      },
    });

    // Broadcast signal status update via WebSocket
    try {
      const wsService = getWebSocketService();
      if (newStatus === 'validated') {
        wsService.broadcastSignal({
          type: 'validated',
          signal: updatedSignal,
        });
      }
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.status(200).json({
      success: true,
      data: {
        signal: updatedSignal,
        message: newStatus !== 'pending' ? `Signal ${newStatus}` : 'Vote recorded',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/signals/pending
 * Pending validation queue
 */
router.get('/pending', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress, limit = '20', offset = '0' } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Verify validator
    const validator = await prisma.validator.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!validator) {
      throw new AppError('Validator not found', 404);
    }

    if (!validator.isActive) {
      throw new AppError('Validator is not active', 403);
    }

    // Get pending signals
    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where: { status: 'pending' },
        orderBy: [
          { confidence: 'desc' }, // High confidence first
          { createdAt: 'asc' }, // Older first
        ],
        take: parseInt(limit.toString()),
        skip: parseInt(offset.toString()),
      }),
      prisma.signal.count({ where: { status: 'pending' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        signals,
        pagination: {
          total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore: total > parseInt(offset.toString()) + parseInt(limit.toString()),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
