import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWalletStore } from '@/store/walletStore';

interface UseWebSocketOptions {
  autoConnect?: boolean;
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
  const subscribeToSignals = (callback: (signal: any) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('subscribe:signals');
    socket.on('signal:new', callback);

    return () => {
      socket.emit('unsubscribe:signals');
      socket.off('signal:new', callback);
    };
  };

  // Subscribe to positions
  const subscribeToPositions = (callback: (position: any) => void) => {
    const socket = socketRef.current;
    if (!socket || !address) return;

    socket.emit('subscribe:positions');
    socket.on('position:update', callback);

    return () => {
      socket.off('position:update', callback);
    };
  };

  // Subscribe to price updates
  const subscribeToPrices = (assets: string[], callback: (data: any) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('subscribe:prices', { assets });
    socket.on('price:update', callback);

    return () => {
      socket.off('price:update', callback);
    };
  };

  // Listen for notifications
  const subscribeToNotifications = (callback: (notification: any) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

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
