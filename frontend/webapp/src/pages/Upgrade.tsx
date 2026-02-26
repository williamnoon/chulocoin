import { useState } from 'react';

const tiers = [
  {
    name: 'Free',
    quarterlyPrice: 0,
    monthlyPrice: 0,
    quarterlyChulo: 0,
    monthlyChulo: 0,
    discount: 0,
    credits: 0,
    maxBots: 0,
    maxPositions: 1,
    maxSize: 100,
    signalDelay: '24 hours',
    strategies: 'None',
    features: ['1 position', '$100 max size', '24hr delayed signals', 'Community support'],
  },
  {
    name: 'Observer',
    quarterlyPrice: 28.5,
    monthlyPrice: 10,
    quarterlyChulo: 2_850,
    monthlyChulo: 1_000,
    discount: 5,
    credits: 300,
    maxBots: 1,
    maxPositions: 3,
    maxSize: 500,
    signalDelay: 'Real-time',
    strategies: 'Basic',
    features: [
      '300 credits/quarter',
      '1 bot',
      '3 positions',
      'Real-time signals',
      'Basic strategies',
      'NFT badge',
    ],
  },
  {
    name: 'Junior Quant',
    quarterlyPrice: 81,
    monthlyPrice: 30,
    quarterlyChulo: 8_100,
    monthlyChulo: 3_000,
    discount: 10,
    credits: 1_500,
    maxBots: 3,
    maxPositions: 10,
    maxSize: 2_500,
    signalDelay: 'Real-time',
    strategies: 'Intermediate',
    features: [
      '1,500 credits/quarter',
      '3 bots',
      '10 positions',
      'Intermediate strategies',
      'Analytics',
      'NFT badge',
    ],
  },
  {
    name: 'Senior Quant',
    quarterlyPrice: 216,
    monthlyPrice: 90,
    quarterlyChulo: 21_600,
    monthlyChulo: 9_000,
    discount: 20,
    credits: 6_000,
    maxBots: 10,
    maxPositions: 50,
    maxSize: 10_000,
    signalDelay: 'Real-time',
    strategies: 'Advanced',
    features: [
      '6,000 credits/quarter',
      '10 bots',
      '50 positions',
      'Advanced strategies',
      'API access',
      'NFT badge',
    ],
  },
  {
    name: 'Sage',
    quarterlyPrice: 450,
    monthlyPrice: 250,
    quarterlyChulo: 45_000,
    monthlyChulo: 25_000,
    discount: 40,
    credits: 30_000,
    maxBots: 50,
    maxPositions: 200,
    maxSize: 100_000,
    signalDelay: 'Priority',
    strategies: 'All + Custom',
    features: [
      '30,000 credits/quarter',
      '50 bots',
      '200 positions',
      'All + custom strategies',
      'Full API',
      'White-glove support',
      'NFT badge',
    ],
  },
];

export default function Upgrade() {
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'monthly'>('quarterly');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-gray-400">Choose your tier and unlock powerful trading features</p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('quarterly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              billingPeriod === 'quarterly'
                ? 'bg-orange-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quarterly (Save up to 40%)
          </button>
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-orange-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tiers.map(tier => {
          const isPopular = tier.name === 'Junior Quant';
          const price = billingPeriod === 'quarterly' ? tier.quarterlyPrice : tier.monthlyPrice;
          const chulo = billingPeriod === 'quarterly' ? tier.quarterlyChulo : tier.monthlyChulo;

          return (
            <div
              key={tier.name}
              className={`relative rounded-lg p-6 ${
                isPopular
                  ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500'
                  : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              } transition-all`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                {tier.name === 'Free' ? (
                  <div className="text-3xl font-bold text-orange-400">Free</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-orange-400">
                      ${price}
                      {billingPeriod === 'quarterly' && (
                        <span className="text-sm text-orange-400 block">Save {tier.discount}%</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{chulo.toLocaleString()} CHULO</div>
                    <div className="text-xs text-gray-500">
                      {billingPeriod === 'quarterly' ? '/ quarter' : '/ month'}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-slate-700">
                {tier.credits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Credits</span>
                    <span className="font-semibold text-orange-400">{tier.credits}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bots</span>
                  <span className="font-semibold text-orange-400">{tier.maxBots}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Positions</span>
                  <span className="font-semibold text-orange-400">{tier.maxPositions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Size</span>
                  <span className="font-semibold text-orange-400">
                    ${tier.maxSize.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Signals</span>
                  <span className="font-semibold text-orange-400 text-xs">{tier.signalDelay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Strategies</span>
                  <span className="font-semibold text-orange-400 text-xs">{tier.strategies}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isPopular
                    ? 'bg-orange-500 hover:bg-orange-600 text-black'
                    : tier.name === 'Free'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {tier.name === 'Free' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Boxes */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-lg">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <span className="mr-2">🔥</span>
            Deflationary Tokenomics
          </h3>
          <p className="text-gray-300 text-sm">
            All subscription payments permanently burn CHULO tokens, reducing circulating supply.
            This creates deflationary pressure that can increase token value over time.
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/30 rounded-lg">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <span className="mr-2">💎</span>
            Credits & NFT Badges
          </h3>
          <p className="text-gray-300 text-sm">
            Each subscription grants credits for platform actions (signals, validations, positions,
            backtests). Credits never expire. Plus get a non-transferable NFT subscription badge!
          </p>
        </div>
      </div>
    </div>
  );
}
