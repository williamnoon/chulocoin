interface SignalCardProps {
  signal: {
    id: string;
    asset: string;
    direction: 'LONG' | 'SHORT';
    entry: number;
    stop: number;
    target: number;
    confidence: number;
    validatedAt?: Date | string;
    createdAt: Date | string;
  };
}

export default function SignalCard({ signal }: SignalCardProps) {
  const isLong = signal.direction === 'LONG';
  const riskReward = ((signal.target - signal.entry) / (signal.entry - signal.stop)).toFixed(2);

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-white">{signal.asset}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {signal.direction}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Confidence</div>
          <div className="text-lg font-bold text-chulo">{signal.confidence}%</div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Entry</div>
          <div className="text-lg font-semibold text-white">${signal.entry.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Stop</div>
          <div className="text-lg font-semibold text-red-400">${signal.stop.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Target</div>
          <div className="text-lg font-semibold text-green-400">
            ${signal.target.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-400">R:R</span>{' '}
            <span className="text-white font-semibold">{riskReward}</span>
          </div>
          {signal.validatedAt && (
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✓</span>
              <span className="text-gray-400">Validated</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(signal.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
