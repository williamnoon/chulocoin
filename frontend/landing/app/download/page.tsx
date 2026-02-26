import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Download from '@/components/Download';

export default function DownloadPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="w-full bg-gradient-to-b from-black to-slate-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-chulo/20 text-chulo-light text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse"></span>
              DOWNLOAD CENTER
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Download ChuloBots CLI</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started with the ChuloBots command-line interface for signal submission,
              validation, and automated trading.
            </p>
          </div>
        </div>
      </section>

      <Download />

      {/* Quick Start Guide */}
      <section className="w-full py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Quick Start Guide
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-6 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-chulo rounded-full flex items-center justify-center text-black font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Install the CLI</h3>
                    <p className="text-gray-400 mb-3">Download and install for your platform:</p>
                    <div className="bg-black p-4 rounded-lg font-mono text-sm text-chulo-light">
                      npm install -g @chulobots/cli
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-chulo rounded-full flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400 mb-3">Initialize and connect your wallet:</p>
                    <div className="bg-black p-4 rounded-lg font-mono text-sm text-chulo-light">
                      chulo init
                      <br />
                      chulo wallet connect
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-chulo rounded-full flex items-center justify-center text-black font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Subscribe to a Tier</h3>
                    <p className="text-gray-400 mb-3">Choose your subscription tier:</p>
                    <div className="bg-black p-4 rounded-lg font-mono text-sm text-chulo-light">
                      chulo subscribe --tier junior-quant --period quarterly
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-chulo rounded-full flex items-center justify-center text-black font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Start Trading</h3>
                    <p className="text-gray-400 mb-3">
                      Submit signals or run automated trading bots:
                    </p>
                    <div className="bg-black p-4 rounded-lg font-mono text-sm text-chulo-light">
                      chulo signal submit --asset BTC --direction LONG
                      <br />
                      chulo bot start --strategy trend-following
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation CTA */}
      <section className="w-full py-20 bg-gradient-to-r from-slate-950 via-chulo/5 to-slate-950 border-y border-chulo/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Need Help?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Check out our comprehensive documentation for detailed guides and API references.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.chulobots.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5"
              >
                View Documentation
              </a>
              <a
                href="https://discord.gg/chulobots"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
