// Subscription tiers from TierSubscription.sol contract
// All prices burn CHULO tokens (deflationary)
const tiers = [
  {
    name: 'Free',
    chulo: '0',
    price: 'Free',
    monthly: '$0',
    quarterly: null,
    maxBots: '0',
    maxPositions: '1',
    maxSize: '$100',
    signalDelay: '24hr Delayed',
    strategies: 'None',
    features: ['1 position max', '$100 max size', '24-hour delayed signals', 'Community support'],
    highlight: false,
  },
  {
    name: 'Observer',
    chulo: '1,000',
    price: '$10/mo',
    monthly: '$10 (1,000 CHULO)',
    quarterly: '$28.50 (2,850 CHULO) - Save 5%',
    maxBots: '1',
    maxPositions: '3',
    maxSize: '$500',
    signalDelay: 'Real-time',
    strategies: 'Basic',
    features: ['1 trading bot', '3 active positions', 'Real-time signals', 'Basic strategies', '100 monthly credits'],
    highlight: false,
  },
  {
    name: 'Junior Quant',
    chulo: '3,000',
    price: '$30/mo',
    monthly: '$30 (3,000 CHULO)',
    quarterly: '$81 (8,100 CHULO) - Save 10%',
    maxBots: '3',
    maxPositions: '10',
    maxSize: '$2,500',
    signalDelay: 'Real-time',
    strategies: 'Intermediate',
    features: ['3 trading bots', '10 active positions', 'Intermediate strategies', '500 monthly credits', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Senior Quant',
    chulo: '9,000',
    price: '$90/mo',
    monthly: '$90 (9,000 CHULO)',
    quarterly: '$216 (21,600 CHULO) - Save 20%',
    maxBots: '10',
    maxPositions: '50',
    maxSize: '$10,000',
    signalDelay: 'Real-time',
    strategies: 'Advanced',
    features: ['10 trading bots', '50 active positions', 'Advanced strategies', '2,000 monthly credits', 'Advanced analytics'],
    highlight: false,
  },
  {
    name: 'Sage',
    chulo: '25,000',
    price: '$250/mo',
    monthly: '$250 (25,000 CHULO)',
    quarterly: '$450 (45,000 CHULO) - Save 40%',
    maxBots: '50',
    maxPositions: '200',
    maxSize: '$100,000',
    signalDelay: 'Real-time',
    strategies: 'All + Custom',
    features: ['50 trading bots', '200 active positions', 'All strategies + custom', '10,000 monthly credits', 'Premium 24/7 support', 'API access'],
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
            Subscribe monthly or save up to 40% with quarterly plans
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm">
            🔥 All subscriptions burn CHULO - deflationary tokenomics
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`relative rounded-xl p-6 ${
                tier.highlight
                  ? 'bg-gradient-to-br from-chulo/20 to-green-600/20 border-2 border-chulo shadow-2xl'
                  : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              } transition-all duration-300 hover:scale-105`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-slate-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                <div className="text-3xl font-bold mb-1 text-chulo-light">{tier.price}</div>
                <div className="text-sm text-gray-400 font-mono">
                  {tier.chulo} CHULO
                </div>
                {tier.quarterly && (
                  <div className="mt-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-gray-400">Quarterly Plan</div>
                    <div className="text-sm font-bold text-green-400">{tier.quarterly}</div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trading Bots</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.maxBots}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Positions</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.maxPositions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Position Size</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.maxSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Signal Delay</span>
                  <span className="font-semibold text-chulo-light font-mono">{tier.signalDelay}</span>
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

        {/* Tokenomics Note */}
        <div className="mt-16 max-w-4xl mx-auto p-6 bg-gradient-to-r from-chulo/10 to-green-600/10 border-2 border-chulo/30 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center">
            <span className="text-2xl mr-2">🔥</span>
            Deflationary Tokenomics
          </h3>
          <p className="text-gray-300 leading-relaxed">
            All subscription payments <strong className="text-chulo-light">burn CHULO tokens permanently</strong>, reducing the circulating supply from the 100M max supply.
            This creates deflationary pressure, potentially increasing token value over time. Quarterly subscriptions offer up to 40% savings!
          </p>
        </div>
      </div>
    </section>
  );
}
