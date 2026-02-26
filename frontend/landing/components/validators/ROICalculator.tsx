'use client';

import { useState, useEffect } from 'react';

interface TierInfo {
  name: string;
  stake: number;
  validationsPerDay: number;
  burnPoolShare: number;
}

const TIERS: TierInfo[] = [
  { name: 'Tier 1', stake: 10000, validationsPerDay: 100, burnPoolShare: 0 },
  { name: 'Tier 2', stake: 50000, validationsPerDay: 500, burnPoolShare: 0.02 },
  { name: 'Tier 3', stake: 200000, validationsPerDay: 1500, burnPoolShare: 0.05 },
];

export default function ROICalculator() {
  const [stakeAmount, setStakeAmount] = useState(50000);
  const [chuloPrice, setChuloPrice] = useState(0.30);
  const [currentTier, setCurrentTier] = useState<TierInfo>(TIERS[1]);

  // Calculate tier based on stake amount
  useEffect(() => {
    if (stakeAmount >= 200000) {
      setCurrentTier(TIERS[2]);
    } else if (stakeAmount >= 50000) {
      setCurrentTier(TIERS[1]);
    } else {
      setCurrentTier(TIERS[0]);
    }
  }, [stakeAmount]);

  // Calculate earnings
  const validationRewardsPerDay = currentTier.validationsPerDay * 0.25;
  const burnPoolPerDay = currentTier.burnPoolShare > 0 ? 400 : 0; // Estimated burn pool
  const totalChuloPerDay = validationRewardsPerDay + burnPoolPerDay;
  const totalChuloPerMonth = totalChuloPerDay * 30;
  const totalChuloPerYear = totalChuloPerDay * 365;

  const usdPerDay = totalChuloPerDay * chuloPrice;
  const usdPerMonth = totalChuloPerMonth * chuloPrice;
  const usdPerYear = totalChuloPerYear * chuloPrice;

  const initialInvestment = stakeAmount * chuloPrice + 888; // VPS + RPC costs
  const annualROI = ((usdPerYear - 888) / initialInvestment) * 100;

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(Number(e.target.value));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChuloPrice(Number(e.target.value));
  };

  return (
    <section id="calculator" className="w-full py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Calculate Your Earnings
            </h2>
            <p className="text-xl text-gray-400">
              Interactive ROI calculator - see your potential validator income
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Input Controls */}
            <div className="bg-slate-800 border border-chulo/20 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Configuration</h3>

              {/* Stake Amount Slider */}
              <div className="mb-8">
                <label className="block text-gray-300 mb-3 font-semibold">
                  Stake Amount: {stakeAmount.toLocaleString()} CHULO
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="1000"
                  value={stakeAmount}
                  onChange={handleStakeChange}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((stakeAmount - 10000) / 190000) * 100}%, #334155 ${((stakeAmount - 10000) / 190000) * 100}%, #334155 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10k</span>
                  <span>50k</span>
                  <span>200k</span>
                </div>
              </div>

              {/* CHULO Price Input */}
              <div className="mb-8">
                <label className="block text-gray-300 mb-3 font-semibold">
                  CHULO Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">$</span>
                  <input
                    type="number"
                    min="0.01"
                    max="10"
                    step="0.01"
                    value={chuloPrice}
                    onChange={handlePriceChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 pl-8 text-white font-mono focus:outline-none focus:border-chulo transition-colors"
                  />
                </div>
              </div>

              {/* Tier Info */}
              <div className="bg-slate-900/50 border border-chulo/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Selected Tier:</span>
                  <span className="text-chulo-light font-bold text-xl">{currentTier.name}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Validations/Day:</span>
                    <span className="font-mono text-white">{currentTier.validationsPerDay}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Burn Pool Share:</span>
                    <span className="font-mono text-white">{(currentTier.burnPoolShare * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Reward per Validation:</span>
                    <span className="font-mono text-white">0.25 CHULO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="bg-gradient-to-br from-chulo/10 to-green-900/10 border-2 border-chulo/30 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Projected Earnings</h3>

              {/* Main Earnings Display */}
              <div className="mb-8 p-6 bg-slate-900/50 rounded-lg border border-chulo/30">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Monthly Income</div>
                  <div className="text-5xl font-bold text-chulo-light mb-2 font-mono">
                    ${usdPerMonth.toFixed(0)}
                  </div>
                  <div className="text-gray-400 font-mono">{totalChuloPerMonth.toFixed(0)} CHULO</div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/30 rounded-lg p-4">
                  <div className="text-xs text-gray-400 uppercase mb-3">Daily</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Validation Rewards:</span>
                      <span className="text-white font-mono">{validationRewardsPerDay.toFixed(2)} CHULO</span>
                    </div>
                    {burnPoolPerDay > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Burn Pool Share:</span>
                        <span className="text-white font-mono">{burnPoolPerDay.toFixed(2)} CHULO</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-chulo-light font-semibold">Total:</span>
                      <span className="text-chulo-light font-mono font-bold">${usdPerDay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/30 rounded-lg p-4">
                  <div className="text-xs text-gray-400 uppercase mb-3">Annual</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gross Revenue:</span>
                      <span className="text-white font-mono">${usdPerYear.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Operating Costs:</span>
                      <span className="text-red-400 font-mono">-$888</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-chulo-light font-semibold">Net Profit:</span>
                      <span className="text-chulo-light font-mono font-bold">${(usdPerYear - 888).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className="bg-gradient-to-r from-chulo/20 to-green-600/20 border border-chulo/40 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-300 mb-2">Annual ROI</div>
                <div className="text-4xl font-bold text-chulo-light font-mono">
                  {annualROI.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Break-even: {(initialInvestment / usdPerMonth).toFixed(1)} months
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-6 text-center">
                * Estimates based on current network metrics. Actual earnings may vary.
              </p>
            </div>
          </div>

          {/* Quick Comparison */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, index) => {
              const tierValidationRewards = tier.validationsPerDay * 0.25;
              const tierBurnPool = tier.burnPoolShare > 0 ? 400 : 0;
              const tierTotalPerDay = tierValidationRewards + tierBurnPool;
              const tierMonthlyUSD = tierTotalPerDay * 30 * chuloPrice;

              return (
                <div
                  key={tier.name}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    tier.stake === stakeAmount
                      ? 'bg-chulo/10 border-chulo shadow-lg shadow-chulo/20'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setStakeAmount(tier.stake)}
                >
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">{tier.name}</h4>
                    <div className="text-sm text-gray-400 mb-4">{tier.stake.toLocaleString()} CHULO</div>
                    <div className="text-3xl font-bold text-chulo-light mb-1 font-mono">
                      ${tierMonthlyUSD.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                    {index === 1 && (
                      <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                        RECOMMENDED
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
