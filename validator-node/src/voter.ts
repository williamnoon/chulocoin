// Consensus voter - submits votes on-chain

import { ethers } from 'ethers';
import { Pool } from 'pg';
import { Logger } from 'pino';
import { BacktestResult } from './types';

export class ConsensusVoter {
  constructor(
    private readonly wallet: ethers.Wallet,
    private readonly db: Pool,
    private readonly logger: Logger
  ) {}

  async submitVote(
    signalId: string,
    vote: 'APPROVE' | 'REJECT',
    backtestResult: BacktestResult
  ): Promise<void> {
    try {
      // TODO: Implement on-chain vote submission
      // This should call the SignalRegistry contract's submitVote function

      this.logger.info(`📝 Submitting ${vote} vote for signal ${signalId}`);

      // For now, just record in database
      await this.db.query(
        `INSERT INTO votes (signal_id, validator_address, vote, sharpe, win_rate, max_drawdown, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (signal_id, validator_address) DO UPDATE
         SET vote = $3, sharpe = $4, win_rate = $5, max_drawdown = $6`,
        [
          signalId,
          this.wallet.address,
          vote,
          backtestResult.sharpe,
          backtestResult.winRate,
          backtestResult.maxDrawdown,
        ]
      );

      this.logger.info(`✅ Vote recorded for signal ${signalId}`);
    } catch (error) {
      this.logger.error(`Error submitting vote for signal ${signalId}:`, error);
      throw error;
    }
  }

  async checkConsensus(signalId: string): Promise<{
    reached: boolean;
    approved: boolean;
    votes: { approve: number; reject: number };
  }> {
    const result = await this.db.query(
      `SELECT
        COUNT(*) FILTER (WHERE vote = 'APPROVE') as approve_count,
        COUNT(*) FILTER (WHERE vote = 'REJECT') as reject_count,
        COUNT(*) as total_count
       FROM votes
       WHERE signal_id = $1`,
      [signalId]
    );

    const { approve_count, reject_count, total_count } = result.rows[0];
    const approveCount = parseInt(approve_count, 10);
    const rejectCount = parseInt(reject_count, 10);
    const totalCount = parseInt(total_count, 10);

    // Consensus requires 66% agreement
    const consensusThreshold = 0.66;
    const approveRatio = totalCount > 0 ? approveCount / totalCount : 0;
    const rejectRatio = totalCount > 0 ? rejectCount / totalCount : 0;

    const reached = approveRatio >= consensusThreshold || rejectRatio >= consensusThreshold;
    const approved = approveRatio >= consensusThreshold;

    return {
      reached,
      approved,
      votes: {
        approve: approveCount,
        reject: rejectCount,
      },
    };
  }
}
