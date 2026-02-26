// Subscription tiers from TierSubscription.sol contract
// All prices burn CHULO tokens (deflationary)
// Default: Quarterly (recommended for savings)
const tiers = [
  {
    name: 'Free',
    chulo: '0',
    price: 'Free',
    monthly: '$0',
    quarterly: null,
    quarterlyChulo: null,
    quarterlySavings: null,
    credits: '0',
    maxBots: '0',
    maxPositions: '1',
    maxSize: '$100',
    signalDelay: '24hr Delayed',
    strategies: 'None',
    strategyLevel: 0,
    features: ['1 position max', '$100 max size', '24-hour delayed signals', 'Community support'],
    highlight: false,
  },
  {
    name: 'Observer',
    chulo: '1,000',
    price: '$10/mo',
    monthly: '$10 (1,000 CHULO)',
    quarterly: '$28.50',
    quarterlyChulo: '2,850 CHULO',
    quarterlySavings: 'Save 5%',
    credits: '300/quarter',
    maxBots: '1',
    maxPositions: '3',
    maxSize: '$500',
    signalDelay: 'Real-time',
    strategies: 'Basic',
    strategyLevel: 1,
    features: [
      '300 credits/quarter',
      '1 trading bot',
      '3 active positions',
      'Real-time signals',
      'Basic strategies',
      'NFT subscription badge',
    ],
    highlight: false,
  },
  {
    name: 'Junior Quant',
    chulo: '3,000',
    price: '$30/mo',
    monthly: '$30 (3,000 CHULO)',
    quarterly: '$81',
    quarterlyChulo: '8,100 CHULO',
    quarterlySavings: 'Save 10%',
    credits: '1,500/quarter',
    maxBots: '3',
    maxPositions: '10',
    maxSize: '$2,500',
    signalDelay: 'Real-time',
    strategies: 'Intermediate',
    strategyLevel: 2,
    features: [
      '1,500 credits/quarter',
      '3 trading bots',
      '10 active positions',
      'Intermediate strategies',
      'Advanced analytics',
      'NFT subscription badge',
    ],
    highlight: true,
  },
  {
    name: 'Senior Quant',
    chulo: '9,000',
    price: '$90/mo',
    monthly: '$90 (9,000 CHULO)',
    quarterly: '$216',
    quarterlyChulo: '21,600 CHULO',
    quarterlySavings: 'Save 20%',
    credits: '6,000/quarter',
    maxBots: '10',
    maxPositions: '50',
    maxSize: '$10,000',
    signalDelay: 'Real-time',
    strategies: 'Advanced',
    strategyLevel: 3,
    features: [
      '6,000 credits/quarter',
      '10 trading bots',
      '50 active positions',
      'Advanced strategies',
      'API access',
      'NFT subscription badge',
    ],
    highlight: false,
  },
  {
    name: 'Sage',
    chulo: '25,000',
    price: '$250/mo',
    monthly: '$250 (25,000 CHULO)',
    quarterly: '$450',
    quarterlyChulo: '45,000 CHULO',
    quarterlySavings: 'Save 40%',
    credits: '30,000/quarter',
    maxBots: '50',
    maxPositions: '200',
    maxSize: '$100,000',
    signalDelay: 'Priority',
    strategies: 'All + Custom',
    strategyLevel: 4,
    features: [
      '30,000 credits/quarter',
      '50 trading bots',
      '200 active positions',
      'All strategies + custom',
      'Full API access',
      'White-glove support',
      'NFT subscription badge',
    ],
    highlight: false,
  },
];

export default function TierComparison() {
  return (
    <section id="pricing" className="w-full py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Subscription Plans</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Quarterly plans recommended - save up to 40% and get credits upfront
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm">
            🔥 All subscriptions burn CHULO permanently - deflationary tokenomics
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`relative rounded-xl p-6 ${
                tier.highlight
                  ? 'bg-gradient-to-br from-chulo/20 to-chulo/10 border-2 border-chulo shadow-2xl'
                  : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              } transition-all duration-300 hover:scale-105`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-chulo text-slate-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                {tier.quarterly ? (
                  <>
                    <div className="text-3xl font-bold mb-1 text-chulo-light">{tier.quarterly}</div>
                    <div className="text-xs text-chulo-light font-semibold mb-2">
                      {tier.quarterlySavings}
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      {tier.quarterlyChulo} / quarter
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Monthly: {tier.monthly}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-1 text-chulo-light">{tier.price}</div>
                    <div className="text-sm text-gray-400 font-mono">{tier.chulo} CHULO</div>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                {tier.credits !== '0' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Credits</span>
                    <span className="font-semibold text-chulo-light font-mono">{tier.credits}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trading Bots</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.maxBots}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Positions</span>
                  <span className="font-semibold text-chulo-light font-mono">
                    {tier.maxPositions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Position Size</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.maxSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Signals</span>
                  <span className="font-semibold text-chulo-light font-mono">
                    {tier.signalDelay}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Strategies</span>
                  <span className="font-semibold text-chulo-light font-mono text-xs">
                    {tier.strategies}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start text-sm">
                    <svg
                      className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        tier.highlight ? 'text-chulo-light' : 'text-chulo'
                      }`}
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
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  tier.highlight
                    ? 'bg-chulo hover:bg-chulo-dark text-black shadow-lg hover:shadow-xl'
                    : tier.name === 'Free'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {tier.name === 'Free' ? 'Get Started' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {/* Tokenomics and Credits Note */}
        <div className="mt-16 max-w-4xl mx-auto space-y-6">
          <div className="p-6 bg-gradient-to-r from-chulo/10 to-chulo/5 border-2 border-chulo/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="text-2xl mr-2">🔥</span>
              Deflationary Tokenomics
            </h3>
            <p className="text-gray-300 leading-relaxed">
              All subscription payments{' '}
              <strong className="text-chulo-light">burn CHULO tokens permanently</strong>, reducing
              the circulating supply from the 100M max supply. This creates deflationary pressure,
              potentially increasing token value over time. Quarterly subscriptions offer up to 40%
              savings!
            </p>
          </div>

          <div className="p-6 bg-gradient-to-r from-chulo/10 to-chulo/5 border-2 border-chulo/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="text-2xl mr-2">💎</span>
              Credits & NFT Badges
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Each subscription grants{' '}
              <strong className="text-chulo-light">credits for platform actions</strong> (submit
              signals, validate, create positions, backtest). Credits never expire and accumulate
              over time. Plus, you&apos;ll receive a{' '}
              <strong className="text-chulo-light">non-transferable NFT subscription badge</strong>{' '}
              as proof of your tier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
