// WebSocket listener for incoming signals

import WebSocket from 'ws';
import { Logger } from 'pino';
import { Signal } from './types';

export class SignalListener {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly RECONNECT_DELAY = 5000;

  constructor(
    private readonly wsUrl: string,
    private readonly onSignal: (signal: Signal) => Promise<void>,
    private readonly logger: Logger
  ) {}

  async connect(): Promise<void> {
    try {
      this.logger.info(`🌐 Connecting to ChuloBots API: ${this.wsUrl}`);

      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        this.logger.info('✅ WebSocket connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      });

      this.ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'new_signal') {
            await this.onSignal(message.signal);
          }
        } catch (error) {
          this.logger.error('Error processing message:', error);
        }
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        this.logger.warn('⚠️  WebSocket disconnected. Reconnecting...');
        this.scheduleReconnect();
      });
    } catch (error) {
      this.logger.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.logger.info('🔄 Attempting to reconnect...');
        this.connect();
      }, this.RECONNECT_DELAY);
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
