'use client';

import { useState, useEffect } from 'react';

export default function NetworkStats() {
  const [stats, setStats] = useState({
    validators: 87,
    totalStaked: 4.2,
    uptime: 99.8,
  });

  // Simulate slight variations
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        validators: prev.validators + (Math.random() > 0.5 ? 1 : 0),
        totalStaked: prev.totalStaked + Math.random() * 0.01,
        uptime: 99.7 + Math.random() * 0.2,
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-12 bg-slate-900 border-y border-chulo/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Active Validators */}
          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-chulo/20 hover:border-chulo/40 transition-all duration-300 hover:scale-105">
            <div className="text-5xl font-bold text-chulo-light mb-2 font-mono">
              {stats.validators}
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">
              Active Validators
            </div>
            <div className="text-gray-500 text-xs">Worldwide</div>
          </div>

          {/* Total Staked */}
          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-chulo/20 hover:border-chulo/40 transition-all duration-300 hover:scale-105">
            <div className="text-5xl font-bold text-chulo-light mb-2 font-mono">
              {stats.totalStaked.toFixed(1)}M
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Total Staked</div>
            <div className="text-gray-500 text-xs">CHULO Secured</div>
          </div>

          {/* Network Uptime */}
          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-chulo/20 hover:border-chulo/40 transition-all duration-300 hover:scale-105">
            <div className="text-5xl font-bold text-chulo-light mb-2 font-mono">
              {stats.uptime.toFixed(1)}%
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Network Uptime</div>
            <div className="text-gray-500 text-xs">Average</div>
          </div>
        </div>
      </div>
    </section>
  );
}
