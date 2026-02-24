"""
Monte Carlo Simulation for Strategy Robustness Testing

Runs thousands of simulations with randomized parameters to:
1. Test parameter sensitivity
2. Calculate confidence intervals
3. Assess strategy robustness
4. Identify parameter overfitting
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
import multiprocessing as mp
from functools import partial


@dataclass
class MonteCarloConfig:
    """Configuration for Monte Carlo simulation"""
    n_simulations: int = 10000
    param_ranges: Dict[str, tuple] = None  # {param_name: (min, max)}
    confidence_level: float = 0.95
    parallel: bool = True
    n_cores: int = mp.cpu_count() - 1


@dataclass
class MonteCarloResult:
    """Results from Monte Carlo simulation"""
    simulations: List[Dict[str, Any]]
    best_params: Dict[str, Any]
    worst_params: Dict[str, Any]
    mean_metrics: Dict[str, float]
    std_metrics: Dict[str, float]
    confidence_intervals: Dict[str, tuple]
    percentiles: Dict[str, Dict[float, float]]
    parameter_sensitivity: Dict[str, float]


class MonteCarloSimulator:
    """
    Monte Carlo simulator for strategy backtesting
    """

    def __init__(self, config: MonteCarloConfig = None):
        self.config = config or MonteCarloConfig()

    def _randomize_parameters(self, param_ranges: Dict[str, tuple]) -> Dict[str, Any]:
        """
        Generate random parameters within specified ranges
        """
        params = {}

        for param_name, (min_val, max_val) in param_ranges.items():
            if isinstance(min_val, int) and isinstance(max_val, int):
                # Integer parameter
                params[param_name] = np.random.randint(min_val, max_val + 1)
            else:
                # Float parameter
                params[param_name] = np.random.uniform(min_val, max_val)

        return params

    def _run_single_simulation(
        self,
        sim_id: int,
        backtest_func: Callable,
        data: pd.DataFrame,
        param_ranges: Dict[str, tuple],
        fixed_params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Run a single simulation with randomized parameters
        """
        # Generate random parameters
        random_params = self._randomize_parameters(param_ranges)

        # Merge with fixed parameters
        if fixed_params:
            all_params = {**fixed_params, **random_params}
        else:
            all_params = random_params

        # Run backtest with these parameters
        try:
            result = backtest_func(data, all_params)

            return {
                'sim_id': sim_id,
                'params': random_params,
                'metrics': result,
                'success': True
            }
        except Exception as e:
            return {
                'sim_id': sim_id,
                'params': random_params,
                'error': str(e),
                'success': False
            }

    def run(
        self,
        backtest_func: Callable,
        data: pd.DataFrame,
        param_ranges: Dict[str, tuple] = None,
        fixed_params: Dict[str, Any] = None
    ) -> MonteCarloResult:
        """
        Run Monte Carlo simulation

        Args:
            backtest_func: Function that runs backtest and returns metrics
                          Should accept (data, params) and return dict of metrics
            data: Price data for backtesting
            param_ranges: Dict of parameter ranges {param: (min, max)}
            fixed_params: Dict of fixed parameters that won't be randomized

        Returns:
            MonteCarloResult with aggregated statistics
        """
        param_ranges = param_ranges or self.config.param_ranges
        if param_ranges is None:
            raise ValueError("Must provide param_ranges")

        n_sims = self.config.n_simulations

        print(f"Running {n_sims} Monte Carlo simulations...")

        # Run simulations
        if self.config.parallel:
            # Parallel execution
            run_func = partial(
                self._run_single_simulation,
                backtest_func=backtest_func,
                data=data,
                param_ranges=param_ranges,
                fixed_params=fixed_params
            )

            with mp.Pool(self.config.n_cores) as pool:
                results = pool.map(run_func, range(n_sims))
        else:
            # Sequential execution
            results = []
            for i in range(n_sims):
                if i % 1000 == 0:
                    print(f"  Completed {i}/{n_sims} simulations...")

                result = self._run_single_simulation(
                    i, backtest_func, data, param_ranges, fixed_params
                )
                results.append(result)

        # Filter successful runs
        successful_results = [r for r in results if r['success']]
        print(f"Successful simulations: {len(successful_results)}/{n_sims}")

        if len(successful_results) == 0:
            raise RuntimeError("No successful simulations")

        # Analyze results
        return self._analyze_results(successful_results, param_ranges)

    def _analyze_results(
        self,
        results: List[Dict],
        param_ranges: Dict[str, tuple]
    ) -> MonteCarloResult:
        """
        Analyze simulation results and compute statistics
        """
        # Extract metrics from all simulations
        all_metrics = {}
        metric_names = list(results[0]['metrics'].keys())

        for metric_name in metric_names:
            all_metrics[metric_name] = [
                r['metrics'][metric_name]
                for r in results
                if metric_name in r['metrics']
            ]

        # Calculate mean and std
        mean_metrics = {
            name: np.mean(values)
            for name, values in all_metrics.items()
        }

        std_metrics = {
            name: np.std(values)
            for name, values in all_metrics.items()
        }

        # Calculate confidence intervals
        alpha = 1 - self.config.confidence_level
        confidence_intervals = {}

        for name, values in all_metrics.items():
            lower = np.percentile(values, alpha/2 * 100)
            upper = np.percentile(values, (1 - alpha/2) * 100)
            confidence_intervals[name] = (lower, upper)

        # Calculate percentiles
        percentiles_to_compute = [5, 10, 25, 50, 75, 90, 95]
        percentiles = {}

        for name, values in all_metrics.items():
            percentiles[name] = {
                p: np.percentile(values, p)
                for p in percentiles_to_compute
            }

        # Find best and worst performing parameters
        # Use Sharpe ratio if available, otherwise use total return
        if 'sharpe_ratio' in mean_metrics:
            performance_metric = 'sharpe_ratio'
        elif 'total_return' in mean_metrics:
            performance_metric = 'total_return'
        else:
            performance_metric = metric_names[0]

        performance_values = [r['metrics'][performance_metric] for r in results]
        best_idx = np.argmax(performance_values)
        worst_idx = np.argmin(performance_values)

        best_params = results[best_idx]['params']
        worst_params = results[worst_idx]['params']

        # Calculate parameter sensitivity
        parameter_sensitivity = self._calculate_parameter_sensitivity(
            results, param_ranges, performance_metric
        )

        return MonteCarloResult(
            simulations=results,
            best_params=best_params,
            worst_params=worst_params,
            mean_metrics=mean_metrics,
            std_metrics=std_metrics,
            confidence_intervals=confidence_intervals,
            percentiles=percentiles,
            parameter_sensitivity=parameter_sensitivity
        )

    def _calculate_parameter_sensitivity(
        self,
        results: List[Dict],
        param_ranges: Dict[str, tuple],
        performance_metric: str
    ) -> Dict[str, float]:
        """
        Calculate sensitivity of performance to each parameter
        Using correlation between parameter value and performance
        """
        sensitivity = {}

        for param_name in param_ranges.keys():
            param_values = [r['params'][param_name] for r in results]
            performance_values = [r['metrics'][performance_metric] for r in results]

            # Calculate correlation
            correlation = np.corrcoef(param_values, performance_values)[0, 1]
            sensitivity[param_name] = abs(correlation)  # Use absolute value

        return sensitivity

    def print_summary(self, result: MonteCarloResult):
        """
        Print summary of Monte Carlo results
        """
        print("\n" + "="*60)
        print("MONTE CARLO SIMULATION SUMMARY")
        print("="*60)

        print(f"\nTotal Simulations: {len(result.simulations)}")

        print("\n--- Mean Metrics ---")
        for name, value in result.mean_metrics.items():
            std = result.std_metrics[name]
            ci_low, ci_high = result.confidence_intervals[name]
            print(f"{name:20s}: {value:8.4f} ± {std:8.4f}")
            print(f"{'':20s}  95% CI: [{ci_low:8.4f}, {ci_high:8.4f}]")

        print("\n--- Best Parameters ---")
        for name, value in result.best_params.items():
            print(f"{name:20s}: {value}")

        print("\n--- Worst Parameters ---")
        for name, value in result.worst_params.items():
            print(f"{name:20s}: {value}")

        print("\n--- Parameter Sensitivity ---")
        print("(Higher = more impact on performance)")
        sorted_sensitivity = sorted(
            result.parameter_sensitivity.items(),
            key=lambda x: x[1],
            reverse=True
        )
        for name, sensitivity in sorted_sensitivity:
            print(f"{name:20s}: {sensitivity:6.4f}")

        print("\n--- Performance Distribution ---")
        # Assuming sharpe_ratio or total_return exists
        perf_metric = 'sharpe_ratio' if 'sharpe_ratio' in result.percentiles else list(result.percentiles.keys())[0]

        for percentile, value in result.percentiles[perf_metric].items():
            print(f"P{percentile:2.0f}: {value:8.4f}")

        print("="*60 + "\n")


