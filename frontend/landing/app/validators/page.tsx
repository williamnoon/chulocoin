import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
  title: 'Become a ChuloBots Validator | Earn CHULO Rewards',
  description:
    'Run a ChuloBots validator node and earn passive income by verifying trading signals. Stake 1k-100k CHULO, earn 0.25 CHULO per validation plus weekly burn pool rewards. Easy setup, no coding required.',
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
      <Navigation />

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
      <section
        id="download"
        className="w-full py-20 bg-gradient-to-b from-slate-900 to-slate-950"
      >
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
          <p className="text-gray-400 mb-8">
            Join validators earning passive income 24/7
          </p>
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

      <Footer />
    </main>
  );
}
