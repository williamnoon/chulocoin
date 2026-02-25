import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

interface ValidationResult {
  vote: 'APPROVE' | 'REJECT';
  score: number;
  reason?: string;
}

interface BacktestMetrics {
  sharpe: number;
  winRate: number;
  maxDrawdown: number;
  totalReturn: number;
}

/**
 * Validator Node Service
 * Core service for decentralized signal validation
 */
export class ValidatorNodeService {
  private readonly CONSENSUS_THRESHOLD = 0.66; // >66% approval required
  private readonly PRICE_TOLERANCE = 0.005; // 0.5% tolerance
  private readonly MIN_SHARPE = 1.5;
  private readonly MIN_WIN_RATE = 0.55;
  private readonly MAX_DRAWDOWN = 0.25;
  private readonly MIN_QUALITY_SCORE = 70;
  private readonly VALIDATION_REWARD = 0.25; // CHULO per validation

  /**
   * Register a new validator
   */
  async registerValidator(walletAddress: string, stakeAmount: number): Promise<void> {
    // Verify minimum stake (1,000 CHULO for Tier 1)
    if (stakeAmount < 1000) {
      throw new AppError('Minimum stake is 1,000 CHULO', 400);
    }

    // Check if validator already exists
    const existing = await prisma.validator.findUnique({
      where: { walletAddress },
    });

    if (existing) {
      throw new AppError('Validator already registered', 400);
    }

    // Create validator record
    await prisma.validator.create({
      data: {
        walletAddress,
        stake: stakeAmount,
        reputation: 100, // Start at 100
        isActive: true,
        validations: 0,
        rewardsEarned: 0,
      },
    });

    console.log(`Validator registered: ${walletAddress} with stake ${stakeAmount}`);
  }

  /**
   * Unstake and deactivate validator
   */
  async unstakeValidator(walletAddress: string): Promise<void> {
    const validator = await prisma.validator.findUnique({
      where: { walletAddress },
    });

    if (!validator) {
      throw new AppError('Validator not found', 404);
    }

    // Deactivate validator
    await prisma.validator.update({
      where: { walletAddress },
      data: { isActive: false },
    });

    console.log(`Validator unstaked: ${walletAddress}`);
  }

  /**
   * Validate a signal
   * Returns APPROVE or REJECT based on quality checks
   */
  async validateSignal(signalId: string, validatorAddress: string): Promise<ValidationResult> {
    // Verify validator is active
    const validator = await prisma.validator.findUnique({
      where: { walletAddress: validatorAddress },
    });

    if (!validator || !validator.isActive) {
      throw new AppError('Validator not active', 403);
    }

    // Get signal details
    const signal = await prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    if (signal.status !== 'PENDING') {
      throw new AppError('Signal already validated', 400);
    }

    // Step 1: Verify price with Chainlink oracle
    const priceValid = await this.verifyPriceWithOracle(signal.pair, signal.entryPrice);
    if (!priceValid) {
      return {
        vote: 'REJECT',
        score: 0,
        reason: 'Price outside oracle tolerance',
      };
    }

    // Step 2: Run backtest on strategy
    const backtestMetrics = await this.executeBacktest(signal);

    // Step 3: Check quality thresholds
    if (backtestMetrics.sharpe < this.MIN_SHARPE) {
      return {
        vote: 'REJECT',
        score: 0,
        reason: `Sharpe ratio too low: ${backtestMetrics.sharpe}`,
      };
    }

    if (backtestMetrics.winRate < this.MIN_WIN_RATE) {
      return {
        vote: 'REJECT',
        score: 0,
        reason: `Win rate too low: ${backtestMetrics.winRate}`,
      };
    }

    if (backtestMetrics.maxDrawdown > this.MAX_DRAWDOWN) {
      return {
        vote: 'REJECT',
        score: 0,
        reason: `Max drawdown too high: ${backtestMetrics.maxDrawdown}`,
      };
    }

    // Step 4: Calculate setup quality score
    const qualityScore = this.scoreSetup(signal, backtestMetrics);

    if (qualityScore < this.MIN_QUALITY_SCORE) {
      return {
        vote: 'REJECT',
        score: qualityScore,
        reason: `Quality score too low: ${qualityScore}`,
      };
    }

    // All checks passed
    return {
      vote: 'APPROVE',
      score: qualityScore,
    };
  }

  /**
   * Record validator vote and check for consensus
   */
  async recordValidatorVote(
    signalId: string,
    validatorAddress: string,
    vote: 'APPROVE' | 'REJECT',
    score: number
  ): Promise<void> {
    // Record vote in database
    await prisma.signal.update({
      where: { id: signalId },
      data: {
        validatorVotes: {
          increment: 1,
        },
        approvalVotes: {
          increment: vote === 'APPROVE' ? 1 : 0,
        },
      },
    });

    // Update validator stats
    await prisma.validator.update({
      where: { walletAddress: validatorAddress },
      data: {
        validations: {
          increment: 1,
        },
      },
    });

    // Check if consensus reached
    await this.checkConsensus(signalId);

    console.log(`Vote recorded: ${validatorAddress} voted ${vote} on signal ${signalId}`);
  }

