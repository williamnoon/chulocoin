const steps = [
  {
    number: '1',
    title: 'Subscribe to a Tier',
    description:
      'Burn CHULO tokens to subscribe quarterly (save up to 40%) or monthly. Get credits, real-time signals, and automated trading bots based on your tier.',
    icon: '🎯',
  },
  {
    number: '2',
    title: 'Submit Trading Signals',
    description:
      'Generate signals using your strategies and submit them to the network. Pay gas fees in CHULO (lower cost for higher tiers). Earn validation rewards.',
    icon: '📊',
  },
  {
    number: '3',
    title: 'Validators Vote',
    description:
      'Staked validators (1k-100k CHULO) vote on signal quality. Signals need 3 validator votes to reach consensus and become validated.',
    icon: '✓',
  },
  {
    number: '4',
    title: 'Auto-Execute Trades',
    description:
      'Validated signals are automatically executed by your trading bots on connected exchanges. Fully non-custodial - your keys, your funds.',
    icon: '⚡',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four steps to automated, validator-verified trading
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map(step => (
            <div key={step.number} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-chulo/10 flex items-center justify-center text-4xl">
                {step.icon}
              </div>
              <div className="inline-block px-4 py-1 rounded-full bg-chulo text-white text-sm font-bold mb-4">
                Step {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#pricing"
            className="inline-block px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Choose Your Plan
          </a>
        </div>
      </div>
    </section>
  );
}
