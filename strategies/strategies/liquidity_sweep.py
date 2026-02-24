"""
Liquidity Sweep Strategy

Catches false breakouts where price sweeps liquidity above equal highs
or below equal lows, then reverses. This strategy aims to enter on the
reversal after the liquidity grab.

Pattern:
1. Identify equal highs or equal lows (liquidity zones)
2. Price sweeps above/below the level (liquidity grab)
3. Quick reversal back into range
4. Enter on confirmed reversal

Entry: After sweep and reversal confirmation
Stop: Beyond the sweep point
Target: Opposite side of range or key level
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple, List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_strategy import BaseStrategy


class LiquiditySweepStrategy(BaseStrategy):
    """
    Liquidity sweep strategy for false breakout reversals.

    Parameters:
        equal_level_tolerance: Price tolerance for equal highs/lows % (default: 0.5%)
        sweep_bars: Max bars to identify sweep (default: 3)
        reversal_threshold: Minimum reversal % to confirm (default: 0.3%)
        min_range_size: Minimum range size % (default: 2%)
        atr_period: ATR period (default: 14)
        risk_per_trade: Risk per trade % (default: 2%)
        rr_ratio: Risk-reward ratio (default: 2.5)
    """

    def __init__(self, params: Optional[Dict] = None):
        default_params = {
            "equal_level_tolerance": 0.5,  # 0.5% tolerance for equal levels
            "sweep_bars": 3,  # Look for sweep within 3 bars
            "reversal_threshold": 0.3,  # 0.3% reversal to confirm
            "min_range_size": 2.0,  # 2% minimum range
            "lookback_period": 50,  # Lookback for equal levels
            "atr_period": 14,
            "risk_per_trade": 2.0,
            "rr_ratio": 2.5,
        }

        if params:
            default_params.update(params)

        super().__init__(name="Liquidity Sweep", params=default_params)

        # State
        self.equal_highs: List[float] = []
        self.equal_lows: List[float] = []
        self.sweep_detected = False
        self.sweep_direction = None  # 'high' or 'low'
        self.sweep_level = 0.0
        self.range_support = 0.0
        self.range_resistance = 0.0

    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate indicators and identify liquidity levels."""
        df = data.copy()

        # ATR for volatility
        df["atr"] = self._calculate_atr(df, self.params["atr_period"])

        # Simple moving average for trend context
        df["sma_50"] = df["close"].rolling(50).mean()

        # Identify swing highs and lows
        df["swing_high"] = self._identify_swing_highs(df)
        df["swing_low"] = self._identify_swing_lows(df)

        return df

    def regime_filter(self, data: pd.DataFrame) -> bool:
        """Check if market conditions are suitable."""
        if len(data) < self.params["lookback_period"]:
            return False

        current = data.iloc[-1]

        # We can trade in any regime, but prefer ranging markets
        # Check for sufficient volatility
        if current["atr"] < current["close"] * 0.01:  # At least 1% ATR
            return False

        return True

    def setup_detected(self, data: pd.DataFrame) -> bool:
        """Detect equal highs/lows and potential sweep."""
        if len(data) < self.params["lookback_period"]:
            return False

        lookback = data.iloc[-self.params["lookback_period"] :]
        current = data.iloc[-1]

        # Find equal highs
        self.equal_highs = self._find_equal_levels(
            lookback["high"], self.params["equal_level_tolerance"]
        )

        # Find equal lows
        self.equal_lows = self._find_equal_levels(
            lookback["low"], self.params["equal_level_tolerance"], find_lows=True
        )

        # Check for sweep of equal highs (bearish reversal setup)
        for level in self.equal_highs:
            if self._check_sweep(data, level, "high"):
                self.sweep_detected = True
                self.sweep_direction = "high"
                self.sweep_level = level
                self.range_support = lookback["low"].min()
                self.range_resistance = level
                return True

        # Check for sweep of equal lows (bullish reversal setup)
        for level in self.equal_lows:
            if self._check_sweep(data, level, "low"):
                self.sweep_detected = True
                self.sweep_direction = "low"
                self.sweep_level = level
                self.range_support = level
                self.range_resistance = lookback["high"].max()
                return True

        return False

    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """Enter on confirmed reversal after sweep."""
        if not self.sweep_detected:
            return None

        current = data.iloc[-1]
        prev = data.iloc[-2]

        if self.sweep_direction == "high":
            # Bearish sweep: enter SHORT on reversal
            # Check for reversal below sweep level
            reversal_target = self.sweep_level * (1 - self.params["reversal_threshold"] / 100)

            if current["close"] < reversal_target and prev["close"] >= reversal_target:
                # Confirmed bearish reversal
                return "SHORT"

        elif self.sweep_direction == "low":
            # Bullish sweep: enter LONG on reversal
            # Check for reversal above sweep level
            reversal_target = self.sweep_level * (1 + self.params["reversal_threshold"] / 100)

            if current["close"] > reversal_target and prev["close"] <= reversal_target:
                # Confirmed bullish reversal
                self.sweep_detected = False  # Reset
                return "LONG"

        return None

    def stop_logic(self, data: pd.DataFrame, entry_price: float) -> float:
        """Stop beyond the sweep point."""
        current = data.iloc[-1]
        atr = current["atr"]

        if self.sweep_direction == "high":
            # SHORT: stop above sweep high + buffer
            stop_price = self.sweep_level + (atr * 1.5)
        else:
            # LONG: stop below sweep low - buffer
            stop_price = self.sweep_level - (atr * 1.5)

        return stop_price

    def exit_logic(self, data: pd.DataFrame) -> Tuple[Optional[float], str]:
        """Target opposite side of range or R:R based."""
        current = data.iloc[-1]

        if self.sweep_direction == "high":
            # SHORT: target support
            target = self.range_support
        else:
            # LONG: target resistance
            target = self.range_resistance

        # Ensure minimum R:R ratio
        risk = abs(self.entry_price - self.stop_price)
        min_target = self.entry_price + (risk * self.params["rr_ratio"])

        if self.sweep_direction == "high":
            # SHORT: lower target is better
            target = min(target, self.entry_price - (risk * self.params["rr_ratio"]))
        else:
            # LONG: higher target is better
            target = max(target, min_target)

        # Check if target hit
        if self.sweep_direction == "high" and current["low"] <= target:
            return (target, "target")
        elif self.sweep_direction == "low" and current["high"] >= target:
            return (target, "target")

        return (target, "pending")

    def position_size(
        self,
        account_balance: float,
        current_volatility: float,
        entry_price: float,
        stop_price: float,
    ) -> float:
        """Calculate position size based on fixed risk."""
        risk_amount = account_balance * (self.params["risk_per_trade"] / 100)
        risk_per_unit = abs(entry_price - stop_price)

        if risk_per_unit <= 0:
            return 0.0

        return risk_amount / risk_per_unit

    def score_setup(self, data: pd.DataFrame) -> float:
        """Score the setup quality (0-100)."""
        if not self.sweep_detected:
            return 0.0

        score = 50.0  # Base score

        # Check range size
        range_size = abs(self.range_resistance - self.range_support) / self.range_support * 100
        if range_size > 5:
            score += 20  # Large range = better target
        elif range_size > 3:
            score += 10

        # Check how clean the equal levels are
        if len(self.equal_highs if self.sweep_direction == "high" else self.equal_lows) >= 2:
            score += 15  # Multiple equal levels = strong liquidity

        # Check reversal strength
        current = data.iloc[-1]
        if "volume" in current.index:
            recent_vol = data.iloc[-10:]["volume"].mean()
            if current["volume"] > recent_vol * 1.5:
                score += 15  # Strong volume on reversal

        return min(score, 100.0)

    def _find_equal_levels(
        self, prices: pd.Series, tolerance: float, find_lows: bool = False
    ) -> List[float]:
        """Find equal highs or lows within tolerance."""
        levels = []
        price_list = prices.values

        for i in range(len(price_list) - 1):
            current = price_list[i]
            matches = 1

            # Count prices within tolerance
            for j in range(i + 1, len(price_list)):
                if abs(price_list[j] - current) / current * 100 <= tolerance:
                    matches += 1

            # If we found multiple equal levels
            if matches >= 2 and current not in levels:
                levels.append(current)

        return levels

    def _check_sweep(self, data: pd.DataFrame, level: float, direction: str) -> bool:
        """Check if price swept a level recently."""
        recent = data.iloc[-self.params["sweep_bars"] :]

        for idx, row in recent.iterrows():
            if direction == "high":
                # Check if high swept above level
                if row["high"] > level and row["close"] < level:
                    return True
            else:
                # Check if low swept below level
                if row["low"] < level and row["close"] > level:
                    return True

        return False

    def _identify_swing_highs(self, data: pd.DataFrame, window: int = 5) -> pd.Series:
        """Identify swing highs."""
        highs = data["high"].rolling(window, center=True).max()
        swing_highs = data["high"] == highs
        return data["high"].where(swing_highs, np.nan)

    def _identify_swing_lows(self, data: pd.DataFrame, window: int = 5) -> pd.Series:
        """Identify swing lows."""
        lows = data["low"].rolling(window, center=True).min()
        swing_lows = data["low"] == lows
        return data["low"].where(swing_lows, np.nan)

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
