/**
 * Base executor class for all exchange integrations
 */

export interface ExecutorConfig {
  apiKey: string;
  apiSecret?: string;
  testnet?: boolean;
}

export interface OrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: Date;
}

export abstract class BaseExecutor {
  protected config: ExecutorConfig;
  protected name: string;

  constructor(name: string, config: ExecutorConfig) {
    this.name = name;
    this.config = config;
  }

  /**
   * Execute market order
   */
  abstract executeMarketOrder(params: OrderParams): Promise<Order>;

  /**
   * Execute limit order
   */
  abstract executeLimitOrder(params: OrderParams): Promise<Order>;

  /**
   * Cancel order
   */
  abstract cancelOrder(orderId: string): Promise<boolean>;

  /**
   * Get order status
   */
  abstract getOrderStatus(orderId: string): Promise<Order>;

  /**
   * Get account balance
   */
  abstract getBalance(): Promise<{ [asset: string]: number }>;

  /**
   * Set stop loss
   */
  abstract setStopLoss(orderId: string, stopPrice: number): Promise<boolean>;

  /**
   * Set take profit
   */
  abstract setTakeProfit(orderId: string, targetPrice: number): Promise<boolean>;

  /**
   * Get executor name
   */
  getName(): string {
    return this.name;
  }
}
