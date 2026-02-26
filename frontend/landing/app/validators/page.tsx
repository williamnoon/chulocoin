import type { Metadata } from 'next';
import ValidatorHero from '@/components/validators/ValidatorHero';
import NetworkStats from '@/components/validators/NetworkStats';
import ValidatorHowItWorks from '@/components/validators/ValidatorHowItWorks';
import ROICalculator from '@/components/validators/ROICalculator';
import ValidatorTiers from '@/components/validators/ValidatorTiers';
import Requirements from '@/components/validators/Requirements';
import Benefits from '@/components/validators/Benefits';
import Testimonials from '@/components/validators/Testimonials';
import FAQ from '@/components/validators/FAQ';
import GettingStarted from '@/components/validators/GettingStarted';

export const metadata: Metadata = {
  title: 'Become a ChuloBots Validator | Earn Up to $4,275/month',
  description:
    'Run a ChuloBots validator node and earn passive income by verifying trading signals. Easy setup, no coding required. Start earning in 1 hour.',
  keywords: [
    'ChuloBots validator',
    'passive income crypto',
    'validator node',
    'staking rewards',
    'earn CHULO',
    'crypto validator',
    'DeFi validator',
  ],
};

export default function ValidatorsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      {/* Navigation */}
      <nav className="w-full py-4 px-4 bg-slate-950/80 backdrop-blur-sm border-b border-chulo/20 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-chulo-light font-mono">ChuloBots</span>
          </a>
          <div className="flex items-center gap-6">
            <a
              href="#calculator"
              className="text-gray-300 hover:text-chulo-light transition-colors"
            >
              Calculator
            </a>
            <a
              href="#getting-started"
              className="text-gray-300 hover:text-chulo-light transition-colors"
            >
              Guide
            </a>
            <a
              href="https://docs.chulobots.com/validators"
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

      {/* Hero Section */}
      <ValidatorHero />

      {/* Network Stats */}
      <NetworkStats />

      {/* How It Works */}
      <ValidatorHowItWorks />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Validator Tiers */}
      <ValidatorTiers />

      {/* Requirements */}
      <Requirements />

      {/* Benefits */}
      <Benefits />

      {/* Testimonials */}
      <Testimonials />

      {/* Getting Started */}
      <GettingStarted />

      {/* FAQ */}
      <FAQ />

      {/* Download Section */}
      <section id="download" className="w-full py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Download Validator Software
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Latest version: v1.0.0 - All platforms supported
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-800 border-2 border-chulo/20 rounded-lg p-6 hover:border-chulo transition-all duration-300">
                <div className="text-4xl mb-4">🐧</div>
                <h3 className="text-xl font-bold text-white mb-2">Linux</h3>
                <p className="text-gray-400 text-sm mb-4">Ubuntu, Debian, CentOS</p>
                <button className="w-full py-2 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors">
                  Download .tar.gz
                </button>
              </div>

              <div className="bg-slate-800 border-2 border-chulo/20 rounded-lg p-6 hover:border-chulo transition-all duration-300">
                <div className="text-4xl mb-4">🍎</div>
                <h3 className="text-xl font-bold text-white mb-2">macOS</h3>
                <p className="text-gray-400 text-sm mb-4">Intel & Apple Silicon</p>
                <button className="w-full py-2 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors">
                  Download .dmg
                </button>
              </div>

              <div className="bg-slate-800 border-2 border-chulo/20 rounded-lg p-6 hover:border-chulo transition-all duration-300">
                <div className="text-4xl mb-4">🪟</div>
                <h3 className="text-xl font-bold text-white mb-2">Windows</h3>
                <p className="text-gray-400 text-sm mb-4">Windows 10/11</p>
                <button className="w-full py-2 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors">
                  Download .exe
                </button>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-2">Quick Install (Linux/macOS)</div>
              <pre className="text-left bg-slate-900 p-4 rounded-lg text-sm font-mono text-chulo-light overflow-x-auto">
                {`curl -sSL https://chulobots.com/install.sh | bash`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 bg-slate-950 border-t border-chulo/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure the Network and Earn Rewards?
          </h2>
          <p className="text-gray-400 mb-8">Join 87 validators earning passive income 24/7</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#download"
              className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50"
            >
              Start Validating Now
            </a>
            <a
              href="https://discord.gg/chulobots"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors duration-200"
            >
              Join Discord Community
            </a>
          </div>
        </div>
      </section>

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
                    href="https://app.chulobots.com/network"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Network Stats
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
                    href="https://docs.chulobots.com/validators"
                    className="hover:text-chulo-light transition-colors"
                  >
                    Validator Guide
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
