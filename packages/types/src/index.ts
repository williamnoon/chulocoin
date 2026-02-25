/**
 * ChuloBots Shared TypeScript Types
 *
 * This package contains shared type definitions used across the monorepo.
 */

// Example shared types - expand as needed
export interface User {
  id: string;
  address: string;
  createdAt: Date;
}

export interface Signal {
  id: string;
  minerId: string;
  pair: string;
  action: "long" | "short";
  confidence: number;
  timestamp: Date;
}

export interface Tier {
  name: string;
  threshold: number;
  benefits: string[];
}

// Export all types
export * from "./index";
