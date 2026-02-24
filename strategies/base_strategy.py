"""
Abstract base class for all trading strategies in ChuloBots.

All strategies must inherit from this class and implement the required methods.
"""

from abc import ABC, abstractmethod
from typing import Dict, Optional, Tuple
import pandas as pd
import numpy as np


class BaseStrategy(ABC):
    """
    Abstract base class for trading strategies.

    All methods must be implemented by concrete strategy classes.
    """

    def __init__(self, name: str, params: Optional[Dict] = None):
        """
        Initialize the strategy.

        Args:
            name: Strategy name
            params: Strategy parameters (hyperparameters)
        """
        self.name = name
        self.params = params or {}
        self.position = 0  # Current position: 0 (flat), 1 (long), -1 (short)
        self.entry_price = 0.0
        self.stop_price = 0.0
        self.target_price = 0.0

    @abstractmethod
    def regime_filter(self, data: pd.DataFrame) -> bool:
        """
        Determine if current market regime is suitable for this strategy.

        Args:
            data: DataFrame with OHLCV data and indicators

        Returns:
            True if regime is suitable, False otherwise

        Example:
            - Trend-following strategies may require strong trend
            - Mean reversion strategies may require range-bound market
        """
        pass

    @abstractmethod
    def setup_detected(self, data: pd.DataFrame) -> bool:
        """
        Detect if trading setup/pattern is present.

        Args:
            data: DataFrame with OHLCV data and indicators

        Returns:
            True if setup detected, False otherwise

        Example:
            - Bull flag pattern forming
            - RSI oversold condition
            - Support/resistance level approaching
        """
        pass

    @abstractmethod
    def entry_trigger(self, data: pd.DataFrame) -> Optional[str]:
        """
        Determine if entry conditions are met.

        Args:
            data: DataFrame with OHLCV data and indicators

        Returns:
            'LONG', 'SHORT', or None

        Note:
            This is called only after regime_filter() and setup_detected()
            both return True.
        """
        pass

    @abstractmethod
    def stop_logic(self, data: pd.DataFrame, entry_price: float) -> float:
        """
        Calculate stop loss price.

        Args:
            data: DataFrame with OHLCV data and indicators
            entry_price: Entry price for the position

        Returns:
            Stop loss price

        Example:
            - ATR-based stop
            - Support/resistance level
            - Fixed percentage stop
        """
        pass

    @abstractmethod
    def exit_logic(self, data: pd.DataFrame) -> Tuple[Optional[float], str]:
        """
        Determine exit target and reason.

        Args:
            data: DataFrame with OHLCV data and indicators

        Returns:
            Tuple of (target_price, reason)
            reason can be: 'target', 'trailing_stop', 'time_exit', etc.

        Example:
            - Take profit at resistance
            - Trailing stop adjustment
            - Time-based exit
        """
        pass

    @abstractmethod
    def position_size(
        self,
        account_balance: float,
        current_volatility: float,
        entry_price: float,
        stop_price: float,
    ) -> float:
        """
        Calculate position size based on risk management rules.

        Args:
            account_balance: Current account balance
            current_volatility: Current market volatility (e.g., ATR)
            entry_price: Planned entry price
            stop_price: Planned stop loss price

        Returns:
            Position size (in base currency or contracts)

        Note:
            Position sizing is critical and optimized during backtesting.
            This should never be overridden by the user.
        """
        pass

    @abstractmethod
    def score_setup(self, data: pd.DataFrame) -> float:
        """
        Score the quality of the current setup (0-100).

        Args:
            data: DataFrame with OHLCV data and indicators

        Returns:
            Confidence score from 0 to 100

        Example:
            - Strong trend + volatility expansion = 90
            - Weak trend + low volume = 40

        Note:
            This is used to filter signals by tier:
            - Bronze: >70%
            - Silver: >75%
            - Gold: >80%
            - Diamond: >85%
        """
        pass

    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate technical indicators needed for the strategy.

        Args:
            data: Raw OHLCV DataFrame

        Returns:
            DataFrame with added indicator columns

        Note:
            Override this method to add strategy-specific indicators.
            Default implementation returns data unchanged.
        """
        return data

    def validate_params(self) -> bool:
        """
        Validate strategy parameters.

        Returns:
            True if parameters are valid

        Raises:
            ValueError: If parameters are invalid
        """
        # Override in subclasses for specific validation
        return True

    def reset(self):
        """Reset strategy state (useful for backtesting)."""
        self.position = 0
        self.entry_price = 0.0
        self.stop_price = 0.0
        self.target_price = 0.0

    def get_info(self) -> Dict:
        """
        Get strategy information and current state.

        Returns:
            Dictionary with strategy details
        """
        return {
            "name": self.name,
            "params": self.params,
            "position": self.position,
            "entry_price": self.entry_price,
            "stop_price": self.stop_price,
            "target_price": self.target_price,
        }

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}', position={self.position})"
