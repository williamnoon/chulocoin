import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />
      <Hero />

      {/* Quick Links Section */}
      <section className="w-full py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
              Get Started with ChuloBots
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Traders */}
              <a
                href="/pricing"
                className="p-8 bg-slate-900 border-2 border-slate-800 hover:border-chulo rounded-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-chulo-light transition-colors">
                  For Traders
                </h3>
                <p className="text-gray-400 mb-4">
                  Subscribe to access real-time validated signals, automated trading bots, and
                  professional strategies.
                </p>
                <div className="text-chulo-light font-semibold">
                  View Pricing →
                </div>
              </a>

              {/* Validators */}
              <a
                href="/validators"
                className="p-8 bg-slate-900 border-2 border-slate-800 hover:border-chulo rounded-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-chulo-light transition-colors">
                  For Validators
                </h3>
                <p className="text-gray-400 mb-4">
                  Stake CHULO, validate trading signals, and earn 0.25 CHULO per validation plus
                  weekly burn pool rewards.
                </p>
                <div className="text-chulo-light font-semibold">
                  Become a Validator →
                </div>
              </a>

              {/* Developers */}
              <a
                href="/how-it-works"
                className="p-8 bg-slate-900 border-2 border-slate-800 hover:border-chulo rounded-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-5xl mb-4">🔧</div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-chulo-light transition-colors">
                  How It Works
                </h3>
                <p className="text-gray-400 mb-4">
                  Learn how our decentralized signal validation network works and how you can
                  participate.
                </p>
                <div className="text-chulo-light font-semibold">
                  Learn More →
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
