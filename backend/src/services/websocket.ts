import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class WebSocketService {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: { walletAddress: string }) => {
        if (data.walletAddress) {
          socket.data.walletAddress = data.walletAddress;
          socket.join(`user:${data.walletAddress}`);
          console.log(`User authenticated: ${data.walletAddress}`);
        }
      });

      // Subscribe to signal feed
      socket.on('subscribe:signals', () => {
        socket.join('signals');
        console.log(`${socket.id} subscribed to signals`);
      });

      // Unsubscribe from signal feed
      socket.on('unsubscribe:signals', () => {
        socket.leave('signals');
        console.log(`${socket.id} unsubscribed from signals`);
      });

      // Subscribe to position updates
      socket.on('subscribe:positions', () => {
        if (socket.data.walletAddress) {
          socket.join(`positions:${socket.data.walletAddress}`);
          console.log(`${socket.id} subscribed to positions`);
        }
      });

      // Subscribe to price updates
      socket.on('subscribe:prices', (data: { assets: string[] }) => {
        if (data.assets && Array.isArray(data.assets)) {
          data.assets.forEach(asset => {
            socket.join(`prices:${asset}`);
          });
          console.log(`${socket.id} subscribed to prices:`, data.assets);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast new signal to all subscribers
   */
  public broadcastSignal(signal: any) {
    this.io.to('signals').emit('signal:new', signal);
  }

  /**
   * Send position update to specific user
   */
  public sendPositionUpdate(walletAddress: string, position: any) {
    this.io.to(`positions:${walletAddress}`).emit('position:update', position);
  }

  /**
   * Broadcast price update for specific asset
   */
  public broadcastPriceUpdate(asset: string, priceData: any) {
    this.io.to(`prices:${asset}`).emit('price:update', {
      asset,
      ...priceData,
    });
  }

  /**
   * Send notification to specific user
   */
  public sendNotification(walletAddress: string, notification: any) {
    this.io.to(`user:${walletAddress}`).emit('notification', notification);
  }

  /**
   * Broadcast system message to all connected clients
   */
  public broadcastSystemMessage(message: string) {
    this.io.emit('system:message', { message, timestamp: new Date() });
  }

  /**
   * Get connected clients count
   */
  public getConnectedCount(): number {
    return this.io.sockets.sockets.size;
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService(httpServer);
    console.log('✅ WebSocket service initialized');
  }
  return wsService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
};
