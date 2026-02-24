import { useWallet } from '@/hooks/useWallet';

export default function Header() {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
          <p className="text-sm text-gray-400">Monitor your trading performance</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Tier Badge */}
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-xs text-gray-400">Tier:</span>
            <span className="ml-2 text-sm font-semibold text-chulo">Observer</span>
          </div>

          {/* CHULO Balance */}
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-xs text-gray-400">CHULO:</span>
            <span className="ml-2 text-sm font-semibold text-white">0.00</span>
          </div>

          {/* Connect Wallet Button */}
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-6 py-2 bg-chulo hover:bg-chulo-dark text-white font-semibold rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
