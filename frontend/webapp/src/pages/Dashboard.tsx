import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/store/walletStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getUserStats } from '@/services/api';
import { Link } from 'react-router-dom';

interface Stats {
  tier: string;
  chuloBalance: number;
  activePositions: number;
  totalSignals: number;
  winRate: number;
  totalPnL: number;
  todayPnL: number;
  weekPnL: number;
}

export default function Dashboard() {
  const { address, isConnected } = useWalletStore();
  const { subscribeToSignals, subscribeToPositions } = useWebSocket();
  const [recentSignalCount, setRecentSignalCount] = useState(0);

  // Fetch user stats
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userStats', address],
    queryFn: () => getUserStats(address || '0x0'),
    enabled: !!address,
    refetchInterval: 30000,
  });

  const stats: Stats = data?.data || {
    tier: 'Observer',
    chuloBalance: 0,
    activePositions: 0,
    totalSignals: 0,
    winRate: 0,
    totalPnL: 0,
    todayPnL: 0,
    weekPnL: 0,
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubSignals = subscribeToSignals(() => {
      setRecentSignalCount(prev => prev + 1);
      refetch();
    });

    const unsubPositions = subscribeToPositions(() => {
      refetch();
    });

    return () => {
      unsubSignals?.();
      unsubPositions?.();
    };
  }, [isConnected, subscribeToSignals, subscribeToPositions, refetch]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Connect your wallet to access your dashboard
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back, trader</p>
      </div>

      {/* Tier Status */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Tier</p>
            <h2 className="text-2xl font-bold text-white">{stats.tier}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {stats.chuloBalance.toLocaleString()} CHULO
            </p>
          </div>
          {stats.tier === 'Observer' && (
            <Link
              to="/settings"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Upgrade Tier
            </Link>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Active Positions</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activePositions}</p>
          <Link
            to="/positions"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Signals</p>
            <span className="text-2xl">📡</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSignals}</p>
          {recentSignalCount > 0 && (
            <p className="text-sm text-green-400 mt-2">
              +{recentSignalCount} new
            </p>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Win Rate</p>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(stats.winRate * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {stats.totalSignals} trades
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total P&L</p>
            <span className="text-2xl">💰</span>
          </div>
          <p
            className={`text-3xl font-bold ${
              stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {stats.totalPnL >= 0 ? '+' : ''}
            ${stats.totalPnL.toFixed(2)}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span
              className={stats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}
            >
              Today: {stats.todayPnL >= 0 ? '+' : ''}
              ${stats.todayPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/signals"
          className="bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">View Signals</h3>
            <span className="text-2xl group-hover:scale-110 transition">📡</span>
          </div>
          <p className="text-sm text-gray-400">
            Browse validated trading signals
          </p>
        </Link>

        <Link
          to="/positions"
          className="bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-green-500 transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Manage Positions</h3>
            <span className="text-2xl group-hover:scale-110 transition">📊</span>
          </div>
          <p className="text-sm text-gray-400">
            Track and close active trades
          </p>
        </Link>

        <Link
          to="/settings"
          className="bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-purple-500 transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Bot Settings</h3>
            <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
          </div>
          <p className="text-sm text-gray-400">
            Configure exchanges and risk
          </p>
        </Link>
      </div>

      {/* Observer Tier CTA */}
      {stats.tier === 'Observer' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-2">
                Unlock Real-Time Signals
              </h3>
              <p className="text-gray-300 mb-4">
                Observer tier signals are delayed 24 hours. Hold 1,000 CHULO to
                unlock Bronze tier with real-time access.
              </p>
              <Link
                to="/settings"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition inline-block"
              >
                Upgrade Now
              </Link>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      )}
    </div>
  );
}
