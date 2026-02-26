import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import TierComparison from '@/components/TierComparison';
import Download from '@/components/Download';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="w-full py-4 px-4 bg-slate-950/80 backdrop-blur-sm border-b border-chulo/20 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-chulo-light font-mono">ChuloBots</span>
          </a>
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-chulo-light transition-colors"
            >
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-chulo-light transition-colors">
              Pricing
            </a>
            <a
              href="/validators"
              className="text-gray-300 hover:text-chulo-light transition-colors"
            >
              Become a Validator
            </a>
            <a
              href="https://docs.chulobots.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-chulo-light transition-colors"
            >
              Docs
            </a>
            <a
              href="#download"
              className="px-4 py-2 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      </nav>

      <Hero />
      <HowItWorks />
      <TierComparison />

      {/* Validator CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-slate-900 via-chulo/5 to-slate-900 border-y border-chulo/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-chulo/20 border border-chulo/30 text-chulo-light text-sm font-mono mb-6">
              <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse inline-block"></span>
              EARN AS A VALIDATOR
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stake CHULO, Validate Signals, Earn Rewards
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Stake 1,000-100,000 CHULO to become a validator. Earn 0.25 CHULO per validation plus
              weekly burn pool distribution. Help secure the network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="/validators"
                className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5"
              >
                Become a Validator
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-1 font-mono">0.25</div>
                <div className="text-sm text-gray-400">CHULO per Validation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-1 font-mono">1k-100k</div>
                <div className="text-sm text-gray-400">CHULO Stake Range</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-chulo-light mb-1 font-mono">Weekly</div>
                <div className="text-sm text-gray-400">Burn Pool Distribution</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Download />

      {/* Footer */}
      <footer className="w-full py-12 bg-slate-950 border-t border-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-chulo-light font-mono mb-4">ChuloBots</h3>
              <p className="text-gray-400 text-sm">
                Decentralized trading signal network powered by Chainlink oracles.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/" className="hover:text-chulo-light transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/validators" className="hover:text-chulo-light transition-colors">
                    Become a Validator
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.chulobots.com"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.chulobots.com"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Launch App
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="https://docs.chulobots.com"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://medium.com/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-chulo-light transition-colors">
                    Whitepaper
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="https://discord.gg/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/chulobots"
                    className="hover:text-chulo-light transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            <p>© 2026 ChuloBots. Built on Arbitrum. Powered by Chainlink.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-chulo-light transition-colors">
                Terms of Service
              </a>
              {' • '}
              <a href="#" className="hover:text-chulo-light transition-colors">
                Privacy Policy
              </a>
              {' • '}
              <a href="#" className="hover:text-chulo-light transition-colors">
                Risk Disclosures
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
