/**
 * ChuloBots Shared Utilities
 *
 * This package contains shared utilities and helpers used across the monorepo.
 */

// Example utility functions - expand as needed

/**
 * Format a wallet address for display (truncate middle)
 */
export function formatAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address || address.length < prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format timestamp to human-readable string
 */
export function formatTimestamp(timestamp: Date | number): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleString();
}

// Export all utilities
export * from "./index";
