/* eslint-disable no-console */
// ChuloBots Validator Node - Main Entry Point

import express from 'express';
import { ethers } from 'ethers';
import { Pool } from 'pg';
import pino from 'pino';

import { loadConfig } from './config';
import { SignalListener } from './listener';
import { BacktestEngine } from './backtester';
import { ConsensusVoter } from './voter';
import { RewardTracker } from './rewards';
import { MetricsCollector } from './metrics';
import { HealthCheck } from './health';
import { Signal, ValidatorConfig } from './types';

class ValidatorNode {
  private app: express.Application;
  private db!: Pool;
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private config: ValidatorConfig;
  private logger: pino.Logger;

  private listener!: SignalListener;
  private backtester!: BacktestEngine;
  private voter!: ConsensusVoter;
  private rewards!: RewardTracker;
  private metrics!: MetricsCollector;
  private health!: HealthCheck;

  private isRunning = false;
  private validationCount = 0;

  constructor() {
    this.config = loadConfig();
    this.app = express();

    this.logger = pino({
      level: this.config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  async initialize() {
    this.logger.info('🚀 Initializing ChuloBots Validator Node...');

    // 1. Connect to database
    this.logger.info('📊 Connecting to database...');
    this.db = new Pool({
      connectionString: this.config.databaseUrl,
      max: 10,
    });
    await this.db.query('SELECT NOW()');
    await this.initializeDatabase();
    this.logger.info('✅ Database connected');

    // 2. Initialize blockchain connection
    this.logger.info('🔗 Connecting to Arbitrum...');
    this.provider = new ethers.JsonRpcProvider(this.config.arbitrumRpcUrl);
    this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);

    const balance = await this.provider.getBalance(this.wallet.address);
    this.logger.info(`✅ Wallet connected: ${this.wallet.address}`);
    this.logger.info(`💰 ETH Balance: ${ethers.formatEther(balance)} ETH`);

    // 3. Verify stake
    this.logger.info('🔒 Verifying stake...');
    await this.verifyStake();

    // 4. Initialize components
    this.logger.info('🛠️  Initializing components...');

    this.backtester = new BacktestEngine(this.logger);
    this.voter = new ConsensusVoter(this.wallet, this.db, this.logger);
    this.rewards = new RewardTracker(this.wallet, this.db, this.logger);
    this.metrics = new MetricsCollector();
    this.health = new HealthCheck(this.db, this.provider);

    this.listener = new SignalListener(
      this.config.chulobotWsUrl,
      this.handleNewSignal.bind(this),
      this.logger
    );

    this.logger.info('✅ All components initialized');

    // 5. Start background tasks
    this.startBackgroundTasks();

    this.logger.info('✅ Validator Node Ready!');
    this.logger.info(`📍 Name: ${this.config.name}`);
    this.logger.info(`📍 Wallet: ${this.wallet.address}`);
    this.logger.info(`📍 Tier: ${this.config.tier}`);
  }

  private async initializeDatabase() {
    // Create tables if they don't exist
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS validations (
        id SERIAL PRIMARY KEY,
        signal_id VARCHAR(255) NOT NULL,
        validator_address VARCHAR(255) NOT NULL,
        vote VARCHAR(10) NOT NULL,
        sharpe DECIMAL NOT NULL,
        win_rate DECIMAL NOT NULL,
        max_drawdown DECIMAL,
        duration_ms INTEGER,
        reward_amount DECIMAL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(signal_id, validator_address)
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        signal_id VARCHAR(255) NOT NULL,
        validator_address VARCHAR(255) NOT NULL,
        vote VARCHAR(10) NOT NULL,
        sharpe DECIMAL NOT NULL,
        win_rate DECIMAL NOT NULL,
        max_drawdown DECIMAL NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(signal_id, validator_address)
      );

      CREATE INDEX IF NOT EXISTS idx_validations_signal ON validations(signal_id);
      CREATE INDEX IF NOT EXISTS idx_validations_validator ON validations(validator_address);
      CREATE INDEX IF NOT EXISTS idx_votes_signal ON votes(signal_id);
    `);
  }

  private async verifyStake() {
    const stakingContract = new ethers.Contract(
      this.config.contracts.staking,
      [
        'function getValidator(address) view returns (uint256 stakedAmount, uint256 rewards, uint256 validations, bool isActive, uint256 reputation)',
        'function MIN_STAKE() view returns (uint256)',
      ],
      this.provider
    );

    const [stakedAmount, , , isActive] =
      await stakingContract.getValidator(this.wallet.address);

    const stakeAmount = ethers.formatEther(stakedAmount);

    if (!isActive) {
      throw new Error(
        `❌ Not an active validator! Please stake CHULO at app.chulobots.com/stake`
      );
    }

    this.logger.info(`✅ Staked: ${stakeAmount} CHULO`);

    // Recommended minimums by tier
    const minStakes: Record<number, number> = {
      1: 10000,
      2: 50000,
      3: 200000,
    };

    const minStake = minStakes[this.config.tier] || 50000;
    if (parseFloat(stakeAmount) < minStake) {
      this.logger.warn(
        `⚠️  Warning: Stake is below recommended minimum for Tier ${this.config.tier} (${minStake} CHULO)`
      );
    }
  }

  private async handleNewSignal(signal: Signal) {
    try {
      const startTime = Date.now();
      this.logger.info(`📨 New signal received: #${signal.id}`);

      this.metrics.incrementCounter('signals_received_total');
      this.metrics.incGauge('active_validations');

      // 1. Run backtest
      this.logger.info(`🔬 Running backtest for signal #${signal.id}...`);
      const backtestResult = await this.backtester.runBacktest(signal);

      const backtestTime = Date.now() - startTime;
      this.metrics.recordHistogram('backtest_duration_seconds', backtestTime / 1000);

      // 2. Determine vote
      const vote = this.determineVote(backtestResult, signal);
      this.logger.info(
        `🗳️  Vote decision: ${vote} (Sharpe: ${backtestResult.sharpe.toFixed(2)})`
      );

      // 3. Submit vote on-chain
      this.logger.info(`📝 Submitting vote for signal #${signal.id}...`);
      await this.voter.submitVote(signal.id, vote, backtestResult);

      const totalTime = Date.now() - startTime;
      this.metrics.recordHistogram('validation_duration_seconds', totalTime / 1000);

      // 4. Record validation
      this.validationCount++;
      this.metrics.incrementCounter('validations_total');
      this.metrics.incrementCounter(
        vote === 'APPROVE' ? 'votes_approve_total' : 'votes_reject_total'
      );

      await this.db.query(
        `INSERT INTO validations (signal_id, validator_address, vote, sharpe, win_rate, max_drawdown, duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (signal_id, validator_address) DO NOTHING`,
        [
          signal.id,
          this.wallet.address,
          vote,
          backtestResult.sharpe,
          backtestResult.winRate,
          backtestResult.maxDrawdown,
          totalTime,
        ]
      );

      this.logger.info(`✅ Signal #${signal.id} validated in ${totalTime}ms`);
      this.logger.info(`📊 Total validations today: ${this.validationCount}`);

      this.metrics.decGauge('active_validations');
    } catch (error) {
      this.logger.error(`❌ Error validating signal #${signal.id}:`, error);
      this.metrics.incrementCounter('validation_errors_total');
      this.metrics.decGauge('active_validations');
    }
  }

  private determineVote(
    backtestResult: any,
    signal: Signal
  ): 'APPROVE' | 'REJECT' {
    const { validation } = this.config;

    // Check all criteria
    if (backtestResult.sharpe < validation.minSharpe) {
      this.logger.debug(
        `Reject: Sharpe ${backtestResult.sharpe} < ${validation.minSharpe}`
      );
      return 'REJECT';
    }

    if (backtestResult.winRate < validation.minWinRate) {
      this.logger.debug(
        `Reject: Win rate ${backtestResult.winRate} < ${validation.minWinRate}`
      );
      return 'REJECT';
    }

    if (backtestResult.maxDrawdown > validation.maxDrawdown) {
      this.logger.debug(
        `Reject: Max DD ${backtestResult.maxDrawdown} > ${validation.maxDrawdown}`
      );
      return 'REJECT';
    }

    if (signal.qualityScore < validation.minQualityScore) {
      this.logger.debug(
        `Reject: Quality score ${signal.qualityScore} < ${validation.minQualityScore}`
      );
      return 'REJECT';
    }

    // Verify price against Chainlink oracle
    const oraclePrice = backtestResult.oraclePrice;
    const signalPrice = signal.entryPrice;
    const priceDiff = Math.abs(oraclePrice - signalPrice) / oraclePrice;

    if (priceDiff > validation.priceTolerance) {
      this.logger.debug(
        `Reject: Price diff ${(priceDiff * 100).toFixed(2)}% > ${(validation.priceTolerance * 100).toFixed(2)}%`
      );
      return 'REJECT';
    }

    return 'APPROVE';
  }

  private startBackgroundTasks() {
    // Claim rewards every 24 hours
    setInterval(
      async () => {
        try {
          this.logger.info('💰 Claiming rewards...');
          await this.rewards.claimRewards();
        } catch (error) {
          this.logger.error('Error claiming rewards:', error);
        }
      },
      24 * 60 * 60 * 1000
    );

    // Health check every 5 minutes
    setInterval(async () => {
      const healthStatus = await this.health.check();
      if (!healthStatus.healthy) {
        this.logger.error('⚠️  Health check failed:', healthStatus);
        this.metrics.incrementCounter('health_check_failures_total');
      }
    }, 5 * 60 * 1000);

    // Metrics cleanup every hour
    setInterval(() => {
      this.metrics.cleanup();
    }, 60 * 60 * 1000);
  }

  private setupMiddleware() {
    this.app.use(express.json());

    // CORS
    this.app.use((_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Request logging
    this.app.use((req, _res, next) => {
      this.logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', async (_req, res) => {
      const healthStatus = await this.health.check();
      res.status(healthStatus.healthy ? 200 : 503).json(healthStatus);
    });

    // Metrics (Prometheus)
    this.app.get('/metrics', async (_req, res) => {
      res.set('Content-Type', this.metrics.getRegistry().contentType);
      res.end(await this.metrics.getRegistry().metrics());
    });

    // Validator status
    this.app.get('/status', async (_req, res) => {
      const healthStatus = await this.health.check();
      const status = {
        name: this.config.name,
        wallet: this.wallet.address,
        tier: this.config.tier,
        validations: {
          total: this.validationCount,
          today: this.validationCount,
        },
        uptime: process.uptime(),
        healthy: healthStatus.healthy,
      };
      res.json(status);
    });

    // Recent validations
    this.app.get('/validations', async (req, res) => {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const result = await this.db.query(
        `SELECT * FROM validations
         WHERE validator_address = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [this.wallet.address, limit]
      );
      res.json(result.rows);
    });

    // Statistics
    this.app.get('/stats', async (_req, res) => {
      const stats = await this.db.query(
        `SELECT
          COUNT(*) as total_validations,
          SUM(CASE WHEN vote = 'APPROVE' THEN 1 ELSE 0 END) as approvals,
          SUM(CASE WHEN vote = 'REJECT' THEN 1 ELSE 0 END) as rejections,
          AVG(sharpe) as avg_sharpe,
          AVG(win_rate) as avg_win_rate,
          AVG(duration_ms) as avg_duration_ms
        FROM validations
        WHERE validator_address = $1`,
        [this.wallet.address]
      );
      res.json(stats.rows[0]);
    });

    // Simple dashboard
    this.app.get('/', (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ChuloBots Validator Dashboard</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: monospace;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #1a1a1a;
              color: #0f0;
            }
            h1 { color: #0f0; }
            .stat {
              background: #000;
              padding: 15px;
              margin: 10px 0;
              border: 1px solid #0f0;
            }
            .status-ok { color: #0f0; }
            .status-error { color: #f00; }
            a { color: #0f0; }
          </style>
        </head>
        <body>
          <h1>🤖 ChuloBots Validator Node</h1>
          <div class="stat">
            <strong>Name:</strong> ${this.config.name}<br>
            <strong>Wallet:</strong> ${this.wallet.address}<br>
            <strong>Tier:</strong> ${this.config.tier}<br>
            <strong>Status:</strong> <span class="status-ok">RUNNING ✅</span>
          </div>
          <div class="stat">
            <strong>Validations Today:</strong> ${this.validationCount}<br>
            <strong>Uptime:</strong> ${Math.floor(process.uptime() / 60)} minutes
          </div>
          <p>
            <a href="/status">Status JSON</a> |
            <a href="/validations">Recent Validations</a> |
            <a href="/stats">Statistics</a> |
            <a href="/metrics">Prometheus Metrics</a> |
            <a href="/health">Health Check</a>
          </p>
        </body>
        </html>
      `);
    });
  }

  async start() {
    await this.initialize();

    // Start HTTP server
    const port = this.config.dashboardPort;
    this.app.listen(port, () => {
      this.logger.info(`🌐 Dashboard running on http://localhost:${port}`);
    });

    // Start signal listener
    await this.listener.connect();

    this.isRunning = true;
    this.logger.info('✅ Validator Node is now running!');
  }

  async stop() {
    this.logger.info('🛑 Shutting down validator node...');
    this.isRunning = false;
    await this.listener.disconnect();
    await this.db.end();
    this.logger.info('✅ Validator node stopped');
  }
}

// Main execution
const validator = new ValidatorNode();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await validator.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await validator.stop();
  process.exit(0);
});

// Start validator
validator.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export default ValidatorNode;
