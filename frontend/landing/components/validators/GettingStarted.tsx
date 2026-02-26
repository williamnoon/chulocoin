export default function GettingStarted() {
  const steps = [
    {
      number: '1',
      title: 'Get CHULO',
      time: '1 hour',
      description: 'Buy 50,000 CHULO (~$15,000)',
      substeps: [
        'Option A: Buy from ChuloBots',
        'Option B: Swap on Uniswap (Arbitrum)',
      ],
    },
    {
      number: '2',
      title: 'Stake Tokens',
      time: '5 minutes',
      description: 'Lock your CHULO stake',
      substeps: [
        'Visit app.chulobots.com/stake',
        'Connect wallet',
        'Stake 50,000 CHULO',
        'Confirm transaction',
      ],
    },
    {
      number: '3',
      title: 'Rent VPS',
      time: '10 minutes',
      description: 'Get a cloud server',
      substeps: [
        'Sign up for DigitalOcean/Linode',
        'Create Ubuntu 22.04 droplet ($24/month)',
        'Note IP address',
      ],
    },
    {
      number: '4',
      title: 'Deploy Validator',
      time: '5 minutes',
      description: 'Install validator software',
      substeps: [
        'SSH into VPS',
        'Download validator software',
        'Configure .env file',
        'Run: docker-compose up -d',
      ],
    },
    {
      number: '5',
      title: 'Verify & Monitor',
      time: '2 minutes',
      description: 'Ensure everything is running',
      substeps: [
        'Check dashboard: http://YOUR_VPS_IP:3001',
        'Confirm validations happening',
        'Set up monitoring alerts',
      ],
    },
  ];

  return (
    <section id="getting-started" className="w-full py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Getting Started Guide
            </h2>
            <p className="text-xl text-gray-400 mb-6">
              Launch your validator in 5 simple steps
            </p>
            <div className="inline-block px-6 py-3 bg-chulo/20 border-2 border-chulo/40 rounded-lg">
              <div className="text-sm text-gray-400">Total Time</div>
              <div className="text-3xl font-bold text-chulo-light font-mono">~1.5 hours</div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 hover:border-chulo/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-chulo to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-black">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white mb-2 md:mb-0">{step.title}</h3>
                      <div className="inline-block px-3 py-1 bg-chulo/20 border border-chulo/40 rounded-full text-chulo-light text-sm font-mono">
                        {step.time}
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{step.description}</p>

                    <ul className="space-y-2">
                      {step.substeps.map((substep, subIndex) => (
                        <li key={subIndex} className="flex items-start text-gray-300">
                          <svg
                            className="w-5 h-5 mr-2 flex-shrink-0 text-chulo mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{substep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-chulo/10 to-green-600/10 border-2 border-chulo/40 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Earning?</h3>
            <p className="text-gray-400 mb-6">
              Download the validator software and start earning rewards immediately
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#download"
                className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5"
              >
                Download Validator Software
              </a>
              <a
                href="https://docs.chulobots.com/validators/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors duration-200"
              >
                View Full Tutorial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
