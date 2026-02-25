import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/store/walletStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getSignals } from '@/services/api';
import SignalCard from '@/components/SignalCard';
import type { Signal } from '@/types';

export default function SignalFeed() {
  const { address, isConnected } = useWalletStore();
  const { subscribeToSignals } = useWebSocket();
  const [realtimeSignals, setRealtimeSignals] = useState<Signal[]>([]);

  // Fetch initial signals
  const { data, isLoading, error } = useQuery({
    queryKey: ['signals', address],
    queryFn: () => getSignals(address || '0x0'),
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30s as fallback
  });

  // Subscribe to real-time signal updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToSignals((signal: Signal) => {
      console.log('New signal received:', signal);
      setRealtimeSignals(prev => [signal, ...prev]);
    });

    return unsubscribe;
  }, [isConnected, subscribeToSignals]);

  // Combine API signals with real-time signals
  const allSignals = [
    ...realtimeSignals,
    ...(data?.data?.signals || []),
  ];

  // Remove duplicates by ID
  const uniqueSignals = Array.from(
    new Map(allSignals.map(s => [s.id, s])).values()
  );

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Connect your wallet to view validated trading signals
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading signals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-400">Failed to load signals</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Signal Feed</h2>
          <p className="text-gray-400">Real-time validated trading signals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Tier Info */}
      {data?.data?.delayed && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-500 text-sm">
            ⚠️ Observer tier: Signals are delayed by 24 hours. Upgrade to Bronze for real-time
            access.
          </p>
        </div>
      )}

      {/* Signal Grid */}
      {uniqueSignals.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-lg">
          <div className="text-4xl mb-4">📡</div>
          <p className="text-gray-400">No signals available yet</p>
          <p className="text-sm text-gray-500 mt-2">
            New signals will appear here as they are validated
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {uniqueSignals.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
