export default function Download() {
  return (
    <section id="download" className="w-full py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Download CLI Miner</h2>
          <p className="text-xl text-gray-300 mb-12">
            Start mining signals and earning CHULO rewards. Available for macOS, Linux, and Windows.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <a
              href="#"
              className="p-8 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors duration-200 group"
            >
              <div className="text-5xl mb-4"></div>
              <h3 className="text-xl font-bold mb-2">macOS</h3>
              <p className="text-gray-400 text-sm mb-4">Apple Silicon & Intel</p>
              <div className="text-chulo group-hover:text-chulo-light font-semibold">
                Download →
              </div>
            </a>

            <a
              href="#"
              className="p-8 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors duration-200 group"
            >
              <div className="text-5xl mb-4">🐧</div>
              <h3 className="text-xl font-bold mb-2">Linux</h3>
              <p className="text-gray-400 text-sm mb-4">x64 & ARM64</p>
              <div className="text-chulo group-hover:text-chulo-light font-semibold">
                Download →
              </div>
            </a>

            <a
              href="#"
              className="p-8 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors duration-200 group"
            >
              <div className="text-5xl mb-4">🪟</div>
              <h3 className="text-xl font-bold mb-2">Windows</h3>
              <p className="text-gray-400 text-sm mb-4">x64</p>
              <div className="text-chulo group-hover:text-chulo-light font-semibold">
                Download →
              </div>
            </a>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 text-left">
            <h3 className="text-xl font-bold mb-4">Quick Start</h3>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-gray-400"># Install ChuloBots CLI</div>
              <div className="text-chulo-light">curl -fsSL https://get.chulobots.com | sh</div>
              <div className="mt-4 text-gray-400"># Start mining</div>
              <div className="text-chulo-light">chulobots mine --wallet YOUR_WALLET_ADDRESS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
