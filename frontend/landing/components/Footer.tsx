export default function Footer() {
  return (
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
                <a href="/pricing" className="hover:text-chulo-light transition-colors">
                  Pricing
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
  );
}
