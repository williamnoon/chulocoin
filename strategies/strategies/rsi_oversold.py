"""
RSI Oversold Mean Reversion Strategy

Buys oversold conditions when RSI drops below threshold and exits when
RSI returns to normal levels or target is hit.

Pattern:
1. Market in uptrend (regime filter)
2. RSI drops below 30 (oversold)
3. Enter on reversal signal
4. Exit when RSI > 70 or target hit

Entry: RSI crosses above 30 after being below
Stop: Recent swing low or ATR-based
Target: Previous resistance or R:R based
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_strategy import BaseStrategy


class RSIOversoldStrategy(BaseStrategy):
    """
    RSI mean reversion strategy for oversold bounces.

    Parameters:
        rsi_period: RSI calculation period (default: 14)
        rsi_oversold: Oversold threshold (default: 30)
        rsi_overbought: Overbought exit level (default: 70)
        rsi_entry: Entry threshold above oversold (default: 35)
        min_trend_strength: Minimum ADX for trend filter (default: 20)
        atr_period: ATR period for stops (default: 14)
        risk_per_trade: Risk per trade % (default: 2%)
        rr_ratio: Risk-reward ratio (default: 2.0)
    """

    def __init__(self, params: Optional[Dict] = None):
        default_params = {
            "rsi_period": 14,
            "rsi_oversold": 30,
            "rsi_overbought": 70,
            "rsi_entry": 35,
            "min_trend_strength": 20,
            "atr_period": 14,
            "risk_per_trade": 2.0,
            "rr_ratio": 2.0,
            "stop_atr_multiplier": 2.0,
        }

        if params:
            default_params.update(params)

        super().__init__(name="RSI Oversold Mean Reversion", params=default_params)

        # State
        self.was_oversold = False

    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate RSI and other indicators."""
        df = data.copy()

        # RSI
        df["rsi"] = self._calculate_rsi(df["close"], self.params["rsi_period"])

        # ATR for volatility
        df["atr"] = self._calculate_atr(df, self.params["atr_period"])

        # Moving averages for trend
        df["sma_50"] = df["close"].rolling(50).mean()
        df["sma_200"] = df["close"].rolling(200).mean()

        # ADX for trend strength
        df["adx"] = self._calculate_adx(df, 14)

        # Support/resistance levels
        df["swing_low"] = df["low"].rolling(20).min()
        df["swing_high"] = df["high"].rolling(20).max()

        return df

    def regime_filter(self, data: pd.DataFrame) -> bool:
        """Check if in uptrend (for long mean reversion)."""
        if len(data) < 200:
            return False

        current = data.iloc[-1]

        # Must be in uptrend
        uptrend = current["sma_50"] > current["sma_200"]

        # Trend must have some strength
        has_trend_strength = current["adx"] > self.params["min_trend_strength"]

        # Price above 50 SMA (pullback, not breakdown)
        price_above_ma = current["close"] > current["sma_50"] * 0.95  # Allow 5% below

        return uptrend and has_trend_strength and price_above_ma

    def setup_detected(self, data: pd.DataFrame) -> bool:
        """Detect RSI oversold condition."""
        if len(data) < 50:
            return False

        current = data.iloc[-1]
        prev = data.iloc[-2]

        # Check if RSI was recently oversold
        if current["rsi"] < self.params["rsi_oversold"]:
            self.was_oversold = True

        # Setup exists if we were oversold recently
        return self.was_oversold or current["rsi"] < self.params["rsi_oversold"]

    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """Enter when RSI bounces from oversold."""
        current = data.iloc[-1]
        prev = data.iloc[-2]

        # Entry: RSI crosses back above entry threshold after being oversold
        if (
            self.was_oversold
            and prev["rsi"] < self.params["rsi_entry"]
            and current["rsi"] > self.params["rsi_entry"]
        ):
            # Additional confirmation: price making higher low
            if current["low"] > data.iloc[-3:-1]["low"].min():
                self.was_oversold = False  # Reset
                return "LONG"

        return None

    def stop_logic(self, data: pd.DataFrame, entry_price: float) -> float:
        """Stop below recent swing low or ATR-based."""
        current = data.iloc[-1]

        # Use recent swing low
        swing_low = current["swing_low"]

        # Or ATR-based stop
        atr_stop = entry_price - (current["atr"] * self.params["stop_atr_multiplier"])

        # Use whichever is closer (tighter stop)
        stop_price = max(swing_low, atr_stop)

        return stop_price

    def exit_logic(self, data: pd.DataFrame) -> Tuple[Optional[float], str]:
        """Exit on overbought RSI or target."""
        current = data.iloc[-1]

        # Exit if RSI reaches overbought
        if current["rsi"] > self.params["rsi_overbought"]:
            return (current["close"], "rsi_overbought")

        # Calculate target based on R:R ratio
        risk = self.entry_price - self.stop_price
        target = self.entry_price + (risk * self.params["rr_ratio"])

        # Check if target hit
        if current["high"] >= target:
            return (target, "target")

        # Also exit if price breaks below stop (managed in backtest, but can trail)
        if current["close"] < self.entry_price * 0.98:  # 2% trailing stop
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
        if len(data) < 200:
            return 0.0

        current = data.iloc[-1]
        score = 50.0  # Base score

        # RSI level (deeper oversold = higher score)
        if current["rsi"] < 25:
            score += 20  # Very oversold
        elif current["rsi"] < 30:
            score += 15  # Oversold
        elif current["rsi"] < 35:
            score += 10  # Moderately oversold

        # Trend strength
        if current["adx"] > 30:
            score += 15  # Strong trend
        elif current["adx"] > 25:
            score += 10  # Moderate trend

        # Distance from MA (closer = better mean reversion)
        ma_distance = abs(current["close"] - current["sma_50"]) / current["sma_50"] * 100
        if ma_distance < 3:
            score += 10  # Close to MA
        elif ma_distance < 5:
            score += 5

        # Volume (if available)
        if "volume" in current.index:
            recent_vol = data.iloc[-5:]["volume"].mean()
            if current["volume"] > recent_vol * 1.2:
                score += 5  # Volume spike

        return min(score, 100.0)

    @staticmethod
    def _calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate Relative Strength Index."""
        delta = prices.diff()

        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        return rsi

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

    @staticmethod
    def _calculate_adx(data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Average Directional Index (simplified)."""
        high = data["high"]
        low = data["low"]
        close = data["close"]

        # Calculate +DM and -DM
        plus_dm = high.diff()
        minus_dm = -low.diff()

        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm < 0] = 0

        # Calculate TR
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

        # Smooth DM and TR
        atr = tr.rolling(period).mean()
        plus_di = 100 * (plus_dm.rolling(period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(period).mean() / atr)

        # Calculate DX and ADX
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(period).mean()

        return adx
