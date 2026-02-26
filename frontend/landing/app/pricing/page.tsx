import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TierComparison from '@/components/TierComparison';

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="w-full bg-gradient-to-b from-black to-slate-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-chulo/20 text-chulo-light text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-chulo-light rounded-full mr-2 animate-pulse"></span>
              SUBSCRIPTION PLANS
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your Trading Tier
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Subscribe quarterly to save up to 40%. All subscriptions burn CHULO tokens
              permanently, creating deflationary pressure.
            </p>
          </div>
        </div>
      </section>

      <TierComparison />

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-slate-950 via-chulo/5 to-slate-950 border-y border-chulo/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Launch the app and connect your wallet to subscribe to any tier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://app.chulobots.com"
                className="px-8 py-4 bg-chulo hover:bg-chulo-dark text-black font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-chulo/50 transform hover:-translate-y-0.5"
              >
                Launch App
              </a>
              <a
                href="/how-it-works"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
