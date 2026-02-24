const steps = [
  {
    number: '1',
    title: 'Mine Signals',
    description:
      'Download the CLI tool and run trading strategies to generate signals. Earn CHULO rewards when your signals are validated.',
    icon: '⛏️',
  },
  {
    number: '2',
    title: 'Validators Verify',
    description:
      'Staked validators check signal quality using Chainlink oracles. Signals need >66% consensus to pass.',
    icon: '✓',
  },
  {
    number: '3',
    title: 'Auto-Execute',
    description:
      'Validated signals are automatically executed on your exchange account based on your tier and preferences. Non-custodial.',
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
            Three simple steps to decentralized trading signals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
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
            href="#download"
            className="inline-block px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Start Mining Now
          </a>
        </div>
      </div>
    </section>
  );
}
