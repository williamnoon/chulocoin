"""
Backtesting engine for trading strategies.

Simulates strategy execution on historical data with realistic
fees, slippage, and position management.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_strategy import BaseStrategy


class BacktestEngine:
    """
    Backtesting engine for strategy evaluation.

    Features:
    - Realistic fee and slippage modeling
    - Position management (entry, stops, targets)
    - Performance metrics calculation
    - Trade-by-trade logging
    """

    def __init__(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        initial_capital: float = 10000.0,
        fee_rate: float = 0.001,  # 0.1% per trade
        slippage: float = 0.0005,  # 0.05% slippage
    ):
        """
        Initialize backtest engine.

        Args:
            strategy: Strategy instance to test
            data: OHLCV DataFrame with datetime index
            initial_capital: Starting account balance
            fee_rate: Trading fee as decimal (0.001 = 0.1%)
            slippage: Slippage as decimal (0.0005 = 0.05%)
        """
        self.strategy = strategy
        self.data = data.copy()
        self.initial_capital = initial_capital
        self.fee_rate = fee_rate
        self.slippage = slippage

        # State
        self.account_balance = initial_capital
        self.position = 0  # 0 = flat, 1 = long, -1 = short
        self.position_size = 0.0
        self.entry_price = 0.0
        self.stop_price = 0.0
        self.target_price = 0.0
        self.trades: List[Dict] = []
        self.equity_curve: List[float] = []

        # Prepare data
        self._prepare_data()

    def _prepare_data(self):
        """Add indicators to data."""
        self.data = self.strategy.calculate_indicators(self.data)

    def run(self) -> Dict:
        """
        Run the backtest.

        Returns:
            Dictionary with performance metrics and trade log
        """
        print(f"Running backtest for {self.strategy.name}...")
        print(f"Data range: {self.data.index[0]} to {self.data.index[-1]}")
        print(f"Total bars: {len(self.data)}")

        for i in range(len(self.data)):
            current_data = self.data.iloc[: i + 1]

            if len(current_data) < 50:  # Need minimum data
                self.equity_curve.append(self.account_balance)
                continue

            current_bar = current_data.iloc[-1]

            # Check existing position
            if self.position != 0:
                self._manage_position(current_bar, current_data)
            else:
                # Look for new entry
                self._check_entry(current_bar, current_data)

            # Record equity
            equity = self._calculate_equity(current_bar)
            self.equity_curve.append(equity)

        # Calculate final metrics
        metrics = self._calculate_metrics()

        print(f"\n{'='*50}")
        print(f"Backtest Complete: {self.strategy.name}")
        print(f"{'='*50}")
        print(f"Total Trades: {metrics['total_trades']}")
        print(f"Win Rate: {metrics['win_rate']:.2f}%")
        print(f"Total Return: {metrics['total_return']:.2f}%")
        print(f"Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
        print(f"Max Drawdown: {metrics['max_drawdown']:.2f}%")
        print(f"Profit Factor: {metrics['profit_factor']:.2f}")
        print(f"{'='*50}\n")

        return metrics

    def _check_entry(self, current_bar: pd.Series, data: pd.DataFrame):
        """Check for entry signal."""
        # Check regime filter
        if not self.strategy.regime_filter(data):
            return

        # Check setup
        if not self.strategy.setup_detected(data):
            return

        # Check entry trigger
        direction = self.strategy.entry_trigger(data)
        if direction is None:
            return

        # Calculate entry price with slippage
        if direction == "LONG":
            entry_price = current_bar["close"] * (1 + self.slippage)
            self.position = 1
        else:  # SHORT
            entry_price = current_bar["close"] * (1 - self.slippage)
            self.position = -1

        # Calculate stops and targets
        stop_price = self.strategy.stop_logic(data, entry_price)
        target_price, _ = self.strategy.exit_logic(data)

        # Calculate position size
        atr = current_bar.get("atr", current_bar["close"] * 0.02)  # Default 2% if no ATR
        position_size = self.strategy.position_size(
            self.account_balance,
            atr,
            entry_price,
            stop_price,
        )

        # Apply fees
        fee = position_size * entry_price * self.fee_rate

        # Check if we have enough capital
        required_capital = (position_size * entry_price) + fee
        if required_capital > self.account_balance:
            return  # Skip trade if insufficient capital

        # Enter position
        self.entry_price = entry_price
        self.stop_price = stop_price
        self.target_price = target_price
        self.position_size = position_size
        self.account_balance -= fee

        # Log entry
        self.strategy.entry_price = entry_price
        self.strategy.stop_price = stop_price
        self.strategy.target_price = target_price

    def _manage_position(self, current_bar: pd.Series, data: pd.DataFrame):
        """Manage existing position (check stops and targets)."""
        exit_price = None
        exit_reason = None

        if self.position == 1:  # LONG
            # Check stop
            if current_bar["low"] <= self.stop_price:
                exit_price = self.stop_price
                exit_reason = "stop_loss"
            # Check target
            elif current_bar["high"] >= self.target_price:
                exit_price = self.target_price
                exit_reason = "take_profit"

        elif self.position == -1:  # SHORT
            # Check stop
            if current_bar["high"] >= self.stop_price:
                exit_price = self.stop_price
                exit_reason = "stop_loss"
            # Check target
            elif current_bar["low"] <= self.target_price:
                exit_price = self.target_price
                exit_reason = "take_profit"

        # Exit if triggered
        if exit_price is not None:
            self._exit_position(current_bar, exit_price, exit_reason)

    def _exit_position(self, current_bar: pd.Series, exit_price: float, reason: str):
        """Exit the current position."""
        # Calculate P&L
        if self.position == 1:  # LONG
            pnl = (exit_price - self.entry_price) * self.position_size
        else:  # SHORT
            pnl = (self.entry_price - exit_price) * self.position_size

        # Apply fees
        fee = self.position_size * exit_price * self.fee_rate
        pnl -= fee

        # Update balance
        self.account_balance += pnl

        # Log trade
        trade = {
            "entry_time": self.data.index[self.data.index.get_loc(current_bar.name) - 1],
            "exit_time": current_bar.name,
            "direction": "LONG" if self.position == 1 else "SHORT",
            "entry_price": self.entry_price,
            "exit_price": exit_price,
            "size": self.position_size,
            "pnl": pnl,
            "pnl_percent": (pnl / (self.position_size * self.entry_price)) * 100,
            "exit_reason": reason,
        }
        self.trades.append(trade)

        # Reset position
        self.position = 0
        self.position_size = 0.0
        self.entry_price = 0.0
        self.stop_price = 0.0
        self.target_price = 0.0

    def _calculate_equity(self, current_bar: pd.Series) -> float:
        """Calculate current equity including unrealized P&L."""
        equity = self.account_balance

        if self.position != 0:
            # Add unrealized P&L
            if self.position == 1:  # LONG
                unrealized_pnl = (current_bar["close"] - self.entry_price) * self.position_size
            else:  # SHORT
                unrealized_pnl = (self.entry_price - current_bar["close"]) * self.position_size

            equity += unrealized_pnl

        return equity

    def _calculate_metrics(self) -> Dict:
        """Calculate performance metrics."""
        if len(self.trades) == 0:
            return {
                "total_trades": 0,
                "win_rate": 0.0,
                "total_return": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "profit_factor": 0.0,
                "avg_win": 0.0,
                "avg_loss": 0.0,
                "trades": [],
            }

        trades_df = pd.DataFrame(self.trades)

        # Basic stats
        total_trades = len(trades_df)
        winning_trades = trades_df[trades_df["pnl"] > 0]
        losing_trades = trades_df[trades_df["pnl"] < 0]

        win_rate = (len(winning_trades) / total_trades) * 100 if total_trades > 0 else 0

        # Returns
        total_return = ((self.account_balance - self.initial_capital) / self.initial_capital) * 100

        # Profit factor
        gross_profit = winning_trades["pnl"].sum() if len(winning_trades) > 0 else 0
        gross_loss = abs(losing_trades["pnl"].sum()) if len(losing_trades) > 0 else 0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

        # Sharpe ratio (annualized, assuming daily data)
        equity_series = pd.Series(self.equity_curve)
        returns = equity_series.pct_change().dropna()
        sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0

        # Max drawdown
        equity_series = pd.Series(self.equity_curve)
        cummax = equity_series.cummax()
        drawdown = (equity_series - cummax) / cummax * 100
        max_drawdown = drawdown.min()

        # Average win/loss
        avg_win = winning_trades["pnl"].mean() if len(winning_trades) > 0 else 0
        avg_loss = losing_trades["pnl"].mean() if len(losing_trades) > 0 else 0

        return {
            "total_trades": total_trades,
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "win_rate": win_rate,
            "total_return": total_return,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "profit_factor": profit_factor,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "gross_profit": gross_profit,
            "gross_loss": gross_loss,
            "final_balance": self.account_balance,
            "trades": self.trades,
            "equity_curve": self.equity_curve,
        }

    def get_trades_df(self) -> pd.DataFrame:
        """Get trades as DataFrame."""
        return pd.DataFrame(self.trades)
