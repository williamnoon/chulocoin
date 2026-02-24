const tiers = [
  {
    name: 'Observer',
    chulo: '0',
    price: 'Free',
    maxPositions: '0 (View Only)',
    gasPerDay: 'N/A',
    signalQuality: '24hr Delayed',
    features: ['25 signals/day', 'Mining enabled', 'Learn the system'],
    highlight: false,
  },
  {
    name: 'Bronze',
    chulo: '1,000',
    price: '$50',
    maxPositions: '1',
    gasPerDay: '10 CHULO',
    signalQuality: '>70% confidence',
    features: ['Real-time signals', 'Auto-execution', 'Basic strategies'],
    highlight: false,
  },
  {
    name: 'Silver',
    chulo: '5,000',
    price: '$250',
    maxPositions: '3',
    gasPerDay: '5 CHULO',
    signalQuality: '>75% confidence',
    features: ['Premium signals', 'Multi-position', 'Advanced strategies'],
    highlight: false,
  },
  {
    name: 'Gold',
    chulo: '25,000',
    price: '$1,250',
    maxPositions: '5',
    gasPerDay: '2 CHULO',
    signalQuality: '>80% confidence',
    features: ['Top-tier signals', 'Priority execution', 'All strategies'],
    highlight: true,
  },
  {
    name: 'Diamond',
    chulo: '100,000',
    price: '$5,000',
    maxPositions: 'Unlimited',
    gasPerDay: '1 CHULO',
    signalQuality: '>85% confidence',
    features: ['Elite signals', 'Instant execution', 'Custom strategies'],
    highlight: false,
  },
];

export default function TierComparison() {
  return (
    <section id="pricing" className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Tier</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hold CHULO tokens to unlock higher tiers with better signals and lower gas costs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`relative rounded-xl p-6 ${
                tier.highlight
                  ? 'bg-gradient-to-b from-chulo to-chulo-dark text-white shadow-2xl scale-105'
                  : 'bg-white shadow-lg'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-slate-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold mb-1">{tier.price}</div>
                <div className={`text-sm ${tier.highlight ? 'text-white/80' : 'text-gray-500'}`}>
                  {tier.chulo} CHULO
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className={tier.highlight ? 'text-white/80' : 'text-gray-600'}>
                    Max Positions
                  </span>
                  <span className="font-semibold">{tier.maxPositions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={tier.highlight ? 'text-white/80' : 'text-gray-600'}>
                    Gas/Day
                  </span>
                  <span className="font-semibold">{tier.gasPerDay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={tier.highlight ? 'text-white/80' : 'text-gray-600'}>
                    Signal Quality
                  </span>
                  <span className="font-semibold">{tier.signalQuality}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start text-sm">
                    <svg
                      className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        tier.highlight ? 'text-white' : 'text-chulo'
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
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  tier.highlight
                    ? 'bg-white text-chulo hover:bg-gray-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
