import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWalletStore } from '@/store/walletStore';
import type { Signal } from '@/types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

interface Position {
  id: string | number;
  walletAddress?: string;
  signalId: string | number;
  exchange: string;
  asset: string;
  side?: 'LONG' | 'SHORT';
  direction?: 'LONG' | 'SHORT';
  entry: number;
  entryPrice?: number;
  stop: number;
  target: number;
  size: number;
  currentPrice: number;
  pnl: number;
  pnlPercent?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  openedAt?: string;
}

interface PriceUpdate {
  asset: string;
  price: number;
  timestamp: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { address } = useWalletStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket connection
    const socket = io(process.env.VITE_API_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);

      // Authenticate with wallet address
      if (address) {
        socket.emit('authenticate', { walletAddress: address });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [autoConnect, address]);

  // Subscribe to signals
  const subscribeToSignals = (callback: (signal: Signal) => void): (() => void) | undefined => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    socket.emit('subscribe:signals');
    socket.on('signal:new', callback);

    return () => {
      socket.emit('unsubscribe:signals');
      socket.off('signal:new', callback);
    };
  };

  // Subscribe to positions
  const subscribeToPositions = (
    callback: (position: Position) => void
  ): (() => void) | undefined => {
    const socket = socketRef.current;
    if (!socket || !address) return undefined;

    socket.emit('subscribe:positions');
    socket.on('position:update', callback);

    return () => {
      socket.off('position:update', callback);
    };
  };

  // Subscribe to price updates
  const subscribeToPrices = (
    assets: string[],
    callback: (data: PriceUpdate) => void
  ): (() => void) | undefined => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    socket.emit('subscribe:prices', { assets });
    socket.on('price:update', callback);

    return () => {
      socket.off('price:update', callback);
    };
  };

  // Listen for notifications
  const subscribeToNotifications = (
    callback: (notification: Notification) => void
  ): (() => void) | undefined => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    socket.on('notification', callback);

    return () => {
      socket.off('notification', callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    subscribeToSignals,
    subscribeToPositions,
    subscribeToPrices,
    subscribeToNotifications,
  };
}
