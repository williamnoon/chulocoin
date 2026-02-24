# ChuloBots Bot Executor

Automated trading execution service for ChuloBots signals.

## Features

- **Exchange Integrations**: Hyperliquid (primary), Binance, Coinbase, etc.
- **Job Queue**: BullMQ for reliable signal processing
- **Position Management**: Automatic entry, stop loss, and take profit
- **Risk Management**: Position sizing and daily loss limits
- **Real-time Monitoring**: Track positions until close

## Architecture

```
bot-executor/
├── src/
│   ├── executors/      # Exchange-specific implementations
│   │   ├── base.ts     # Abstract base executor
│   │   ├── hyperliquid.ts
│   │   ├── binance.ts
│   │   └── coinbase.ts
│   ├── services/       # Core services
│   │   ├── signalProcessor.ts
│   │   ├── positionManager.ts
│   │   └── riskManager.ts
│   ├── workers/        # Background workers
│   │   ├── signalWorker.ts
│   │   └── positionWorker.ts
│   └── index.ts        # Entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Redis (for job queue)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp ../.env.example .env
# Add exchange API keys

# Start development
npm run dev

# Start worker
npm run worker
```

## Usage

### Adding a Signal for Execution

```typescript
import { enqueueSignal } from './services/signalProcessor';

await enqueueSignal({
  signalId: 'sig_123',
  asset: 'BTC',
  direction: 'LONG',
  entry: 50000,
  stop: 48000,
  target: 55000,
  confidence: 85,
  userId: 'user_xyz',
  exchange: 'hyperliquid',
});
```

### Implementing a New Exchange

1. Extend `BaseExecutor` class
2. Implement required methods
3. Add exchange configuration
4. Register in executor factory

```typescript
import { BaseExecutor } from './executors/base';

export class MyExchangeExecutor extends BaseExecutor {
  constructor(config: ExecutorConfig) {
    super('MyExchange', config);
  }

  async executeMarketOrder(params: OrderParams): Promise<Order> {
    // Implementation
  }

  // ... implement other methods
}
```

## Signal Processing Flow

1. Signal validated by network
2. Added to BullMQ queue
3. Worker picks up job
4. Check user tier and preferences
5. Calculate position size
6. Execute on exchange
7. Set stop loss and take profit
8. Monitor until close

## Configuration

Environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
HYPERLIQUID_API_KEY=your_key
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
```

## Production Deployment

```bash
# Build
npm run build

# Start main service
npm start

# Start workers (separate process)
npm run worker
```

## Exchange Integration Status

- ✅ Hyperliquid: Stub implementation ready
- ⏳ Binance: To be implemented
- ⏳ Coinbase: To be implemented
- ⏳ Kraken: To be implemented

## Testing

```bash
# Run tests
npm test

# Test with specific exchange
npm run test:hyperliquid
```

## Security

- API keys encrypted at rest
- Non-custodial (user keys, not deposits)
- Rate limiting per exchange
- Position size limits
- Daily loss limits
