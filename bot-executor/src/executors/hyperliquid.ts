import { BaseExecutor, ExecutorConfig, OrderParams, Order } from './base';

/**
 * Hyperliquid exchange executor
 *
 * This is a stub implementation. In production, integrate with
 * Hyperliquid API using their SDK or REST API.
 */
export class HyperliquidExecutor extends BaseExecutor {
  constructor(config: ExecutorConfig) {
    super('Hyperliquid', config);
  }

  async executeMarketOrder(params: OrderParams): Promise<Order> {
    console.log(`[Hyperliquid] Executing market order:`, params);

    // TODO: Implement actual Hyperliquid API call
    // For now, return mock order
    return {
      id: `HL-${Date.now()}`,
      symbol: params.symbol,
      side: params.side,
      quantity: params.quantity,
      price: params.price || 0,
      status: 'filled',
      timestamp: new Date(),
    };
  }

  async executeLimitOrder(params: OrderParams): Promise<Order> {
    console.log(`[Hyperliquid] Executing limit order:`, params);

    // TODO: Implement actual Hyperliquid API call
    return {
      id: `HL-${Date.now()}`,
      symbol: params.symbol,
      side: params.side,
      quantity: params.quantity,
      price: params.price || 0,
      status: 'open',
      timestamp: new Date(),
    };
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    console.log(`[Hyperliquid] Cancelling order: ${orderId}`);
    // TODO: Implement
    return true;
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    console.log(`[Hyperliquid] Getting order status: ${orderId}`);
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async getBalance(): Promise<{ [asset: string]: number }> {
    console.log(`[Hyperliquid] Getting balance`);
    // TODO: Implement
    return { USDC: 10000 };
  }

  async setStopLoss(orderId: string, stopPrice: number): Promise<boolean> {
    console.log(`[Hyperliquid] Setting stop loss: ${orderId} @ ${stopPrice}`);
    // TODO: Implement
    return true;
  }

  async setTakeProfit(orderId: string, targetPrice: number): Promise<boolean> {
    console.log(`[Hyperliquid] Setting take profit: ${orderId} @ ${targetPrice}`);
    // TODO: Implement
    return true;
  }
}
