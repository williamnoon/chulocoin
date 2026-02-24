# ChuloBots Strategy Engine

Python-based trading strategy framework with backtesting capabilities.

## Features

- Abstract base strategy class for consistent strategy development
- Walk-forward analysis for robust strategy validation
- Monte Carlo simulation for risk assessment
- Realistic fee and slippage modeling
- Performance metrics (Sharpe ratio, win rate, drawdown)

## Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install TA-Lib (may require system dependencies)
# macOS: brew install ta-lib
# Ubuntu: sudo apt-get install ta-lib
```

## Project Structure

```
strategies/
├── base_strategy.py      # Abstract base class
├── strategies/           # Concrete strategy implementations
│   ├── bull_flag.py
│   ├── rsi_oversold.py
│   └── ...
├── backtesting/          # Backtesting engine
│   ├── engine.py
│   ├── walk_forward.py
│   └── monte_carlo.py
├── data/                 # Historical price data
└── tests/                # Unit tests
```

## Usage

### Creating a Strategy

```python
from base_strategy import BaseStrategy

class MyStrategy(BaseStrategy):
    def regime_filter(self, data):
        # Implement market regime logic
        pass

    def setup_detected(self, data):
        # Detect trading setup
        pass

    def entry_trigger(self, data):
        # Entry conditions
        pass

    # ... implement other required methods
```

### Running a Backtest

```python
from backtesting.engine import BacktestEngine
from strategies.bull_flag import BullFlagStrategy

# Initialize strategy
strategy = BullFlagStrategy()

# Run backtest
engine = BacktestEngine(strategy, data)
results = engine.run()

print(f"Sharpe Ratio: {results['sharpe']}")
print(f"Win Rate: {results['win_rate']}%")
```

## Pre-Built Strategies

1. **Bull Flag Continuation**: Trend-following breakout strategy
2. **RSI Oversold Mean Reversion**: Contrarian strategy on oversold conditions
3. **Liquidity Sweep**: Catches false breakouts and reversals
4. **Volatility Breakout**: Trades compression/expansion cycles
5. **Momentum Ranking**: Cross-sectional momentum strategy

## Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_strategies.py
```

## Backtesting Engine

The backtesting engine includes:
- **Walk-forward analysis**: 12-month training, 3-month testing
- **Monte Carlo simulation**: 10,000 runs for robustness
- **Realistic costs**: Trading fees, slippage, and funding rates
- **Performance metrics**: Sharpe, Sortino, max drawdown, win rate

## Quality Scoring

Strategies are scored on:
- Sharpe ratio (> 1.5 preferred)
- Win rate (> 50% preferred)
- Max drawdown (< 20% preferred)
- Profit factor (> 1.5 preferred)
- Consistency across walk-forward periods
