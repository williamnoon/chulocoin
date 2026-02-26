export default function ValidatorHowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Stake CHULO',
      description: 'Lock 50,000 CHULO tokens to become a Junior Quant validator',
      icon: '🔒',
      time: '5 minutes',
    },
    {
      number: '2',
      title: 'Run Node',
      description: 'Deploy validator software on a VPS with one command',
      icon: '⚙️',
      time: '5 minutes',
    },
    {
      number: '3',
      title: 'Verify Signals',
      description: 'Your node automatically validates trading signals via consensus',
      icon: '✓',
      time: 'Automatic',
    },
    {
      number: '4',
      title: 'Earn Rewards',
      description: 'Get 0.25 CHULO per validation + 2% of network burn pool',
      icon: '💰',
      time: '24/7',
    },
  ];

  return (
    <section className="w-full py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Start earning in 4 simple steps
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-chulo/20 via-chulo to-chulo/20 -translate-y-1/2"></div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className="bg-slate-900 border-2 border-chulo/30 rounded-lg p-6 hover:border-chulo transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-chulo/20 relative z-10">
                    {/* Step Number */}
                    <div className="w-12 h-12 bg-gradient-to-br from-chulo to-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-black mb-4 shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="text-4xl mb-4">{step.icon}</div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div className="inline-block px-3 py-1 bg-chulo/20 border border-chulo/40 rounded-full text-chulo-light text-xs font-mono">
                      {step.time}
                    </div>
                  </div>

                  {/* Mobile Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-4">
                      <div className="w-1 h-8 bg-gradient-to-b from-chulo to-chulo/20"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Time */}
          <div className="mt-12 text-center">
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-chulo/20 to-green-600/20 border-2 border-chulo/40 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Total Setup Time</div>
              <div className="text-3xl font-bold text-chulo-light font-mono">~15 Minutes</div>
              <div className="text-xs text-gray-500 mt-1">Start earning immediately</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
