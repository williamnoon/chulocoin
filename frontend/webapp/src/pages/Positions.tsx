import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/store/walletStore';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Position {
  id: string;
  signalId: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  currentPrice: number;
  stop: number;
  target: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  exchange: string;
  openedAt: string;
}

export default function Positions() {
  const { address, isConnected } = useWalletStore();
  const { subscribeToPositions } = useWebSocket();
  const [positions, setPositions] = useState<Position[]>([]);
  const [filter, setFilter] = useState<'all' | 'profitable' | 'losing'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      return {
        data: [
          {
            id: '1',
            signalId: 'sig_123',
            asset: 'BTC',
            direction: 'LONG' as const,
            entry: 50000,
            currentPrice: 51500,
            stop: 48000,
            target: 55000,
            size: 0.5,
            pnl: 750,
            pnlPercent: 3.0,
            exchange: 'Hyperliquid',
            openedAt: new Date().toISOString(),
          },
        ],
      };
    },
    enabled: !!address,
  });

  useEffect(() => {
    if (!isConnected) return;
    const unsub = subscribeToPositions(position => {
      setPositions(prev => {
        const index = prev.findIndex(p => p.id === position.id);
        if (index >= 0) {
          const newPositions = [...prev];
          newPositions[index] = position as Position;
          return newPositions;
        }
        return [...prev, position as Position];
      });
    });
    return () => {
      unsub?.();
    };
  }, [isConnected, subscribeToPositions]);

  useEffect(() => {
    if (data?.data) {
      setPositions(data.data);
    }
  }, [data]);

  const filteredPositions = positions.filter(p => {
    if (filter === 'profitable') return p.pnl > 0;
    if (filter === 'losing') return p.pnl < 0;
    return true;
  });

  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view positions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Positions</h2>
          <p className="text-gray-400">Manage your open trades</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total P&L</p>
          <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700">
        {['all', 'profitable', 'losing'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 font-medium transition ${
              filter === f
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} (
            {f === 'all'
              ? positions.length
              : f === 'profitable'
                ? positions.filter(p => p.pnl > 0).length
                : positions.filter(p => p.pnl < 0).length}
            )
          </button>
        ))}
      </div>

      {filteredPositions.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-lg">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">No positions found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPositions.map(position => (
            <div key={position.id} className="bg-slate-900 rounded-lg border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{position.asset}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        position.direction === 'LONG'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {position.direction}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{position.exchange}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {position.pnlPercent >= 0 ? '+' : ''}
                    {position.pnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Entry</p>
                  <p className="text-sm font-mono text-white">${position.entry.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="text-sm font-mono text-blue-400">
                    ${position.currentPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Stop</p>
                  <p className="text-sm font-mono text-red-400">
                    ${position.stop.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="text-sm font-mono text-green-400">
                    ${position.target.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
