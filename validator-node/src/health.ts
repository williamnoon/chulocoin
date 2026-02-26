// Health check service

import { Pool } from 'pg';
import { ethers } from 'ethers';
import { HealthStatus } from './types';

export class HealthCheck {
  constructor(
    private readonly db: Pool,
    private readonly provider: ethers.JsonRpcProvider
  ) {}

  async check(): Promise<HealthStatus> {
    const status: HealthStatus = {
      healthy: true,
      database: 'unknown',
      blockchain: 'unknown',
    };

    // Check database
    try {
      await this.db.query('SELECT NOW()');
      status.database = 'ok';
    } catch (error) {
      status.database = 'error';
      status.healthy = false;
    }

    // Check blockchain connection
    try {
      await this.provider.getBlockNumber();
      status.blockchain = 'ok';
    } catch (error) {
      status.blockchain = 'error';
      status.healthy = false;
    }

    return status;
  }

  async checkDatabase(): Promise<boolean> {
    try {
      await this.db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async checkBlockchain(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }
}
