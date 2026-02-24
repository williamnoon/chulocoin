import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import TierComparison from '@/components/TierComparison';
import Download from '@/components/Download';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <HowItWorks />
      <TierComparison />
      <Download />

      {/* Footer */}
      <footer className="w-full py-8 bg-slate-950 text-white text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-400">
            © 2024 ChuloBots. Built on Arbitrum. Powered by Chainlink.
          </p>
        </div>
      </footer>
    </main>
  );
}
