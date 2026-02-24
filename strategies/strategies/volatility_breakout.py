"""
Volatility Breakout (Squeeze) Strategy

Entry Logic:
1. Bollinger Bands squeeze (low volatility compression)
2. ATR at multi-period low
3. Breakout above/below bands with expansion
4. Volume surge confirmation

Exit Logic:
- Stop loss: 2x ATR from entry
- Target: 3x ATR from entry (1.5 R:R minimum)
- Trail stop after 1.5R

Risk: 1% of account per trade
"""

import pandas as pd
import numpy as np
from typing import Optional
from ..base_strategy import BaseStrategy


class VolatilityBreakoutStrategy(BaseStrategy):
    """
    Squeeze breakout strategy - enters when volatility expands after compression
    """

    def __init__(self):
        super().__init__("Volatility Breakout")
        self.params = {
            'bb_period': 20,
            'bb_std': 2.0,
            'atr_period': 14,
            'squeeze_threshold': 0.015,  # 1.5% bandwidth
            'volume_multiplier': 1.5,  # Volume must be 1.5x average
            'atr_lookback': 50,  # Check if ATR is at low
            'atr_percentile': 20,  # ATR must be below 20th percentile
            'risk_per_trade': 0.01,  # 1% risk
            'stop_atr_multiple': 2.0,
            'target_atr_multiple': 3.0,
        }

    def regime_filter(self, data: pd.DataFrame) -> bool:
        """
        No specific regime filter - works in all regimes
        Squeeze can happen in trending or ranging markets
        """
        # Require minimum data
        if len(data) < self.params['bb_period']:
            return False

        # Require valid price data
        if data['close'].iloc[-1] <= 0:
            return False

        return True

    def _calculate_bollinger_bands(self, data: pd.DataFrame) -> tuple:
        """Calculate Bollinger Bands"""
        period = self.params['bb_period']
        std = self.params['bb_std']

        sma = data['close'].rolling(period).mean()
        std_dev = data['close'].rolling(period).std()

        upper_band = sma + (std_dev * std)
        lower_band = sma - (std_dev * std)
        bandwidth = (upper_band - lower_band) / sma

        return upper_band, lower_band, bandwidth

    def _calculate_atr(self, data: pd.DataFrame) -> pd.Series:
        """Calculate Average True Range"""
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())

        true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = true_range.rolling(self.params['atr_period']).mean()

        return atr

    def _is_squeeze(self, data: pd.DataFrame) -> bool:
        """
        Detect if we're in a squeeze (low volatility compression)
        """
        upper_band, lower_band, bandwidth = self._calculate_bollinger_bands(data)
        atr = self._calculate_atr(data)

        # Current bandwidth is narrow
        current_bandwidth = bandwidth.iloc[-1]
        if current_bandwidth > self.params['squeeze_threshold']:
            return False

        # ATR is at multi-period low
        lookback = self.params['atr_lookback']
        current_atr = atr.iloc[-1]
        atr_window = atr.iloc[-lookback:]

        atr_percentile_value = np.percentile(atr_window.dropna(), self.params['atr_percentile'])

        if current_atr > atr_percentile_value:
            return False

        # Bandwidth has been contracting (tightening squeeze)
        bandwidth_slope = bandwidth.iloc[-5:].diff().mean()
        if bandwidth_slope > 0:  # Bandwidth expanding, not squeezing
            return False

        return True

    def setup_detected(self, data: pd.DataFrame) -> bool:
        """
        Detect squeeze setup
        """
        if len(data) < max(self.params['bb_period'], self.params['atr_lookback']):
            return False

        return self._is_squeeze(data)

    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """
        Enter on breakout from squeeze with volume confirmation
        """
        if not self.setup_detected(data):
            return None

        upper_band, lower_band, bandwidth = self._calculate_bollinger_bands(data)
        current_close = data['close'].iloc[-1]
        previous_close = data['close'].iloc[-2]

        # Check volume surge
        avg_volume = data['volume'].rolling(20).mean().iloc[-1]
        current_volume = data['volume'].iloc[-1]

        if current_volume < avg_volume * self.params['volume_multiplier']:
            return None

        # Check for breakout above upper band
        if previous_close <= upper_band.iloc[-2] and current_close > upper_band.iloc[-1]:
            # Confirm bandwidth is expanding (squeeze releasing)
            if bandwidth.iloc[-1] > bandwidth.iloc[-2]:
                return "LONG"

        # Check for breakdown below lower band
        if previous_close >= lower_band.iloc[-2] and current_close < lower_band.iloc[-1]:
            # Confirm bandwidth is expanding (squeeze releasing)
            if bandwidth.iloc[-1] > bandwidth.iloc[-2]:
                return "SHORT"

        return None

    def stop_logic(self, data: pd.DataFrame, direction: str) -> float:
        """
        Calculate stop loss based on ATR
        """
        atr = self._calculate_atr(data)
        current_atr = atr.iloc[-1]
        entry = data['close'].iloc[-1]

        stop_distance = current_atr * self.params['stop_atr_multiple']

        if direction == "LONG":
            return entry - stop_distance
        else:  # SHORT
            return entry + stop_distance

    def target_logic(self, data: pd.DataFrame, direction: str) -> float:
        """
        Calculate take profit based on ATR
        """
        atr = self._calculate_atr(data)
        current_atr = atr.iloc[-1]
        entry = data['close'].iloc[-1]

        target_distance = current_atr * self.params['target_atr_multiple']

        if direction == "LONG":
            return entry + target_distance
        else:  # SHORT
            return entry - target_distance

    def exit_logic(self, data: pd.DataFrame, direction: str, entry_price: float) -> bool:
        """
        Exit logic - trail stop after profit
        """
        current_price = data['close'].iloc[-1]
        atr = self._calculate_atr(data).iloc[-1]

        if direction == "LONG":
            profit = current_price - entry_price
            # If profit > 1.5R, trail stop by 1 ATR
            if profit > (atr * self.params['stop_atr_multiple'] * 1.5):
                trail_stop = current_price - atr
                if data['low'].iloc[-1] <= trail_stop:
                    return True

        else:  # SHORT
            profit = entry_price - current_price
            # If profit > 1.5R, trail stop by 1 ATR
            if profit > (atr * self.params['stop_atr_multiple'] * 1.5):
                trail_stop = current_price + atr
                if data['high'].iloc[-1] >= trail_stop:
                    return True

        return False

    def position_size(
        self,
        account_balance: float,
        volatility: float,
        entry: float,
        stop: float
    ) -> float:
        """
        Position size based on 1% risk per trade
        """
        risk_amount = account_balance * self.params['risk_per_trade']
        risk_per_share = abs(entry - stop)

        if risk_per_share == 0:
            return 0

        shares = risk_amount / risk_per_share

        # Convert to dollar amount
        position_dollars = shares * entry

        # Cap at 20% of account
        max_position = account_balance * 0.20
        if position_dollars > max_position:
            position_dollars = max_position

        return position_dollars

    def score_setup(self, data: pd.DataFrame, direction: str) -> int:
        """
        Score setup quality (0-100)
        Higher score = better setup
        """
        upper_band, lower_band, bandwidth = self._calculate_bollinger_bands(data)
        atr = self._calculate_atr(data)

        score = 50  # Base score

        # Tighter squeeze = higher score
        current_bandwidth = bandwidth.iloc[-1]
        if current_bandwidth < 0.01:  # Very tight
            score += 20
        elif current_bandwidth < 0.012:
            score += 10

        # Lower ATR percentile = higher score
        lookback = self.params['atr_lookback']
        current_atr = atr.iloc[-1]
        atr_window = atr.iloc[-lookback:]
        atr_rank = (atr_window < current_atr).sum() / len(atr_window.dropna())

        if atr_rank < 0.1:  # ATR in bottom 10%
            score += 20
        elif atr_rank < 0.2:
            score += 10

        # Volume surge magnitude
        avg_volume = data['volume'].rolling(20).mean().iloc[-1]
        current_volume = data['volume'].iloc[-1]
        volume_ratio = current_volume / avg_volume

        if volume_ratio > 2.0:
            score += 10
        elif volume_ratio > 1.5:
            score += 5

        return min(score, 100)
