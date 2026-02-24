use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MiningConfig {
    /// Auto-start mining on launch
    #[serde(default)]
    pub auto_start: bool,

    /// Minimum validation confidence threshold (0.0 - 1.0)
    #[serde(default = "default_validation_threshold")]
    pub validation_threshold: f64,

    /// Maximum signals to process per session (0 = unlimited)
    #[serde(default)]
    pub max_signals: u64,

    /// Polling interval in seconds
    #[serde(default = "default_poll_interval")]
    pub poll_interval: u64,

    /// Enabled strategies
    #[serde(default = "default_strategies")]
    pub enabled_strategies: Vec<String>,

    /// Check interval in seconds
    #[serde(default = "default_check_interval")]
    pub check_interval_seconds: u64,

    /// Python executable path
    #[serde(default = "default_python_path")]
    pub python_path: String,

    /// Strategies directory
    #[serde(default = "default_strategies_dir")]
    pub strategies_dir: String,

    /// Market data source
    #[serde(default = "default_market_data_source")]
    pub market_data_source: String,

    /// Monitored assets
    #[serde(default = "default_monitored_assets")]
    pub monitored_assets: Vec<String>,
}

impl Default for MiningConfig {
    fn default() -> Self {
        Self {
            auto_start: false,
            validation_threshold: default_validation_threshold(),
            max_signals: 0,
            poll_interval: default_poll_interval(),
            enabled_strategies: default_strategies(),
            check_interval_seconds: default_check_interval(),
            python_path: default_python_path(),
            strategies_dir: default_strategies_dir(),
            market_data_source: default_market_data_source(),
            monitored_assets: default_monitored_assets(),
        }
    }
}

fn default_validation_threshold() -> f64 {
    0.8
}

fn default_poll_interval() -> u64 {
    5
}

fn default_check_interval() -> u64 {
    300
}

fn default_strategies() -> Vec<String> {
    vec!["bull_flag".to_string(), "rsi_oversold".to_string()]
}

fn default_python_path() -> String {
    "python3".to_string()
}

fn default_strategies_dir() -> String {
    "../strategies".to_string()
}

fn default_market_data_source() -> String {
    "coingecko".to_string()
}

fn default_monitored_assets() -> Vec<String> {
    vec!["bitcoin".to_string(), "ethereum".to_string()]
}

impl MiningConfig {
    /// Get the full path to the strategies directory
    pub fn strategies_path(&self) -> PathBuf {
        PathBuf::from(&self.strategies_dir)
    }

    /// Get the path to the strategy CLI script
    pub fn strategy_cli_path(&self) -> PathBuf {
        self.strategies_path().join("run_strategy_cli.py")
    }
}
