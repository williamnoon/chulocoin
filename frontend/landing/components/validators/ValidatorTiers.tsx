const tiers = [
  {
    name: 'Observer',
    subtitle: 'Entry Level',
    stake: '10,000',
    price: '~$3,000',
    validationsPerDay: '100',
    burnPoolShare: '0%',
    monthlyRevenue: '~$525',
    features: [
      '100 validations per day max',
      '0.25 CHULO per validation',
      'No burn pool share',
      'Community support',
    ],
    highlight: false,
    recommended: false,
    bestFor: 'Testing validator operations',
  },
  {
    name: 'Junior Quant',
    subtitle: 'Professional',
    stake: '50,000',
    price: '~$15,000',
    validationsPerDay: '500',
    burnPoolShare: '2%',
    monthlyRevenue: '~$4,275',
    features: [
      '500 validations per day max',
      '0.25 CHULO per validation',
      '2% burn pool share',
      'Priority support',
      'Governance voting rights',
    ],
    highlight: true,
    recommended: true,
    bestFor: 'Serious validator operators',
  },
  {
    name: 'Senior Quant',
    subtitle: 'Elite',
    stake: '200,000',
    price: '~$60,000',
    validationsPerDay: 'Unlimited',
    burnPoolShare: '5%',
    monthlyRevenue: '~$25,650',
    features: [
      'Unlimited validations',
      '0.25 CHULO per validation',
      '5% burn pool share',
      'Premium support',
      'Early access to features',
      'Enhanced governance rights',
    ],
    highlight: false,
    recommended: false,
    bestFor: 'Professional operators with multiple nodes',
  },
];

export default function ValidatorTiers() {
  return (
    <section className="w-full py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Validator Tiers</h2>
            <p className="text-xl text-gray-400">Choose the tier that fits your investment goals</p>
          </div>

          {/* Tier Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative rounded-xl p-8 transition-all duration-300 hover:scale-105 ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-chulo/20 to-green-600/20 border-2 border-chulo shadow-2xl shadow-chulo/30'
                    : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Recommended Badge */}
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full shadow-lg z-10">
                    ⭐ RECOMMENDED
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                  <div
                    className={`text-sm ${tier.highlight ? 'text-chulo-light' : 'text-gray-400'} mb-4`}
                  >
                    {tier.subtitle}
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold text-chulo-light font-mono">
                      {tier.stake}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">CHULO</span>
                  </div>
                  <div className="text-gray-500 text-sm">{tier.price}</div>
                </div>

                {/* Key Stats */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Max Validations/Day</span>
                    <span className="text-white font-semibold font-mono">
                      {tier.validationsPerDay}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Burn Pool Share</span>
                    <span className="text-white font-semibold font-mono">{tier.burnPoolShare}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-gray-400 text-sm font-semibold">Monthly Revenue*</span>
                    <span className="text-chulo-light font-bold text-lg font-mono">
                      {tier.monthlyRevenue}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start text-sm">
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

                {/* Best For */}
                <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="text-xs text-gray-500 mb-1">BEST FOR</div>
                  <div className="text-sm text-gray-300">{tier.bestFor}</div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    tier.highlight
                      ? 'bg-chulo hover:bg-chulo-dark text-black shadow-lg hover:shadow-xl'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  Select Tier
                </button>
              </div>
            ))}
          </div>

          {/* Footnote */}
          <div className="mt-8 text-center text-sm text-gray-500">
            * Revenue estimates based on CHULO price of $0.30. Actual earnings may vary.
          </div>
        </div>
      </div>
    </section>
  );
}
