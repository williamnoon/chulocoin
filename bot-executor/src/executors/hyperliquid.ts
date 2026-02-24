import { BaseExecutor, ExecutorConfig, OrderParams, Order } from './base';
import { ethers } from 'ethers';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Hyperliquid-specific configuration
 */
export interface HyperliquidConfig extends ExecutorConfig {
  apiKey: string; // Private key for wallet-based signing
  testnet?: boolean;
  builderCode?: string; // Builder code for revenue sharing (default: CHULOBOTS)
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hyperliquid API response types
 */
interface HyperliquidOrderResponse {
  status: string;
  response: {
    type: string;
    data: {
      statuses: Array<{
        resting?: {
          oid: number;
        };
        filled?: {
          oid: number;
          totalSz: string;
          avgPx: string;
        };
        error?: string;
      }>;
    };
  };
}

interface HyperliquidOrderStatus {
  order: {
    coin: string;
    side: string;
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    origSz: string;
  };
  status: string;
  statusTimestamp: number;
}

interface HyperliquidBalance {
  assetPositions: Array<{
    position: {
      coin: string;
      entryPx: string | null;
      leverage: {
        type: string;
        value: number;
      };
      liquidationPx: string | null;
      marginUsed: string;
      maxLeverage: number;
      positionValue: string;
      returnOnEquity: string;
      szi: string;
      unrealizedPnl: string;
    };
    type: string;
  }>;
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  withdrawable: string;
}

/**
 * Rate limiter for API requests
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async throttle(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    const resolve = this.queue.shift();
    this.processing = false;

    if (resolve) resolve();
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

/**
 * Hyperliquid exchange executor
 *
 * Implements full integration with Hyperliquid perpetual DEX including:
 * - Market and limit orders
 * - Stop loss and take profit orders
 * - Order management and status tracking
 * - Account balance queries
 * - Rate limiting and retry logic
 * - Builder code integration for revenue sharing
 * - Testnet and mainnet support
 */
export class HyperliquidExecutor extends BaseExecutor {
  private wallet: ethers.Wallet;
  private httpClient: AxiosInstance;
  private baseUrl: string;
  private builderCode: string;
  private rateLimiter: RateLimiter;
  private maxRetries: number;
  private retryDelay: number;
  private orderCache: Map<string, HyperliquidOrderStatus>;

