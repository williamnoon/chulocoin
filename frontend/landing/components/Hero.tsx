export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-chulo/20 text-chulo-light text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse"></span>
            Powered by Chainlink & Arbitrum
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Mine Signals.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-chulo-light to-chulo">
              Earn Rewards.
            </span>
            <br />
            Trade Smarter.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The first decentralized trading signal network validated by Chainlink oracles. Generate
            signals, stake to validate, or auto-execute verified trades.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="#download"
              className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Download CLI Miner
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-chulo-light mb-2">100M</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Max Supply</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-chulo-light mb-2">5</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">User Tiers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-chulo-light mb-2">24/7</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Auto Trading</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-chulo-light mb-2">0%</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Custody Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chulo to-transparent opacity-50"></div>
    </section>
  );
}
