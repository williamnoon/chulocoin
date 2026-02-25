import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

// ChainlinkPriceOracle ABI (minimal interface)
const ORACLE_ABI = [
  'function getLatestPrice(string calldata asset) external view returns (int256 price, uint256 timestamp)',
  'function verifyPrice(string calldata asset, int256 signalPrice) external returns (bool isValid, int256 oraclePrice, uint256 deviation)',
  'function priceTolerance() external view returns (uint256)',
  'function hasPriceFeed(string calldata asset) external view returns (bool)',
];

export class PriceOracleService {
  private provider: ethers.JsonRpcProvider;
  private oracleContract: ethers.Contract;
  private readonly oracleAddress: string;

  constructor(rpcUrl?: string, oracleAddress?: string) {
    this.oracleAddress = oracleAddress || process.env.ORACLE_CONTRACT_ADDRESS || '';

    if (!this.oracleAddress) {
      throw new Error('Oracle contract address not configured');
    }

    const rpc = rpcUrl || process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc';
    this.provider = new ethers.JsonRpcProvider(rpc);
    this.oracleContract = new ethers.Contract(this.oracleAddress, ORACLE_ABI, this.provider);
  }

  /**
   * Get latest price for an asset from Chainlink oracle
   */
  async getLatestPrice(asset: string): Promise<{ price: number; timestamp: Date }> {
    try {
      const [priceRaw, timestampRaw] = await this.oracleContract.getLatestPrice(asset);

      // Convert from 8 decimals to number
      const price = Number(ethers.formatUnits(priceRaw, 8));
      const timestamp = new Date(Number(timestampRaw) * 1000);

      return { price, timestamp };
    } catch (error) {
      throw new Error(`Failed to get price for ${asset}: ${(error as Error).message}`);
    }
  }

  /**
   * Verify if a signal price is within acceptable range
   */
  async verifySignalPrice(
    asset: string,
    signalPrice: number
  ): Promise<{
    isValid: boolean;
    oraclePrice: number;
    deviation: number;
    deviationPercent: number;
  }> {
    try {
      // Note: Price is converted to 8 decimals for on-chain verification if needed
      // const signalPriceWei = ethers.parseUnits(signalPrice.toString(), 8);

      // Call contract (note: this is a state-changing call, so we need a signer for actual use)
      // For read-only verification, we can use getLatestPrice and calculate locally
      const { price: oraclePrice } = await this.getLatestPrice(asset);

      // Calculate deviation in basis points
      const diff = Math.abs(signalPrice - oraclePrice);
      const deviationBps = (diff / oraclePrice) * 10000;

      // Get tolerance from contract
      const tolerance = await this.oracleContract.priceTolerance();
      const toleranceBps = Number(tolerance);

      const isValid = deviationBps <= toleranceBps;

      return {
        isValid,
        oraclePrice,
        deviation: Math.round(deviationBps),
        deviationPercent: deviationBps / 100,
      };
    } catch (error) {
      throw new Error(`Failed to verify price for ${asset}: ${(error as Error).message}`);
    }
  }

  /**
   * Check if price feed exists for asset
   */
  async hasPriceFeed(asset: string): Promise<boolean> {
    try {
      return await this.oracleContract.hasPriceFeed(asset);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current price tolerance (in basis points)
   */
  async getPriceTolerance(): Promise<number> {
    try {
      const tolerance = await this.oracleContract.priceTolerance();
      return Number(tolerance);
    } catch (error) {
      throw new Error(`Failed to get price tolerance: ${(error as Error).message}`);
    }
  }

  /**
   * Validate multiple signals at once
   */
  async verifyMultipleSignals(
    signals: Array<{ asset: string; price: number }>
  ): Promise<
    Array<{
      asset: string;
      signalPrice: number;
      isValid: boolean;
      oraclePrice: number;
      deviation: number;
    }>
  > {
    const results = await Promise.allSettled(
      signals.map(async signal => {
        const verification = await this.verifySignalPrice(signal.asset, signal.price);
        return {
          asset: signal.asset,
          signalPrice: signal.price,
          ...verification,
        };
      })
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
  }

  /**
   * Check if price data is fresh (< 5 minutes old)
   */
  async isPriceFresh(asset: string, maxAgeSeconds: number = 300): Promise<boolean> {
    try {
      const { timestamp } = await this.getLatestPrice(asset);
      const age = (Date.now() - timestamp.getTime()) / 1000;
      return age <= maxAgeSeconds;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let oracleServiceInstance: PriceOracleService | null = null;

export const getOracleService = (): PriceOracleService => {
  if (!oracleServiceInstance) {
    oracleServiceInstance = new PriceOracleService();
  }
  return oracleServiceInstance;
};
