import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { getWebSocketService } from '../services/websocket';

const router = Router();

/**
 * GET /api/positions
 * Get user positions
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress, status, exchange, limit = '50', offset = '0' } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Build filter conditions
    const where: any = {
      userId: user.id,
    };

    if (status && ['OPEN', 'CLOSED'].includes(status.toString())) {
      where.status = status.toString();
    }

    if (exchange) {
      where.exchange = exchange.toString().toLowerCase();
    }

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        include: {
          signal: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit.toString()),
        skip: parseInt(offset.toString()),
      }),
      prisma.position.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        positions,
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
 * GET /api/positions/:id
 * Get position details
 */
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const position = await prisma.position.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        signal: true,
        user: {
          select: {
            id: true,
            walletAddress: true,
            tier: true,
          },
        },
      },
    });

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { position },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/positions/:id/close
 * Close position
 */
router.post('/:id/close', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { walletAddress, exitPrice } = req.body;

    if (!walletAddress || !exitPrice) {
      throw new AppError('Wallet address and exit price are required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get position
    const position = await prisma.position.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'OPEN',
      },
      include: {
        signal: true,
      },
    });

    if (!position) {
      throw new AppError('Position not found or already closed', 404);
    }

    // Calculate PnL
    const exitPriceFloat = parseFloat(exitPrice);
    const priceDiff = exitPriceFloat - position.entryPrice;
    const direction = position.signal.direction === 'LONG' ? 1 : -1;
    const pnl = priceDiff * direction * position.size;
    const pnlPercent = (priceDiff / position.entryPrice) * direction * 100;

    const closedAt = new Date();
    const duration = Math.floor((closedAt.getTime() - position.createdAt.getTime()) / 1000);

    // Close position
    const [closedPosition, trade] = await Promise.all([
      prisma.position.update({
        where: { id },
        data: {
          status: 'CLOSED',
          pnl,
          closedAt,
        },
      }),
      prisma.trade.create({
        data: {
          userId: user.id,
          signalId: position.signalId,
          entryPrice: position.entryPrice,
          exitPrice: exitPriceFloat,
          size: position.size,
          pnl,
          pnlPercent,
          duration,
          closedAt,
        },
      }),
    ]);

    // Broadcast position update via WebSocket
    try {
      const wsService = getWebSocketService();
      wsService.sendPositionUpdate(walletAddress.toLowerCase(), {
        type: 'closed',
        position: closedPosition,
        trade,
      });
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.status(200).json({
      success: true,
      data: {
        position: closedPosition,
        trade,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/positions/:id/update-stops
 * Update SL/TP (stop loss / take profit)
 */
router.post('/:id/update-stops', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { walletAddress, stopLoss, takeProfit } = req.body;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    if (!stopLoss && !takeProfit) {
      throw new AppError('At least one of stopLoss or takeProfit is required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get position
    const position = await prisma.position.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'OPEN',
      },
      include: {
        signal: true,
      },
    });

    if (!position) {
      throw new AppError('Position not found or already closed', 404);
    }

    // Validate stop loss and take profit levels
    if (stopLoss) {
      const stopLossFloat = parseFloat(stopLoss);
      if (position.signal.direction === 'LONG' && stopLossFloat >= position.entryPrice) {
        throw new AppError('Stop loss must be below entry price for LONG positions', 400);
      }
      if (position.signal.direction === 'SHORT' && stopLossFloat <= position.entryPrice) {
        throw new AppError('Stop loss must be above entry price for SHORT positions', 400);
      }
    }

    if (takeProfit) {
      const takeProfitFloat = parseFloat(takeProfit);
      if (position.signal.direction === 'LONG' && takeProfitFloat <= position.entryPrice) {
        throw new AppError('Take profit must be above entry price for LONG positions', 400);
      }
      if (position.signal.direction === 'SHORT' && takeProfitFloat >= position.entryPrice) {
        throw new AppError('Take profit must be below entry price for SHORT positions', 400);
      }
    }

    // Update signal with new stop/target
    const updateData: any = {};
    if (stopLoss) updateData.stop = parseFloat(stopLoss);
    if (takeProfit) updateData.target = parseFloat(takeProfit);

    const updatedSignal = await prisma.signal.update({
      where: { id: position.signalId },
      data: updateData,
    });

    // Broadcast update via WebSocket
    try {
      const wsService = getWebSocketService();
      wsService.sendPositionUpdate(walletAddress.toLowerCase(), {
        type: 'updated',
        position: {
          ...position,
          signal: updatedSignal,
        },
      });
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.status(200).json({
      success: true,
      data: {
        position: {
          ...position,
          signal: updatedSignal,
        },
        message: 'Stop loss and take profit updated successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/positions/history
 * Position history
 */
router.get('/history', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress, exchange, startDate, endDate, limit = '50', offset = '0' } = req.query;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toString().toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Build filter conditions
    const where: any = {
      userId: user.id,
      status: 'CLOSED',
    };

    if (exchange) {
      where.exchange = exchange.toString().toLowerCase();
    }

    if (startDate || endDate) {
      where.closedAt = {};
      if (startDate) {
        where.closedAt.gte = new Date(startDate.toString());
      }
      if (endDate) {
        where.closedAt.lte = new Date(endDate.toString());
      }
    }

    const [positions, total, stats] = await Promise.all([
      prisma.position.findMany({
        where,
        include: {
          signal: true,
        },
        orderBy: { closedAt: 'desc' },
        take: parseInt(limit.toString()),
        skip: parseInt(offset.toString()),
      }),
      prisma.position.count({ where }),
      prisma.position.aggregate({
        where,
        _sum: { pnl: true },
        _avg: { pnl: true },
      }),
    ]);

    // Calculate win rate
    const winningPositions = positions.filter((p: { pnl: number | null }) => p.pnl && p.pnl > 0).length;
    const winRate = positions.length > 0 ? (winningPositions / positions.length) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        positions,
        pagination: {
          total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore: total > parseInt(offset.toString()) + parseInt(limit.toString()),
        },
        stats: {
          totalPnl: stats._sum.pnl || 0,
          averagePnl: stats._avg.pnl || 0,
          winRate: Math.round(winRate * 100) / 100,
          totalPositions: total,
          winningPositions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
