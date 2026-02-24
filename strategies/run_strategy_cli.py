#!/usr/bin/env python3
"""
CLI wrapper for running ChuloBots strategies.

This script is called by the Rust CLI to execute strategies and generate signals.
It takes market data as input and outputs signal recommendations as JSON.

Usage:
    python run_strategy_cli.py --strategy bull_flag --data market_data.csv

Output format:
    {
        "should_enter": true/false,
        "asset": "BTC",
        "direction": "LONG",
        "entry_price": 50000.0,
        "stop_loss": 48000.0,
        "take_profit": 54000.0,
        "confidence": 85.0,
        "reason": "Bull flag breakout detected"
    }
"""

import argparse
import json
import sys
import os
import pandas as pd
import numpy as np
from typing import Optional, Dict

# Add strategies directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from strategies.bull_flag import BullFlagStrategy
from strategies.rsi_oversold import RSIOversoldStrategy


STRATEGY_MAP = {
    "bull_flag": BullFlagStrategy,
    "rsi_oversold": RSIOversoldStrategy,
}


def load_market_data(file_path: str) -> pd.DataFrame:
    """Load market data from CSV file."""
    try:
        df = pd.read_csv(file_path)

        # Ensure required columns exist
        required_cols = ["timestamp", "open", "high", "low", "close", "volume"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        # Convert timestamp to datetime if needed
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"])

        return df

    except Exception as e:
        print(json.dumps({
            "error": f"Failed to load market data: {str(e)}"
        }), file=sys.stderr)
        sys.exit(1)


def run_strategy(strategy_name: str, data: pd.DataFrame, params: Optional[Dict] = None) -> Dict:
    """
    Run a strategy against market data and generate signal.

    Args:
        strategy_name: Name of the strategy to run
        data: Market data DataFrame
        params: Optional strategy parameters

    Returns:
        Dictionary with signal information
    """
    # Get strategy class
    if strategy_name not in STRATEGY_MAP:
        return {
            "should_enter": False,
            "error": f"Unknown strategy: {strategy_name}"
        }

    StrategyClass = STRATEGY_MAP[strategy_name]

    try:
        # Initialize strategy
        strategy = StrategyClass(params=params)

        # Calculate indicators
        data_with_indicators = strategy.calculate_indicators(data)

        # Check regime filter
        if not strategy.regime_filter(data_with_indicators):
            return {
                "should_enter": False,
                "reason": "Regime filter failed (market conditions not suitable)"
            }

        # Check if setup is detected
        if not strategy.setup_detected(data_with_indicators):
            return {
                "should_enter": False,
                "reason": "No trading setup detected"
            }

        # Check entry trigger
        direction = strategy.entry_trigger(data_with_indicators)
        if direction is None:
            return {
                "should_enter": False,
                "reason": "Entry trigger not met"
            }

        # Calculate entry, stop, and target prices
        current_price = data_with_indicators.iloc[-1]["close"]

        # Assume entry at current close
        entry_price = current_price

        # Calculate stop loss
        stop_price = strategy.stop_logic(data_with_indicators, entry_price)

        # Calculate take profit
        target_price, exit_reason = strategy.exit_logic(data_with_indicators)
        if target_price is None:
            target_price = entry_price * 1.05  # Default 5% target

        # Score the setup
        confidence = strategy.score_setup(data_with_indicators)

        # Determine asset from data (assume BTC if not specified)
        asset = data.get("symbol", ["BTC"])[0] if "symbol" in data.columns else "BTC"

        # Build signal response
        signal = {
            "should_enter": True,
            "asset": asset,
            "direction": direction,
            "entry_price": float(entry_price),
            "stop_loss": float(stop_price),
            "take_profit": float(target_price),
            "confidence": float(confidence),
            "reason": f"{strategy.name} setup confirmed"
        }

        return signal

    except Exception as e:
        return {
            "should_enter": False,
            "error": f"Strategy execution failed: {str(e)}"
        }


def main():
    parser = argparse.ArgumentParser(description="Run ChuloBots trading strategy")
    parser.add_argument("--strategy", required=True, help="Strategy name (e.g., bull_flag, rsi_oversold)")
    parser.add_argument("--data", required=True, help="Path to market data CSV file")
    parser.add_argument("--params", type=str, help="Strategy parameters as JSON string")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")

    args = parser.parse_args()

    # Load market data
    data = load_market_data(args.data)

    # Parse parameters if provided
    params = None
    if args.params:
        try:
            params = json.loads(args.params)
        except json.JSONDecodeError as e:
            print(json.dumps({
                "should_enter": False,
                "error": f"Invalid params JSON: {str(e)}"
            }))
            sys.exit(1)

    # Run strategy
    result = run_strategy(args.strategy, data, params)

    # Output result as JSON
    print(json.dumps(result, indent=2 if args.debug else None))

    # Exit with code 0 if signal generated, 1 if no signal
    sys.exit(0 if result.get("should_enter", False) else 1)


if __name__ == "__main__":
    main()
