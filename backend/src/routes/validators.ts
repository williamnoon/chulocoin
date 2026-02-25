import { Router, Request, Response } from 'express';
import { validatorNodeService } from '../services/validatorNode';

const router = Router();

/**
 * POST /api/validators/register
 * Register as a validator
 */
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress, stakeAmount } = req.body;

    if (!walletAddress || !stakeAmount) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and stake amount required',
      });
    }

    await validatorNodeService.registerValidator(walletAddress, stakeAmount);

    res.status(201).json({
      success: true,
      message: 'Validator registered successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/validators/unstake
 * Unstake and deactivate validator
 */
router.delete('/unstake', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required',
      });
    }

    await validatorNodeService.unstakeValidator(walletAddress);

    res.json({
      success: true,
      message: 'Validator unstaked successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/validators/pending
 * Get pending signals to validate
 */
router.get('/pending', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required',
      });
    }

    const signals = await validatorNodeService.getPendingSignals(walletAddress.toString());

    res.json({
      success: true,
      data: signals,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/validators/:signalId/validate
 * Submit validation vote for a signal
 */
router.post('/:signalId/validate', async (req: Request, res: Response, next) => {
  try {
    const { signalId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required',
      });
    }

    // Run validation
    const result = await validatorNodeService.validateSignal(signalId, walletAddress);

    // Record vote
    await validatorNodeService.recordValidatorVote(
      signalId,
      walletAddress,
      result.vote,
      result.score
    );

    res.json({
      success: true,
      data: {
        vote: result.vote,
        score: result.score,
        reason: result.reason,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/validators/stats
 * Get validator statistics
 */
router.get('/stats', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required',
      });
    }

    const stats = await validatorNodeService.getValidatorStats(walletAddress.toString());

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
