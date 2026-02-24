"""
Run backtest on Bull Flag strategy with sample or live data.

Usage:
    python run_backtest.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from strategies.bull_flag import BullFlagStrategy
from backtesting.engine import BacktestEngine
from backtesting.walk_forward import WalkForwardAnalysis


def generate_sample_data(days: int = 365) -> pd.DataFrame:
    """
    Generate sample OHLCV data for testing.

    In production, this would load real historical data from an exchange API.
    """
    print("Generating sample price data...")

    dates = pd.date_range(end=datetime.now(), periods=days, freq="D")

    # Generate somewhat realistic price action
    np.random.seed(42)

    # Start price
    start_price = 50000

    # Random walk with trend
    returns = np.random.normal(0.001, 0.02, days)  # Slight upward bias
    prices = start_price * np.exp(np.cumsum(returns))

    # Generate OHLCV
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # Generate high/low around close
        volatility = close * 0.02  # 2% daily volatility
        high = close + np.random.uniform(0, volatility)
        low = close - np.random.uniform(0, volatility)
        open_price = (high + low) / 2

        # Ensure OHLC relationships are valid
        high = max(high, open_price, close)
        low = min(low, open_price, close)

        # Volume
        volume = np.random.uniform(1000, 5000)

        data.append(
            {
                "open": open_price,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
            }
        )

    df = pd.DataFrame(data, index=dates)
    print(f"Generated {len(df)} days of data")
    print(f"Price range: ${df['close'].min():.2f} - ${df['close'].max():.2f}")

    return df


def run_simple_backtest():
    """Run a simple backtest on Bull Flag strategy."""
    print("\n" + "=" * 70)
    print("BULL FLAG STRATEGY BACKTEST")
    print("=" * 70 + "\n")

    # Generate or load data
    data = generate_sample_data(days=500)

    # Initialize strategy
    strategy = BullFlagStrategy(
        params={
            "flagpole_min_move": 8.0,  # 8% minimum flagpole move
            "flag_max_duration": 15,  # 15 candles max for flag
            "flag_max_retrace": 50.0,  # 50% max retracement
            "risk_per_trade": 2.0,  # Risk 2% per trade
        }
    )

    # Run backtest
    engine = BacktestEngine(
        strategy=strategy,
        data=data,
        initial_capital=10000.0,
        fee_rate=0.001,  # 0.1% fees
        slippage=0.0005,  # 0.05% slippage
    )

    results = engine.run()

    # Display detailed results
    print("\nDetailed Metrics:")
    print(f"  Winning Trades: {results['winning_trades']}")
    print(f"  Losing Trades: {results['losing_trades']}")
    print(f"  Average Win: ${results['avg_win']:.2f}")
    print(f"  Average Loss: ${results['avg_loss']:.2f}")
    print(f"  Gross Profit: ${results['gross_profit']:.2f}")
    print(f"  Gross Loss: ${results['gross_loss']:.2f}")
    print(f"  Final Balance: ${results['final_balance']:.2f}")

    # Show some example trades
    if len(results["trades"]) > 0:
        print("\nFirst 5 Trades:")
        trades_df = pd.DataFrame(results["trades"])
        print(trades_df.head()[["entry_time", "direction", "pnl", "pnl_percent", "exit_reason"]])

    return results


def run_walk_forward():
    """Run walk-forward analysis."""
    print("\n" + "=" * 70)
    print("WALK-FORWARD ANALYSIS")
    print("=" * 70 + "\n")

    # Generate longer dataset for walk-forward
    data = generate_sample_data(days=730)  # 2 years

    # Parameter grid to optimize
    param_grid = {
        "flagpole_min_move": [7.0, 10.0, 12.0],
        "risk_per_trade": [1.0, 2.0, 3.0],
        "flag_max_duration": [10, 15, 20],
    }

    # Run walk-forward
    wfa = WalkForwardAnalysis(
        strategy_class=BullFlagStrategy,
        data=data,
        train_months=12,  # 12 months training
        test_months=3,  # 3 months testing
        initial_capital=10000.0,
    )

    summary = wfa.run(param_grid=param_grid)

    return summary


if __name__ == "__main__":
    import sys

    print("\nChuloBots Strategy Backtesting")
    print("=" * 70)

    # Run simple backtest
    print("\n1. Running Simple Backtest...")
    backtest_results = run_simple_backtest()

    # Optionally run walk-forward (commented out for speed)
    # print("\n2. Running Walk-Forward Analysis...")
    # wf_results = run_walk_forward()

    print("\n" + "=" * 70)
    print("BACKTEST COMPLETE")
    print("=" * 70)

    # Strategy quality assessment
    sharpe = backtest_results["sharpe_ratio"]
    win_rate = backtest_results["win_rate"]
    drawdown = backtest_results["max_drawdown"]

    print("\nStrategy Quality Assessment:")
    print(f"  Sharpe Ratio: {sharpe:.2f} {'✓ (>1.5)' if sharpe > 1.5 else '✗ (<1.5)'}")
    print(f"  Win Rate: {win_rate:.1f}% {'✓ (>50%)' if win_rate > 50 else '✗ (<50%)'}")
    print(
        f"  Max Drawdown: {drawdown:.1f}% {'✓ (<20%)' if drawdown > -20 else '✗ (>20%)'}"
    )

    # Overall rating
    passed = sharpe > 1.5 and win_rate > 50 and drawdown > -20
    print(f"\nOverall: {'PASS ✓' if passed else 'NEEDS IMPROVEMENT'}")

    print("\n💡 Note: This backtest uses synthetic data.")
    print("   For production, replace with real historical data from exchange APIs.")
