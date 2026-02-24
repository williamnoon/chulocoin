// Shared type definitions for the backend

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export enum UserTier {
  OBSERVER = 'Observer',
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
}

export interface Signal {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  target: number;
  confidence: number;
  validatedAt?: Date;
  createdAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  tier: UserTier;
  chuloBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  userId: string;
  signalId: string;
  entryPrice: number;
  size: number;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  closedAt?: Date;
  createdAt: Date;
}
