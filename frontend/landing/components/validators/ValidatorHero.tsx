'use client';

import { useState, useEffect } from 'react';

export default function ValidatorHero() {
  const [stats, setStats] = useState({
    validations: 342,
    earnings: 475,
    usdValue: 142.5,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        validations: prev.validations + Math.floor(Math.random() * 3),
        earnings: prev.earnings + Math.random() * 0.5,
        usdValue: prev.usdValue + Math.random() * 0.15,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='monospace' font-size='40' fill='%2322c55e'%3E0%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-chulo/20 border border-chulo/30 text-chulo-light text-sm font-mono mb-8">
            <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse"></span>
            VALIDATOR NETWORK ONLINE
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Become a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-chulo-light via-chulo to-green-600">
                  ChuloBots Validator
                </span>
              </h1>

              <p className="text-2xl md:text-3xl text-green-400 font-bold mb-4">
                Earn Up to $4,275/month
              </p>

              <p className="text-lg text-gray-300 mb-8">
                Run a validator node, verify trading signals, and earn CHULO rewards 24/7.
                No coding required. Set up in 5 minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#download"
                  className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5 text-center"
                >
                  Download Software
                </a>
                <a
                  href="#calculator"
                  className="px-8 py-4 bg-transparent border-2 border-chulo hover:bg-chulo/10 text-chulo font-bold rounded-lg transition-all duration-200 text-center"
                >
                  Calculate Earnings
                </a>
                <a
                  href="https://docs.chulobots.com/validators"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 text-gray-300 hover:text-chulo-light font-semibold transition-colors duration-200 text-center underline"
                >
                  Read Docs →
                </a>
              </div>
            </div>

            {/* Right: Terminal Window */}
            <div className="relative">
              <div className="bg-black/50 backdrop-blur-sm border-2 border-chulo/30 rounded-lg overflow-hidden shadow-2xl shadow-chulo/20">
                {/* Terminal Header */}
                <div className="bg-slate-900 border-b border-chulo/30 px-4 py-2 flex items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-gray-400">validator-node@chulobots</span>
                </div>

                {/* Terminal Content */}
                <div className="p-6 font-mono text-sm space-y-3">
                  <div className="flex items-center text-chulo-light">
                    <span className="mr-2">✅</span>
                    <span className="animate-pulse">Validator Node Running</span>
                  </div>

                  <div className="text-gray-300">
                    <span className="text-gray-500">$</span> status
                  </div>

                  <div className="pl-4 space-y-2">
                    <div className="text-green-400">
                      <span className="text-gray-500">→</span> Uptime: <span className="font-bold">99.8%</span>
                    </div>
                    <div className="text-green-400">
                      <span className="text-gray-500">→</span> Tier: <span className="font-bold">2 (Professional)</span>
                    </div>
                    <div className="text-green-400">
                      <span className="text-gray-500">→</span> Stake: <span className="font-bold">50,000 CHULO</span>
                    </div>
                  </div>

                  <div className="text-gray-300 mt-4">
                    <span className="text-gray-500">$</span> earnings today
                  </div>

                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-yellow-400">
                      <span><span className="text-gray-500">📊</span> Validations:</span>
                      <span className="font-bold">{Math.floor(stats.validations)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                      <span><span className="text-gray-500">💰</span> Earnings:</span>
                      <span className="font-bold">{stats.earnings.toFixed(2)} CHULO</span>
                    </div>
                    <div className="flex justify-between text-green-400 text-lg">
                      <span><span className="text-gray-500">💵</span> USD Value:</span>
                      <span className="font-bold">${stats.usdValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-gray-500 mt-4">
                    <span className="animate-pulse">▊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
