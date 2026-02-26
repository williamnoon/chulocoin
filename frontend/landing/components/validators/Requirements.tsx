export default function Requirements() {
  const hardware = [
    { label: 'CPU', value: '2+ cores', icon: '🖥️' },
    { label: 'RAM', value: '4GB minimum', icon: '💾' },
    { label: 'Storage', value: '50GB SSD', icon: '💿' },
    { label: 'Internet', value: '10Mbps+', icon: '🌐' },
    { label: 'Uptime', value: '95%+ required', icon: '⏱️' },
  ];

  const vpsProviders = [
    { name: 'DigitalOcean', price: '$24/month', specs: 'Droplet - 2GB RAM' },
    { name: 'Linode', price: '$24/month', specs: 'Nanode - 2GB RAM' },
    { name: 'AWS', price: '$30/month', specs: 't3.medium instance' },
    { name: 'Vultr', price: '$18/month', specs: 'Cloud Compute' },
  ];

  return (
    <section className="w-full py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Requirements
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to run a validator
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Hardware Requirements */}
            <div className="bg-slate-900 border-2 border-chulo/20 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🖥️</span>
                Hardware Requirements
              </h3>

              <div className="space-y-4">
                {hardware.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <span className="text-gray-300 font-semibold">{item.label}</span>
                    </div>
                    <span className="text-chulo-light font-mono font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="text-sm text-green-400">
                  ✓ Most modern servers meet these requirements
                </div>
              </div>
            </div>

            {/* Technical Requirements */}
            <div className="bg-slate-900 border-2 border-chulo/20 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🛠️</span>
                Technical Setup
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-chulo-light mb-3">Easy Setup - No Coding Required</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-300">
                      <span className="text-chulo mr-2">✓</span>
                      <span>Docker installed (one-line command)</span>
                    </li>
                    <li className="flex items-start text-gray-300">
                      <span className="text-chulo mr-2">✓</span>
                      <span>5 minutes to deploy</span>
                    </li>
                    <li className="flex items-start text-gray-300">
                      <span className="text-chulo mr-2">✓</span>
                      <span>Copy-paste configuration</span>
                    </li>
                    <li className="flex items-start text-gray-300">
                      <span className="text-chulo mr-2">✓</span>
                      <span>Automated updates</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-xs text-gray-500 mb-2 font-mono">Installation Preview:</div>
                  <pre className="text-xs font-mono text-chulo-light overflow-x-auto">
{`wget chulobots.com/validator.tar.gz
tar -xzf validator.tar.gz
cd validator && ./install.sh`}
                  </pre>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <div className="text-sm text-blue-400">
                    💡 If you can rent a VPS and use SSH, you can run a validator
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VPS Providers */}
          <div className="bg-slate-900 border-2 border-chulo/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">☁️</span>
              Recommended VPS Providers
            </h3>

            <div className="grid md:grid-cols-4 gap-4">
              {vpsProviders.map((provider, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-chulo/50 transition-all duration-300 hover:scale-105"
                >
                  <h4 className="text-lg font-bold text-white mb-2">{provider.name}</h4>
                  <div className="text-2xl font-bold text-chulo-light mb-2 font-mono">
                    {provider.price}
                  </div>
                  <div className="text-sm text-gray-400">{provider.specs}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-gray-400">
                <span className="text-gray-300 font-semibold">Operating Costs:</span> ~$74/month (VPS $24 + RPC APIs $50)
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4">Initial Investment (Junior Quant)</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>50,000 CHULO Stake</span>
                  <span className="font-mono text-white">$15,000</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>VPS (first month)</span>
                  <span className="font-mono text-white">$24</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>RPC APIs (first month)</span>
                  <span className="font-mono text-white">$50</span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-slate-700 pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono text-chulo-light font-bold text-xl">$15,074</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-chulo/10 border border-chulo/30 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4">Monthly Profit (Junior Quant)</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Gross Revenue</span>
                  <span className="font-mono text-white">$4,275</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Operating Costs</span>
                  <span className="font-mono text-red-400">-$74</span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-chulo/30 pt-3">
                  <span className="font-semibold">Net Profit</span>
                  <span className="font-mono text-chulo-light font-bold text-xl">$4,201</span>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Break-even in ~3.6 months
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