def example_usage():
    """
    Example of how to use Monte Carlo simulation
    """
    # Mock backtest function
    def mock_backtest(data: pd.DataFrame, params: Dict) -> Dict:
        """
        Mock backtest function for demonstration
        """
        # Simulate some metrics based on parameters
        # In reality, this would run actual backtest
        sharpe = params['risk_per_trade'] * 20 + np.random.normal(0, 0.5)
        total_return = params['stop_multiplier'] * 0.15 + np.random.normal(0, 0.1)
        win_rate = 0.5 + (params['risk_per_trade'] - 0.015) * 10 + np.random.normal(0, 0.05)

        return {
            'sharpe_ratio': sharpe,
            'total_return': total_return,
            'win_rate': min(max(win_rate, 0), 1)
        }

    # Define parameter ranges
    param_ranges = {
        'risk_per_trade': (0.005, 0.02),  # 0.5% to 2%
        'stop_multiplier': (1.5, 3.0),
        'lookback_period': (10, 30)
    }

    # Create mock data
    dates = pd.date_range('2020-01-01', '2023-01-01', freq='D')
    mock_data = pd.DataFrame({
        'close': np.random.randn(len(dates)).cumsum() + 100,
        'high': np.random.randn(len(dates)).cumsum() + 102,
        'low': np.random.randn(len(dates)).cumsum() + 98,
        'volume': np.random.randint(1000000, 10000000, len(dates))
    }, index=dates)

    # Run Monte Carlo simulation
    config = MonteCarloConfig(
        n_simulations=1000,
        param_ranges=param_ranges,
        parallel=False  # Set to True for faster execution
    )

    simulator = MonteCarloSimulator(config)
    result = simulator.run(mock_backtest, mock_data, param_ranges)

    # Print summary
    simulator.print_summary(result)

    return result


if __name__ == '__main__':
    example_usage()
