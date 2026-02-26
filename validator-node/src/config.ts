// Configuration loader for ChuloBots Validator Node

import dotenv from 'dotenv';
import { ValidatorConfig } from './types';

dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadConfig(): ValidatorConfig {
  return {
    wallet: getEnvVar('VALIDATOR_WALLET'),
    privateKey: getEnvVar('VALIDATOR_PRIVATE_KEY'),
    name: getEnvVar('VALIDATOR_NAME', 'ChuloBots Validator'),
    tier: parseInt(getEnvVar('STAKE_TIER', '2'), 10),
    chulobotApiUrl: getEnvVar('CHULOBOTS_API_URL'),
    chulobotWsUrl: getEnvVar('CHULOBOTS_WS_URL'),
    arbitrumRpcUrl: getEnvVar('ARBITRUM_RPC_URL'),
    chainlinkRpcUrl: getEnvVar('CHAINLINK_RPC_URL'),
    chainId: parseInt(getEnvVar('CHAIN_ID', '42161'), 10),
    contracts: {
      chulo: getEnvVar('CHULO_CONTRACT'),
      staking: getEnvVar('STAKING_CONTRACT'),
      oracle: getEnvVar('ORACLE_CONTRACT'),
    },
    databaseUrl: getEnvVar('DATABASE_URL'),
    maxConcurrentBacktests: parseInt(getEnvVar('MAX_CONCURRENT_BACKTESTS', '5'), 10),
    backtestTimeout: parseInt(getEnvVar('BACKTEST_TIMEOUT', '60'), 10) * 1000,
    dashboardPort: parseInt(getEnvVar('DASHBOARD_PORT', '3001'), 10),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
    validation: {
      minSharpe: parseFloat(getEnvVar('MIN_SHARPE', '1.5')),
      minWinRate: parseFloat(getEnvVar('MIN_WIN_RATE', '0.55')),
      maxDrawdown: parseFloat(getEnvVar('MAX_DRAWDOWN', '0.25')),
      minQualityScore: parseInt(getEnvVar('MIN_QUALITY_SCORE', '70'), 10),
      priceTolerance: parseFloat(getEnvVar('PRICE_TOLERANCE', '0.005')),
      consensusThreshold: parseFloat(getEnvVar('CONSENSUS_THRESHOLD', '0.66')),
    },
  };
}
