"""
Walk-forward analysis for strategy optimization and validation.

Prevents overfitting by using rolling training and testing windows.
"""

import pandas as pd
import numpy as np
from typing import Dict, List
from .engine import BacktestEngine
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_strategy import BaseStrategy


class WalkForwardAnalysis:
    """
    Walk-forward analysis with rolling windows.

    Process:
    1. Split data into training and testing windows
    2. Optimize parameters on training data
    3. Test on out-of-sample testing data
    4. Roll forward and repeat
    """

    def __init__(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        train_months: int = 12,
        test_months: int = 3,
        initial_capital: float = 10000.0,
    ):
        """
        Initialize walk-forward analysis.

        Args:
            strategy_class: Strategy class (not instance)
            data: Full dataset
            train_months: Training window size in months
            test_months: Testing window size in months
            initial_capital: Starting capital
        """
        self.strategy_class = strategy_class
        self.data = data
        self.train_months = train_months
        self.test_months = test_months
        self.initial_capital = initial_capital
        self.results: List[Dict] = []

    def run(self, param_grid: Dict = None) -> Dict:
        """
        Run walk-forward analysis.

        Args:
            param_grid: Dictionary of parameters to test
                       e.g., {'atr_period': [10, 14, 20], 'risk_per_trade': [1.0, 2.0]}

        Returns:
            Dictionary with walk-forward results
        """
        print(f"\n{'='*60}")
        print(f"Walk-Forward Analysis")
        print(f"Training: {self.train_months} months | Testing: {self.test_months} months")
        print(f"{'='*60}\n")

        # Create rolling windows
        windows = self._create_windows()
        print(f"Total windows: {len(windows)}\n")

        for i, (train_data, test_data) in enumerate(windows):
            print(f"Window {i+1}/{len(windows)}")
            print(f"Train: {train_data.index[0]} to {train_data.index[-1]}")
            print(f"Test:  {test_data.index[0]} to {test_data.index[-1]}")

            # Find best parameters on training data
            if param_grid:
                best_params = self._optimize_parameters(train_data, param_grid)
                print(f"Best params: {best_params}")
            else:
                best_params = {}

            # Test on out-of-sample data
            strategy = self.strategy_class(params=best_params)
            engine = BacktestEngine(strategy, test_data, self.initial_capital)
            metrics = engine.run()

            # Store results
            self.results.append({
                "window": i + 1,
                "train_start": train_data.index[0],
                "train_end": train_data.index[-1],
                "test_start": test_data.index[0],
                "test_end": test_data.index[-1],
                "params": best_params,
                "metrics": metrics,
            })

        # Aggregate results
        summary = self._summarize_results()
        return summary

    def _create_windows(self) -> List[tuple]:
        """Create rolling train/test windows."""
        windows = []

        # Calculate window sizes in days (approximate)
        train_days = self.train_months * 30
        test_days = self.test_months * 30
        step_days = test_days  # Roll forward by test window size

        start_idx = 0
        while True:
            train_end_idx = start_idx + train_days
            test_end_idx = train_end_idx + test_days

            if test_end_idx > len(self.data):
                break

            train_data = self.data.iloc[start_idx:train_end_idx]
            test_data = self.data.iloc[train_end_idx:test_end_idx]

            windows.append((train_data, test_data))
            start_idx += step_days

        return windows

    def _optimize_parameters(self, train_data: pd.DataFrame, param_grid: Dict) -> Dict:
        """
        Optimize parameters on training data.

        Simple grid search to find best parameters based on Sharpe ratio.
        """
        best_sharpe = -999
        best_params = {}

        # Generate parameter combinations
        import itertools

        keys = param_grid.keys()
        values = param_grid.values()

        for combination in itertools.product(*values):
            params = dict(zip(keys, combination))

            # Test this parameter set
            strategy = self.strategy_class(params=params)
            engine = BacktestEngine(strategy, train_data, self.initial_capital)
            metrics = engine.run()

            # Check if better than current best
            if metrics["sharpe_ratio"] > best_sharpe:
                best_sharpe = metrics["sharpe_ratio"]
                best_params = params

        return best_params

    def _summarize_results(self) -> Dict:
        """Summarize walk-forward results."""
        if len(self.results) == 0:
            return {}

        # Extract test metrics from each window
        test_returns = [r["metrics"]["total_return"] for r in self.results]
        test_sharpes = [r["metrics"]["sharpe_ratio"] for r in self.results]
        test_win_rates = [r["metrics"]["win_rate"] for r in self.results]
        test_drawdowns = [r["metrics"]["max_drawdown"] for r in self.results]

        summary = {
            "total_windows": len(self.results),
            "avg_return": np.mean(test_returns),
            "std_return": np.std(test_returns),
            "avg_sharpe": np.mean(test_sharpes),
            "avg_win_rate": np.mean(test_win_rates),
            "avg_max_drawdown": np.mean(test_drawdowns),
            "best_window": max(self.results, key=lambda x: x["metrics"]["sharpe_ratio"]),
            "worst_window": min(self.results, key=lambda x: x["metrics"]["sharpe_ratio"]),
            "consistent": np.std(test_sharpes) < 0.5,  # Low variance = consistent
            "all_results": self.results,
        }

        print(f"\n{'='*60}")
        print(f"Walk-Forward Summary")
        print(f"{'='*60}")
        print(f"Windows: {summary['total_windows']}")
        print(f"Avg Return: {summary['avg_return']:.2f}% (±{summary['std_return']:.2f}%)")
        print(f"Avg Sharpe: {summary['avg_sharpe']:.2f}")
        print(f"Avg Win Rate: {summary['avg_win_rate']:.2f}%")
        print(f"Avg Max DD: {summary['avg_max_drawdown']:.2f}%")
        print(f"Consistent: {'Yes' if summary['consistent'] else 'No'}")
        print(f"{'='*60}\n")

        return summary
