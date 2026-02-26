export default function Benefits() {
  const benefits = [
    {
      icon: '🔒',
      title: 'Low Risk',
      color: 'blue',
      items: [
        'Non-custodial (you control your stake)',
        'Can unstake anytime (7-day cooldown)',
        'Transparent smart contracts (audited)',
        'Slashing only for misbehavior (<1% penalty)',
      ],
    },
    {
      icon: '💼',
      title: 'Passive Income',
      color: 'green',
      items: [
        '24/7 automated validation',
        'No manual intervention required',
        'Set it and forget it',
        'Compound earnings by reinvesting',
      ],
    },
    {
      icon: '📈',
      title: 'Growth Potential',
      color: 'yellow',
      items: [
        'CHULO price appreciation upside',
        'Network growth = more validations',
        'Early validator advantages',
        'Governance voting rights',
      ],
    },
    {
      icon: '🌍',
      title: 'Decentralization',
      color: 'purple',
      items: [
        'Help secure the network',
        'No single point of failure',
        'Contribute to Web3 infrastructure',
        'Join a global community',
      ],
    },
  ];

  const colorClasses = {
    blue: 'from-blue-900/20 to-blue-600/10 border-blue-700/30',
    green: 'from-green-900/20 to-green-600/10 border-green-700/30',
    yellow: 'from-yellow-900/20 to-yellow-600/10 border-yellow-700/30',
    purple: 'from-purple-900/20 to-purple-600/10 border-purple-700/30',
  };

  return (
    <section className="w-full py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Become a Validator?
            </h2>
            <p className="text-xl text-gray-400">
              More than just passive income
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${colorClasses[benefit.color as keyof typeof colorClasses]} border-2 rounded-lg p-8 hover:scale-105 transition-all duration-300`}
              >
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className="text-5xl mr-4">{benefit.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{benefit.title}</h3>
                </div>

                {/* Items */}
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 flex-shrink-0 text-chulo-light mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Security Highlight */}
          <div className="mt-12 bg-gradient-to-r from-chulo/10 to-green-600/10 border-2 border-chulo/30 rounded-lg p-8">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-2 font-mono">$4.2M</div>
                <div className="text-sm text-gray-400">Total Value Staked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-2 font-mono">99.8%</div>
                <div className="text-sm text-gray-400">Network Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-2 font-mono">0</div>
                <div className="text-sm text-gray-400">Major Incidents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-2 font-mono">87</div>
                <div className="text-sm text-gray-400">Active Validators</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
