export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Overview of your trading activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Positions" value="0" icon="💼" />
        <StatCard title="Total Trades" value="0" icon="📈" />
        <StatCard title="Win Rate" value="0%" icon="🎯" />
        <StatCard title="Total P&L" value="$0.00" icon="💰" change="+0%" />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Signals</h3>
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📡</p>
          <p>No signals yet</p>
          <p className="text-sm mt-2">Connect your wallet to start receiving signals</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  change,
}: {
  title: string;
  value: string;
  icon: string;
  change?: string;
}) {
  return (
    <div className="bg-slate-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        {change && (
          <span
            className={`text-sm font-semibold ${
              change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
