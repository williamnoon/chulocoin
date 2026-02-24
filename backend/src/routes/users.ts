import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/users/connect
 * Connect wallet and create/retrieve user
 */
router.post('/connect', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new AppError('Invalid wallet address format', 400);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          tier: user.tier,
          chuloBalance: user.chuloBalance,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:walletAddress
 * Get user profile
 */
router.get('/:walletAddress', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: {
        positions: {
          where: { status: 'OPEN' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:walletAddress/stats
 * Get user statistics
 */
router.get('/:walletAddress/stats', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get statistics
    const [openPositions, closedTrades, totalPnl] = await Promise.all([
      prisma.position.count({
        where: { userId: user.id, status: 'OPEN' },
      }),
      prisma.trade.count({
        where: { userId: user.id },
      }),
      prisma.trade.aggregate({
        where: { userId: user.id },
        _sum: { pnl: true },
      }),
    ]);

    const winningTrades = await prisma.trade.count({
      where: { userId: user.id, pnl: { gt: 0 } },
    });

    const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          tier: user.tier,
          chuloBalance: user.chuloBalance,
          openPositions,
          totalTrades: closedTrades,
          totalPnl: totalPnl._sum.pnl || 0,
          winRate: Math.round(winRate * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
