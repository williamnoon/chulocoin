"""
Momentum Ranking Cross-Sectional Strategy

Entry Logic:
1. Calculate 20-day momentum for universe of assets
2. Rank assets by momentum score
3. Long top quintile (top 20%)
4. Short bottom quintile (bottom 20%)
5. Monthly rebalancing

Exit Logic:
- Hold until next rebalancing period
- Emergency exit if asset momentum reverses significantly

Risk: Equal weight across positions, 1% risk per position
"""

import pandas as pd
import numpy as np
from typing import Optional, List, Dict
from ..base_strategy import BaseStrategy


class MomentumRankingStrategy(BaseStrategy):
    """
    Cross-sectional momentum strategy - ranks assets and trades relative performance
    """

    def __init__(self):
        super().__init__("Momentum Ranking")
        self.params = {
            'momentum_period': 20,  # 20-day momentum
            'ranking_period': 60,  # Look at 60-day performance for ranking
            'rebalance_days': 30,  # Monthly rebalancing
            'top_percentile': 20,  # Top 20% for longs
            'bottom_percentile': 20,  # Bottom 20% for shorts
            'min_momentum': 0.02,  # Minimum 2% momentum to enter
            'exit_momentum_threshold': -0.05,  # Exit if momentum drops 5%
            'risk_per_trade': 0.01,  # 1% risk per position
            'volatility_lookback': 20,
            'stop_atr_multiple': 2.0,
        }
        self.last_rebalance = None
        self.position_entry_date = None

    def regime_filter(self, data: pd.DataFrame) -> bool:
        """
        Works in trending markets
        Avoid in high volatility/ranging periods
        """
        if len(data) < self.params['ranking_period']:
            return False

        # Calculate market regime using ADX-like logic
        # Higher momentum spread = trending market
        momentum = self._calculate_momentum(data)
        recent_momentum = momentum.iloc[-20:]

        # Good trending conditions if momentum is consistently positive or negative
        momentum_consistency = (
            (recent_momentum > 0).sum() >= 15 or
            (recent_momentum < 0).sum() >= 15
        )

        return momentum_consistency

    def _calculate_momentum(self, data: pd.DataFrame) -> pd.Series:
        """
        Calculate momentum as rate of change
        """
        period = self.params['momentum_period']
        momentum = data['close'].pct_change(period)
        return momentum

    def _calculate_momentum_score(self, data: pd.DataFrame) -> float:
        """
        Calculate comprehensive momentum score
        Combines multiple timeframes
        """
        # 20-day momentum (primary)
        momentum_20 = data['close'].pct_change(20).iloc[-1]

        # 60-day momentum (trend confirmation)
        momentum_60 = data['close'].pct_change(60).iloc[-1]

        # 5-day momentum (short-term)
        momentum_5 = data['close'].pct_change(5).iloc[-1]

        # Weighted score: 60% weight on 20-day, 30% on 60-day, 10% on 5-day
        score = (momentum_20 * 0.6) + (momentum_60 * 0.3) + (momentum_5 * 0.1)

        return score

    def _needs_rebalance(self, current_date) -> bool:
        """
        Check if rebalancing is needed
        """
        if self.last_rebalance is None:
            return True

        days_since_rebalance = (current_date - self.last_rebalance).days

        return days_since_rebalance >= self.params['rebalance_days']

    def setup_detected(self, data: pd.DataFrame) -> bool:
        """
        Setup detected when it's time to rebalance

        Note: In a real cross-sectional implementation, this would
        receive data for multiple assets and rank them. For single-asset
        backtesting, we check if the asset has strong momentum.
        """
        if len(data) < self.params['ranking_period']:
            return False

        # For single-asset mode, check if rebalancing is needed
        if hasattr(data.index[-1], 'date'):
            current_date = data.index[-1].date()
        else:
            current_date = pd.Timestamp.now().date()

        return self._needs_rebalance(current_date)

    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """
        Enter based on momentum ranking

        In single-asset mode:
        - LONG if momentum is in top 20% historically
        - SHORT if momentum is in bottom 20% historically
        """
        if not self.setup_detected(data):
            return None

        momentum_score = self._calculate_momentum_score(data)

        # Require minimum absolute momentum
        if abs(momentum_score) < self.params['min_momentum']:
            return None

        # Calculate historical momentum percentile
        momentum_series = data['close'].pct_change(20).dropna()
        recent_momentum = momentum_series.iloc[-self.params['ranking_period']:]

        percentile = (recent_momentum < momentum_score).sum() / len(recent_momentum) * 100

        # Top quintile - go LONG
        if percentile >= (100 - self.params['top_percentile']):
            if hasattr(data.index[-1], 'date'):
                self.last_rebalance = data.index[-1].date()
                self.position_entry_date = data.index[-1].date()
            return "LONG"

        # Bottom quintile - go SHORT
        if percentile <= self.params['bottom_percentile']:
            if hasattr(data.index[-1], 'date'):
                self.last_rebalance = data.index[-1].date()
                self.position_entry_date = data.index[-1].date()
            return "SHORT"

        return None

    def stop_logic(self, data: pd.DataFrame, direction: str) -> float:
        """
        Calculate stop loss based on volatility
        """
        # Calculate ATR for stop
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())

        true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = true_range.rolling(self.params['volatility_lookback']).mean().iloc[-1]

        entry = data['close'].iloc[-1]
        stop_distance = atr * self.params['stop_atr_multiple']

        if direction == "LONG":
            return entry - stop_distance
        else:  # SHORT
            return entry + stop_distance

    def target_logic(self, data: pd.DataFrame, direction: str) -> float:
        """
        Target is held until rebalancing
        Set wide target to avoid early exit
        """
        entry = data['close'].iloc[-1]

        # Set 15% target (wide enough to hold through rebalancing)
        if direction == "LONG":
            return entry * 1.15
        else:  # SHORT
            return entry * 0.85

    def exit_logic(self, data: pd.DataFrame, direction: str, entry_price: float) -> bool:
        """
        Exit if momentum reverses significantly before rebalancing
        """
        momentum_score = self._calculate_momentum_score(data)

        if direction == "LONG":
            # Exit if momentum drops below threshold
            if momentum_score < self.params['exit_momentum_threshold']:
                return True

        else:  # SHORT
            # Exit if momentum rises above threshold
            if momentum_score > abs(self.params['exit_momentum_threshold']):
                return True

        # Also exit if it's rebalancing time
        if hasattr(data.index[-1], 'date'):
            current_date = data.index[-1].date()
            if self._needs_rebalance(current_date):
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
        Equal weight positions across universe
        In single-asset mode, use 1% risk per trade
        """
        risk_amount = account_balance * self.params['risk_per_trade']
        risk_per_share = abs(entry - stop)

        if risk_per_share == 0:
            return 0

        shares = risk_amount / risk_per_share
        position_dollars = shares * entry

        # In cross-sectional mode, typically 5 positions (quintile)
        # So each position is ~20% of capital
        # Cap at 20% of account
        max_position = account_balance * 0.20
        if position_dollars > max_position:
            position_dollars = max_position

        return position_dollars

    def score_setup(self, data: pd.DataFrame, direction: str) -> int:
        """
        Score setup quality based on momentum strength and consistency
        """
        momentum_score = self._calculate_momentum_score(data)

        score = 50  # Base score

        # Stronger momentum = higher score
        abs_momentum = abs(momentum_score)
        if abs_momentum > 0.10:  # >10% momentum
            score += 30
        elif abs_momentum > 0.05:  # >5% momentum
            score += 20
        elif abs_momentum > 0.02:  # >2% momentum
            score += 10

        # Momentum consistency across timeframes
        momentum_20 = data['close'].pct_change(20).iloc[-1]
        momentum_60 = data['close'].pct_change(60).iloc[-1]

        if direction == "LONG":
            if momentum_20 > 0 and momentum_60 > 0:
                score += 15  # Both positive
        else:  # SHORT
            if momentum_20 < 0 and momentum_60 < 0:
                score += 15  # Both negative

        # Volume trend (increasing volume = stronger momentum)
        volume_ma = data['volume'].rolling(20).mean()
        volume_trend = volume_ma.iloc[-1] > volume_ma.iloc[-5]
        if volume_trend:
            score += 5

        return min(score, 100)

    def get_portfolio_signals(self, asset_data_dict: Dict[str, pd.DataFrame]) -> List[tuple]:
        """
        Cross-sectional ranking across multiple assets
        Returns list of (asset, direction) tuples

        Args:
            asset_data_dict: Dictionary of {asset_symbol: price_dataframe}

        Returns:
            List of (asset, direction) for positions to enter
        """
        rankings = []

        # Calculate momentum score for each asset
        for asset, data in asset_data_dict.items():
            if len(data) < self.params['ranking_period']:
                continue

            momentum = self._calculate_momentum_score(data)
            rankings.append((asset, momentum))

        # Sort by momentum
        rankings.sort(key=lambda x: x[1], reverse=True)

        # Calculate quintile sizes
        n_assets = len(rankings)
        top_n = max(1, int(n_assets * self.params['top_percentile'] / 100))
        bottom_n = max(1, int(n_assets * self.params['bottom_percentile'] / 100))

        # Generate signals
        signals = []

        # Long top quintile
        for i in range(top_n):
            asset, momentum = rankings[i]
            if momentum > self.params['min_momentum']:
                signals.append((asset, "LONG"))

        # Short bottom quintile
        for i in range(bottom_n):
            asset, momentum = rankings[-(i+1)]
            if abs(momentum) > self.params['min_momentum']:
                signals.append((asset, "SHORT"))

        return signals
