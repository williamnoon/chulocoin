// Types for ChuloBots Validator Node

export interface Signal {
  id: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  qualityScore: number;
  strategy: string;
  timestamp: number;
}

export interface BacktestResult {
  sharpe: number;
  winRate: number;
  maxDrawdown: number;
  totalReturn: number;
  trades: number;
  oraclePrice: number;
}

export interface ValidatorConfig {
  wallet: string;
  privateKey: string;
  name: string;
  tier: number;
  chulobotApiUrl: string;
  chulobotWsUrl: string;
  arbitrumRpcUrl: string;
  chainlinkRpcUrl: string;
  chainId: number;
  contracts: {
    chulo: string;
    staking: string;
    oracle: string;
  };
  databaseUrl: string;
  maxConcurrentBacktests: number;
  backtestTimeout: number;
  dashboardPort: number;
  logLevel: string;
  validation: {
    minSharpe: number;
    minWinRate: number;
    maxDrawdown: number;
    minQualityScore: number;
    priceTolerance: number;
    consensusThreshold: number;
  };
}

export interface HealthStatus {
  healthy: boolean;
  database: string;
  blockchain: string;
  websocket?: string;
  lastValidation?: string;
}

export interface ValidatorStats {
  validations: number;
  uptime: number;
  approvals: number;
  rejections: number;
  avgSharpe: number;
  avgWinRate: number;
  rewardsEarned: number;
}
