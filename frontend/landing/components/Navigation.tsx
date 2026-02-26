export default function Navigation() {
  return (
    <nav className="w-full py-4 px-4 bg-slate-950/80 backdrop-blur-sm border-b border-chulo/20 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-2xl font-bold text-chulo-light font-mono">ChuloBots</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/how-it-works" className="text-gray-300 hover:text-chulo-light transition-colors">
            How It Works
          </a>
          <a href="/pricing" className="text-gray-300 hover:text-chulo-light transition-colors">
            Pricing
          </a>
          <a href="/validators" className="text-gray-300 hover:text-chulo-light transition-colors">
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
            href="/download"
            className="px-4 py-2 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </nav>
  );
}