  /**
   * Check if signal has reached consensus (>66% approval)
   */
  async checkConsensus(signalId: string): Promise<void> {
    const signal = await prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    // Need at least 3 votes for consensus
    if (signal.validatorVotes < 3) {
      return;
    }

    const approvalRate = signal.approvalVotes / signal.validatorVotes;

    // Consensus reached
    if (approvalRate >= this.CONSENSUS_THRESHOLD) {
      await prisma.signal.update({
        where: { id: signalId },
        data: {
          status: 'ACTIVE',
          confidence: Math.round(approvalRate * 100),
        },
      });

      // Reward validators who voted with majority
      await this.rewardValidators(signalId, true);

      console.log(`Signal ${signalId} VALIDATED with ${approvalRate * 100}% approval`);
    } else if (approvalRate < 0.34) {
      // Signal rejected
      await prisma.signal.update({
        where: { id: signalId },
        data: {
          status: 'REJECTED',
        },
      });

      console.log(`Signal ${signalId} REJECTED with ${approvalRate * 100}% approval`);
    }
  }

  /**
   * Verify signal price against Chainlink oracle
   */
  private async verifyPriceWithOracle(pair: string, signalPrice: number): Promise<boolean> {
    // TODO: Integrate with ChainlinkPriceOracle contract
    // For now, stub implementation
    console.log(`Verifying price for ${pair}: ${signalPrice}`);

    // Simulate oracle price check
    const oraclePrice = signalPrice * (1 + (Math.random() - 0.5) * 0.01);
    const priceDiff = Math.abs(signalPrice - oraclePrice) / oraclePrice;

    return priceDiff <= this.PRICE_TOLERANCE;
  }

  /**
   * Execute backtest on signal's strategy
   */
  private async executeBacktest(signal: any): Promise<BacktestMetrics> {
    // TODO: Integrate with Python backtesting engine
    // For now, return simulated metrics based on signal confidence

    // Simulate backtest results
    const baseMetrics = {
      sharpe: 1.5 + Math.random() * 1.5,
      winRate: 0.55 + Math.random() * 0.25,
      maxDrawdown: 0.1 + Math.random() * 0.15,
      totalReturn: 0.15 + Math.random() * 0.35,
    };

    console.log(`Backtest executed for signal ${signal.id}:`, baseMetrics);

    return baseMetrics;
  }

  /**
   * Score signal setup quality
   */
  private scoreSetup(signal: any, metrics: BacktestMetrics): number {
    // Weighted scoring:
    // - 40% from Sharpe ratio
    // - 30% from win rate
    // - 20% from max drawdown (inverse)
    // - 10% from risk/reward ratio

    const sharpeScore = Math.min((metrics.sharpe / 3.0) * 40, 40);
    const winRateScore = (metrics.winRate - 0.5) * 60; // 50% = 0, 100% = 30
    const drawdownScore = Math.max(0, (1 - metrics.maxDrawdown / 0.25) * 20);

    const riskRewardRatio = signal.takeProfit
      ? (signal.takeProfit - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)
      : 2;
    const rrScore = Math.min((riskRewardRatio / 3) * 10, 10);

    const totalScore = sharpeScore + winRateScore + drawdownScore + rrScore;

    return Math.round(totalScore);
  }

  /**
   * Reward validators who voted with majority
   */
  private async rewardValidators(signalId: string, approved: boolean): Promise<void> {
    // TODO: Implement reward distribution
    // For now, just log
    console.log(`Rewarding validators for signal ${signalId} (approved: ${approved})`);
  }

  /**
   * Get pending signals for validation
   */
  async getPendingSignals(validatorAddress: string): Promise<any[]> {
    // Verify validator is active
    const validator = await prisma.validator.findUnique({
      where: { walletAddress: validatorAddress },
    });

    if (!validator || !validator.isActive) {
      throw new AppError('Validator not active', 403);
    }

    // Get pending signals (need validation)
    const signals = await prisma.signal.findMany({
      where: {
        status: 'PENDING',
        validatorVotes: {
          lt: 10, // Max 10 validators per signal
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20,
    });

    return signals;
  }

  /**
   * Get validator statistics
   */
  async getValidatorStats(walletAddress: string): Promise<any> {
    const validator = await prisma.validator.findUnique({
      where: { walletAddress },
    });

    if (!validator) {
      throw new AppError('Validator not found', 404);
    }

    return {
      walletAddress: validator.walletAddress,
      stake: validator.stake,
      reputation: validator.reputation,
      validations: validator.validations,
      rewardsEarned: validator.rewardsEarned,
      isActive: validator.isActive,
    };
  }
}

// Export singleton instance
export const validatorNodeService = new ValidatorNodeService();