  constructor(config: HyperliquidConfig) {
    super('Hyperliquid', config);

    // Initialize wallet for signing
    this.wallet = new ethers.Wallet(config.apiKey);

    // Set API base URL based on network
    this.baseUrl = config.testnet
      ? 'https://api.hyperliquid-testnet.xyz'
      : 'https://api.hyperliquid.xyz';

    // Set builder code for revenue sharing
    this.builderCode = config.builderCode || 'CHULOBOTS';

    // Initialize retry configuration
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Initialize order cache
    this.orderCache = new Map();

    // Initialize rate limiter (10 requests per second to be safe)
    this.rateLimiter = new RateLimiter(10);

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Hyperliquid] Initialized executor for ${config.testnet ? 'testnet' : 'mainnet'}`);
    console.log(`[Hyperliquid] Wallet address: ${this.wallet.address}`);
    console.log(`[Hyperliquid] Builder code: ${this.builderCode}`);
  }

  /**
   * Execute market order on Hyperliquid
   */
  async executeMarketOrder(params: OrderParams): Promise<Order> {
    if (params.type !== 'market') {
      throw new Error('Invalid order type for executeMarketOrder. Use "market".');
    }

    console.log(`[Hyperliquid] Executing market order:`, params);

    try {
      const order = await this.placeOrder({
        ...params,
        price: undefined, // Market orders don't have a price
        isMarket: true,
      });

      // Set stop loss and take profit if specified
      if (params.stopLoss && order.id) {
        await this.setStopLoss(order.id, params.stopLoss);
      }
      if (params.takeProfit && order.id) {
        await this.setTakeProfit(order.id, params.takeProfit);
      }

      return order;
    } catch (error) {
      throw this.handleError('executeMarketOrder', error);
    }
  }

  /**
   * Execute limit order on Hyperliquid
   */
  async executeLimitOrder(params: OrderParams): Promise<Order> {
    if (params.type !== 'limit') {
      throw new Error('Invalid order type for executeLimitOrder. Use "limit".');
    }

    if (!params.price) {
      throw new Error('Price is required for limit orders.');
    }

    console.log(`[Hyperliquid] Executing limit order:`, params);

    try {
      const order = await this.placeOrder({
        ...params,
        isMarket: false,
      });

      // Set stop loss and take profit if specified
      if (params.stopLoss && order.id) {
        await this.setStopLoss(order.id, params.stopLoss);
      }
      if (params.takeProfit && order.id) {
        await this.setTakeProfit(order.id, params.takeProfit);
      }

      return order;
    } catch (error) {
      throw this.handleError('executeLimitOrder', error);
    }
  }

  /**
   * Internal method to place orders with proper signing
   */
  private async placeOrder(params: OrderParams & { isMarket: boolean }): Promise<Order> {
    const { symbol, side, quantity, price, isMarket } = params;

    // Convert side to Hyperliquid format
    const isBuy = side === 'buy';

    // Prepare order request
    const orderRequest = {
      coin: symbol,
      is_buy: isBuy,
      sz: quantity,
      limit_px: isMarket ? '0' : price!.toString(), // '0' for market orders
      order_type: {
        limit: {
          tif: 'Ioc', // Immediate or Cancel for market orders
        },
      },
      reduce_only: false,
    };

    // If it's a limit order, use 'Gtc' (Good Till Cancel)
    if (!isMarket) {
      orderRequest.order_type = {
        limit: {
          tif: 'Gtc',
        },
      };
    }

    // Prepare action for signing
    const action = {
      type: 'order',
      orders: [orderRequest],
      grouping: 'na',
      builder: {
        b: this.builderCode,
        f: 10, // 10 basis points (0.1%) for builder fee
      },
    };

    // Sign the request
    const signature = await this.signAction(action);

    // Send order to Hyperliquid
    const response = await this.makeRequest<HyperliquidOrderResponse>('/exchange', {
      action,
      nonce: Date.now(),
      signature,
      vaultAddress: null,
    });

    // Parse response
    if (response.status === 'ok' && response.response.data.statuses[0]) {
      const status = response.response.data.statuses[0];

      if (status.error) {
        throw new Error(`Hyperliquid order error: ${status.error}`);
      }

      // Extract order ID
      const oid = status.resting?.oid || status.filled?.oid;
      if (!oid) {
        throw new Error('No order ID returned from Hyperliquid');
      }

      const orderId = oid.toString();
      const orderStatus: 'open' | 'filled' = status.filled ? 'filled' : 'open';
      const fillPrice = status.filled ? parseFloat(status.filled.avgPx) : (price || 0);

      const order: Order = {
        id: orderId,
        symbol,
        side,
        quantity,
        price: fillPrice,
        status: orderStatus,
        timestamp: new Date(),
      };

      console.log(`[Hyperliquid] Order placed successfully:`, order);
      return order;
    }

    throw new Error(`Unexpected response from Hyperliquid: ${JSON.stringify(response)}`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    console.log(`[Hyperliquid] Cancelling order: ${orderId}`);

    try {
      // Get order details from cache or fetch
      const orderStatus = await this.getOrderStatus(orderId);

      const action = {
        type: 'cancel',
        cancels: [
          {
            a: this.wallet.address,
            o: parseInt(orderId),
          },
        ],
      };

      const signature = await this.signAction(action);

      const response = await this.makeRequest<HyperliquidOrderResponse>('/exchange', {
        action,
        nonce: Date.now(),
        signature,
        vaultAddress: null,
      });

      if (response.status === 'ok') {
        console.log(`[Hyperliquid] Order cancelled successfully: ${orderId}`);
        return true;
      }

      return false;
    } catch (error) {
      throw this.handleError('cancelOrder', error);
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<Order> {
    console.log(`[Hyperliquid] Getting order status: ${orderId}`);

    try {
      const response = await this.makeRequest<{ status: string; data: any }>('/info', {
        type: 'orderStatus',
        user: this.wallet.address,
        oid: parseInt(orderId),
      });

      if (response.status === 'ok' && response.data) {
        const orderData = response.data;

        // Parse order status
        const status: 'open' | 'filled' | 'cancelled' =
          orderData.status === 'filled' ? 'filled' :
          orderData.status === 'canceled' ? 'cancelled' : 'open';

        const order: Order = {
          id: orderId,
          symbol: orderData.order.coin,
          side: orderData.order.side === 'B' ? 'buy' : 'sell',
          quantity: parseFloat(orderData.order.sz),
          price: parseFloat(orderData.order.limitPx),
          status,
          timestamp: new Date(orderData.order.timestamp),
        };

        return order;
      }

      // Fallback: try to get from open orders
      const openOrders = await this.getOpenOrders();
      const foundOrder = openOrders.find(o => o.id === orderId);

      if (foundOrder) {
        return foundOrder;
      }

      throw new Error(`Order ${orderId} not found`);
    } catch (error) {
      throw this.handleError('getOrderStatus', error);
    }
  }

  /**
   * Get all open orders
   */
  private async getOpenOrders(): Promise<Order[]> {
    try {
      const response = await this.makeRequest<{ status: string; data: any[] }>('/info', {
        type: 'openOrders',
        user: this.wallet.address,
      });

      if (response.status === 'ok' && Array.isArray(response.data)) {
        return response.data.map(orderData => ({
          id: orderData.oid.toString(),
          symbol: orderData.coin,
          side: orderData.side === 'B' ? 'buy' : 'sell',
          quantity: parseFloat(orderData.sz),
          price: parseFloat(orderData.limitPx),
          status: 'open' as const,
          timestamp: new Date(orderData.timestamp),
        }));
      }

      return [];
    } catch (error) {
      console.error('[Hyperliquid] Error fetching open orders:', error);
      return [];
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ [asset: string]: number }> {
    console.log(`[Hyperliquid] Getting balance`);

    try {
      const response = await this.makeRequest<HyperliquidBalance>('/info', {
        type: 'clearinghouseState',
        user: this.wallet.address,
      });

      const balances: { [asset: string]: number } = {};

      // Account value in USDC
      if (response.marginSummary?.accountValue) {
        balances.USDC = parseFloat(response.marginSummary.accountValue);
      }

      // Withdrawable balance
      if (response.withdrawable) {
        balances.USDC_WITHDRAWABLE = parseFloat(response.withdrawable);
      }

      // Position values
      if (response.assetPositions) {
        response.assetPositions.forEach(assetPos => {
          const coin = assetPos.position.coin;
          const size = parseFloat(assetPos.position.szi);
          const value = parseFloat(assetPos.position.positionValue);
          const pnl = parseFloat(assetPos.position.unrealizedPnl);

          balances[`${coin}_SIZE`] = size;
          balances[`${coin}_VALUE`] = value;
          balances[`${coin}_PNL`] = pnl;
        });
      }

      console.log(`[Hyperliquid] Balance:`, balances);
      return balances;
    } catch (error) {
      throw this.handleError('getBalance', error);
    }
  }

  /**
   * Set stop loss for a position
   */
  async setStopLoss(orderId: string, stopPrice: number): Promise<boolean> {
    console.log(`[Hyperliquid] Setting stop loss: ${orderId} @ ${stopPrice}`);

    try {
      // Get the original order details
      const order = await this.getOrderStatus(orderId);

      // Create a stop loss order
      const action = {
        type: 'order',
        orders: [
          {
            coin: order.symbol,
            is_buy: order.side === 'sell', // Opposite side to close position
            sz: order.quantity,
            limit_px: stopPrice.toString(),
            order_type: {
              trigger: {
                trigger_px: stopPrice.toString(),
                is_market: true,
                tpsl: 'sl',
              },
            },
            reduce_only: true,
          },
        ],
        grouping: 'na',
        builder: {
          b: this.builderCode,
          f: 10,
        },
      };

      const signature = await this.signAction(action);

      const response = await this.makeRequest<HyperliquidOrderResponse>('/exchange', {
        action,
        nonce: Date.now(),
        signature,
        vaultAddress: null,
      });

      if (response.status === 'ok' && !response.response.data.statuses[0].error) {
        console.log(`[Hyperliquid] Stop loss set successfully`);
        return true;
      }

      const error = response.response.data.statuses[0].error;
      throw new Error(`Failed to set stop loss: ${error}`);
    } catch (error) {
      throw this.handleError('setStopLoss', error);
    }
  }

  /**
   * Set take profit for a position
   */
  async setTakeProfit(orderId: string, targetPrice: number): Promise<boolean> {
    console.log(`[Hyperliquid] Setting take profit: ${orderId} @ ${targetPrice}`);

    try {
      // Get the original order details
      const order = await this.getOrderStatus(orderId);

      // Create a take profit order
      const action = {
        type: 'order',
        orders: [
          {
            coin: order.symbol,
            is_buy: order.side === 'sell', // Opposite side to close position
            sz: order.quantity,
            limit_px: targetPrice.toString(),
            order_type: {
              trigger: {
                trigger_px: targetPrice.toString(),
                is_market: true,
                tpsl: 'tp',
              },
            },
            reduce_only: true,
          },
        ],
        grouping: 'na',
        builder: {
          b: this.builderCode,
          f: 10,
        },
      };

      const signature = await this.signAction(action);

      const response = await this.makeRequest<HyperliquidOrderResponse>('/exchange', {
        action,
        nonce: Date.now(),
        signature,
        vaultAddress: null,
      });

      if (response.status === 'ok' && !response.response.data.statuses[0].error) {
        console.log(`[Hyperliquid] Take profit set successfully`);
        return true;
      }

      const error = response.response.data.statuses[0].error;
      throw new Error(`Failed to set take profit: ${error}`);
    } catch (error) {
      throw this.handleError('setTakeProfit', error);
    }
  }

  /**
   * Sign an action using EIP-712 structured data signing
   */
  private async signAction(action: any): Promise<string> {
    // Hyperliquid uses EIP-712 typed data signing
    const domain = {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: this.config.testnet ? 421614 : 42161, // Arbitrum testnet or mainnet
      verifyingContract: '0x0000000000000000000000000000000000000000',
    };

    const types = {
      HyperliquidTransaction: [
        { name: 'action', type: 'string' },
        { name: 'nonce', type: 'uint64' },
      ],
    };

    const value = {
      action: JSON.stringify(action),
      nonce: Date.now(),
    };

    try {
      const signature = await this.wallet.signTypedData(domain, types, value);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make HTTP request with rate limiting and retry logic
   */
  private async makeRequest<T>(endpoint: string, data: any, retryCount = 0): Promise<T> {
    // Apply rate limiting
    await this.rateLimiter.throttle();

    try {
      const response = await this.httpClient.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`[Hyperliquid] Request failed, retrying (${retryCount + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest<T>(endpoint, data, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;

    const axiosError = error as AxiosError;

    // Retry on network errors
    if (!axiosError.response) return true;

    // Retry on rate limit errors (429) or server errors (5xx)
    const status = axiosError.response.status;
    return status === 429 || (status >= 500 && status < 600);
  }

  /**
   * Handle and format errors
   */
  private handleError(method: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      return new Error(
        `[Hyperliquid] ${method} failed: HTTP ${status} - ${JSON.stringify(data) || errorMessage}`
      );
    }

    return new Error(`[Hyperliquid] ${method} failed: ${errorMessage}`);
  }

  /**
   * Get current market price for a symbol
   */
  async getMarketPrice(symbol: string): Promise<number> {
    try {
      const response = await this.makeRequest<{ status: string; data: any[] }>('/info', {
        type: 'allMids',
      });

      if (response.status === 'ok' && Array.isArray(response.data)) {
        const symbolIndex = response.data.findIndex(coin => coin === symbol);
        if (symbolIndex === -1) {
          throw new Error(`Symbol ${symbol} not found`);
        }

        // The second element contains the prices
        const prices = response.data[1];
        return parseFloat(prices[symbolIndex]);
      }

      throw new Error('Failed to fetch market price');
    } catch (error) {
      throw this.handleError('getMarketPrice', error);
    }
  }

  /**
   * Get available trading symbols
   */
  async getSymbols(): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ status: string; data: any[] }>('/info', {
        type: 'meta',
      });

      if (response.status === 'ok' && response.data) {
        const universe = response.data[0]?.universe || [];
        return universe.map((coin: any) => coin.name);
      }

      return [];
    } catch (error) {
      console.error('[Hyperliquid] Error fetching symbols:', error);
      return [];
    }
  }
}
