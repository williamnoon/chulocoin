"""
Bull Flag Continuation Strategy

Identifies bull flag patterns and trades the continuation breakout.

Pattern:
1. Strong upward move (flagpole)
2. Consolidation/pullback (flag)
3. Breakout above flag resistance

Entry: Breakout above flag high
Stop: Below flag low or recent swing low
Target: Flagpole height projected from breakout
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_strategy import BaseStrategy


class BullFlagStrategy(BaseStrategy):
    """
    Bull flag continuation pattern strategy.

    Parameters:
        flagpole_min_move: Minimum% move for flagpole (default: 10%)
        flag_max_duration: Maximum candles for flag formation (default: 20)
        flag_max_retrace: Maximum retracement% in flag (default: 50%)
        volume_confirm: Require volume confirmation (default: True)
        atr_period: ATR period for stop loss (default: 14)
        risk_per_trade: Risk per trade as % of account (default: 2%)
    """

    def __init__(self, params: Optional[Dict] = None):
        default_params = {
            "flagpole_min_move": 10.0,  # 10% minimum move
            "flag_max_duration": 20,  # 20 candles max
            "flag_max_retrace": 50.0,  # 50% max retracement
            "volume_confirm": True,
            "atr_period": 14,
            "risk_per_trade": 2.0,  # 2% of account
            "target_multiplier": 1.0,  # 1x flagpole height
        }

        if params:
            default_params.update(params)

        super().__init__(name="Bull Flag Continuation", params=default_params)

        # Strategy state
        self.flagpole_start = 0
        self.flagpole_end = 0
        self.flag_high = 0.0
        self.flag_low = 0.0

    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add technical indicators."""
        df = data.copy()

        # ATR for volatility
        df["atr"] = self._calculate_atr(df, self.params["atr_period"])

        # Simple moving averages for trend
        df["sma_20"] = df["close"].rolling(20).mean()
        df["sma_50"] = df["close"].rolling(50).mean()

        # Volume moving average
        df["vol_ma"] = df["volume"].rolling(20).mean()

        # High/Low rolling windows
        df["high_20"] = df["high"].rolling(20).max()
        df["low_20"] = df["low"].rolling(20).min()

        return df

    def regime_filter(self, data: pd.DataFrame) -> bool:
        """Check if in uptrend."""
        if len(data) < 50:
            return False

        current = data.iloc[-1]

        # Must be in uptrend
        uptrend = current["sma_20"] > current["sma_50"]

        # Price above 20 SMA
        price_above_ma = current["close"] > current["sma_20"]

        return uptrend and price_above_ma

    def setup_detected(self, data: pd.DataFrame) -> bool:
        """Detect bull flag pattern."""
        if len(data) < 50:
            return False

        # Look back for flagpole and flag
        lookback = min(len(data), 50)
        recent_data = data.iloc[-lookback:]

        # Find flagpole: strong upward move
        flagpole = self._find_flagpole(recent_data)
        if flagpole is None:
            return False

        pole_start_idx, pole_end_idx, pole_low, pole_high = flagpole

        # Find flag: consolidation after flagpole
        flag_data = recent_data.iloc[pole_end_idx:]
        if len(flag_data) < 3 or len(flag_data) > self.params["flag_max_duration"]:
            return False

        # Check flag is consolidating (not breaking down too much)
        flag_high = flag_data["high"].max()
        flag_low = flag_data["low"].min()
        retrace_pct = ((pole_high - flag_low) / (pole_high - pole_low)) * 100

        if retrace_pct > self.params["flag_max_retrace"]:
            return False

        # Store flag data
        self.flagpole_start = pole_start_idx
        self.flagpole_end = pole_end_idx
        self.flag_high = flag_high
        self.flag_low = flag_low

        return True

    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """Check for breakout above flag high."""
        current = data.iloc[-1]
        prev = data.iloc[-2]

        # Breakout: close above flag high
        if current["close"] > self.flag_high and prev["close"] <= self.flag_high:
            # Volume confirmation (optional)
            if self.params["volume_confirm"]:
                if current["volume"] < current["vol_ma"]:
                    return None

            return "LONG"

        return None

    def stop_logic(self, data: pd.DataFrame, entry_price: float) -> float:
        """Stop below flag low or using ATR."""
        current = data.iloc[-1]

        # Use flag low as stop
        stop_flag = self.flag_low

        # Or use ATR-based stop (whichever is tighter)
        atr = current["atr"]
        stop_atr = entry_price - (2 * atr)

        # Use the closer stop
        stop_price = max(stop_flag, stop_atr)

        return stop_price

    def exit_logic(self, data: pd.DataFrame) -> Tuple[Optional[float], str]:
        """Target based on flagpole height projection."""
        current = data.iloc[-1]

        # Calculate flagpole height
        pole_data = data.iloc[self.flagpole_start : self.flagpole_end + 1]
        pole_height = pole_data["high"].max() - pole_data["low"].min()

        # Project target
        target = self.flag_high + (pole_height * self.params["target_multiplier"])

        # Check if target hit
        if current["high"] >= target:
            return (target, "target")

        # Trailing stop (optional): trail below recent lows
        if current["close"] < data.iloc[-3:]["low"].min():
            return (current["close"], "trailing_stop")

        return (target, "pending")

    def position_size(
        self,
        account_balance: float,
        current_volatility: float,
        entry_price: float,
        stop_price: float,
    ) -> float:
        """Calculate position size based on fixed risk."""
        # Risk amount
        risk_amount = account_balance * (self.params["risk_per_trade"] / 100)

        # Risk per unit
        risk_per_unit = entry_price - stop_price

        if risk_per_unit <= 0:
            return 0.0

        # Position size
        position_size = risk_amount / risk_per_unit

        return position_size

    def score_setup(self, data: pd.DataFrame) -> float:
        """Score the setup quality (0-100)."""
        if len(data) < 50:
            return 0.0

        current = data.iloc[-1]
        score = 50.0  # Base score

        # Trend strength
        if current["sma_20"] > current["sma_50"] * 1.05:
            score += 15  # Strong uptrend

        # Volume confirmation
        if current["volume"] > current["vol_ma"] * 1.5:
            score += 15  # Strong volume

        # Tight flag (less retracement = stronger)
        pole_data = data.iloc[self.flagpole_start : self.flagpole_end + 1]
        pole_high = pole_data["high"].max()
        pole_low = pole_data["low"].min()

        retrace_pct = ((pole_high - self.flag_low) / (pole_high - pole_low)) * 100
        if retrace_pct < 30:
            score += 10  # Tight flag
        elif retrace_pct < 40:
            score += 5

        # Risk/reward ratio
        entry = self.flag_high
        stop = self.flag_low
        pole_height = pole_high - pole_low
        target = entry + pole_height

        rr_ratio = (target - entry) / (entry - stop)
        if rr_ratio > 2:
            score += 10  # Good R:R

        return min(score, 100.0)

    def _find_flagpole(self, data: pd.DataFrame) -> Optional[Tuple[int, int, float, float]]:
        """Find flagpole pattern in recent data."""
        min_move = self.params["flagpole_min_move"]

        # Look for strong upward move
        for i in range(len(data) - 5):
            window = data.iloc[i : i + 10]
            if len(window) < 5:
                continue

            low = window["low"].min()
            high = window["high"].max()
            move_pct = ((high - low) / low) * 100

            if move_pct >= min_move:
                # Found potential flagpole
                low_idx = window["low"].idxmin()
                high_idx = window["high"].idxmax()

                # Ensure high comes after low
                if high_idx > low_idx:
                    start_idx = i
                    end_idx = i + window.index.get_loc(high_idx)
                    return (start_idx, end_idx, low, high)

        return None

    @staticmethod
    def _calculate_atr(data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Average True Range."""
        high = data["high"]
        low = data["low"]
        close = data["close"]

        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())

        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(period).mean()

        return atr
