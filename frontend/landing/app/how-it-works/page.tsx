import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';

export default function HowItWorksPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="w-full bg-gradient-to-b from-black to-slate-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-chulo/20 text-chulo-light text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse"></span>
              PLATFORM OVERVIEW
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How ChuloBots Works
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A decentralized trading signal network with validator consensus, automated execution,
              and deflationary tokenomics.
            </p>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Architecture Section */}
      <section className="w-full py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Platform Architecture
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Smart Contracts */}
              <div className="p-8 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Contracts</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>CHULO Token:</strong> ERC-20 with 100M max supply, burnable for gas
                      payments
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>SignalRegistry:</strong> Submit signals, validator voting, 3-vote
                      consensus
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>ValidatorStaking:</strong> 1k-100k CHULO stake, earn 0.25 per
                      validation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>TierSubscription:</strong> Burn CHULO for access, NFT badges,
                      credits system
                    </span>
                  </li>
                </ul>
              </div>

              {/* Off-Chain Components */}
              <div className="p-8 bg-slate-900 border-2 border-chulo/20 rounded-xl">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Off-Chain Services</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>Bot Executor:</strong> Auto-executes validated signals on connected
                      exchanges
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>Validator Nodes:</strong> Run validation logic, vote on signals,
                      earn rewards
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>Backend API:</strong> Manages user data, positions, signal metadata
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-chulo mr-2">•</span>
                    <span>
                      <strong>WebSocket:</strong> Real-time signal updates, position tracking
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-slate-950 via-chulo/5 to-slate-950 border-y border-chulo/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/pricing"
                className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5"
              >
                View Pricing
              </a>
              <a
                href="/validators"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Become a Validator
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
