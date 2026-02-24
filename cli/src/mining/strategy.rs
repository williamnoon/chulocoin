use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tempfile::NamedTempFile;
use tracing::{debug, error, info, warn};

use super::config::MiningConfig;
use super::market_data::MarketData;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signal {
    pub asset: String,
    pub direction: String,
    pub entry_price: f64,
    pub stop_loss: f64,
    pub take_profit: f64,
    pub confidence: f64,
    pub strategy: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StrategyResult {
    pub should_enter: bool,
    #[serde(default)]
    pub asset: String,
    #[serde(default)]
    pub direction: String,
    #[serde(default)]
    pub entry_price: f64,
    #[serde(default)]
    pub stop_loss: f64,
    #[serde(default)]
    pub take_profit: f64,
    #[serde(default)]
    pub confidence: f64,
    #[serde(default)]
    pub reason: String,
    #[serde(default)]
    pub error: Option<String>,
}

/// Strategy executor that runs Python strategies via subprocess
pub struct StrategyExecutor {
    config: MiningConfig,
}

impl StrategyExecutor {
    pub fn new(config: MiningConfig) -> Self {
        Self { config }
    }

    /// Run a strategy against market data
    pub fn run_strategy(
        &self,
        strategy_name: &str,
        market_data: &MarketData,
    ) -> Result<Option<Signal>> {
        // Create temporary file for market data
        let temp_file = NamedTempFile::new()
            .context("Failed to create temporary file for market data")?;

        let temp_path = temp_file.path().to_path_buf();

        // Save market data to CSV
        market_data
            .save_to_csv(&temp_path)
            .context("Failed to save market data to CSV")?;

        // Get path to Python strategy CLI script
        let strategy_cli = self.config.strategy_cli_path();

        if !strategy_cli.exists() {
            anyhow::bail!(
                "Strategy CLI script not found at: {}",
                strategy_cli.display()
            );
        }

        debug!(
            "Running strategy '{}' with data from {}",
            strategy_name,
            temp_path.display()
        );

        // Run Python strategy
        let output = Command::new(&self.config.python_path)
            .arg(strategy_cli.to_str().unwrap())
            .arg("--strategy")
            .arg(strategy_name)
            .arg("--data")
            .arg(temp_path.to_str().unwrap())
            .output()
            .context("Failed to execute strategy")?;

        // Parse output
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            debug!("Strategy output: {}", stdout);

            let result: StrategyResult = serde_json::from_str(&stdout)
                .context("Failed to parse strategy output as JSON")?;

            if result.should_enter {
                // Filter by confidence threshold
                if result.confidence < self.config.validation_threshold * 100.0 {
                    info!(
                        "Signal from {} rejected: confidence {} < threshold {}",
                        strategy_name,
                        result.confidence,
                        self.config.validation_threshold * 100.0
                    );
                    return Ok(None);
                }

                let signal = Signal {
                    asset: result.asset,
                    direction: result.direction,
                    entry_price: result.entry_price,
                    stop_loss: result.stop_loss,
                    take_profit: result.take_profit,
                    confidence: result.confidence,
                    strategy: strategy_name.to_string(),
                    reason: result.reason,
                };

                info!(
                    "Signal generated: {} {} on {} (confidence: {:.1}%)",
                    signal.direction, signal.strategy, signal.asset, signal.confidence
                );

                return Ok(Some(signal));
            } else {
                debug!(
                    "No signal from {}: {}",
                    strategy_name,
                    result.reason.as_deref().unwrap_or("unknown reason")
                );
                return Ok(None);
            }
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!(
                "Strategy execution failed for {}: {}",
                strategy_name, stderr
            );
            anyhow::bail!("Strategy execution failed: {}", stderr);
        }
    }

    /// Run all enabled strategies against market data
    pub fn run_all_strategies(
        &self,
        market_data: &MarketData,
    ) -> Vec<Signal> {
        let mut signals = Vec::new();

        for strategy_name in &self.config.enabled_strategies {
            match self.run_strategy(strategy_name, market_data) {
                Ok(Some(signal)) => {
                    signals.push(signal);
                }
                Ok(None) => {
                    // No signal generated, continue
                }
                Err(e) => {
                    warn!("Error running strategy {}: {}", strategy_name, e);
                }
            }
        }

        signals
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_strategy_executor_creation() {
        let config = MiningConfig::default();
        let executor = StrategyExecutor::new(config);
        assert!(!executor.config.enabled_strategies.is_empty());
    }

    #[test]
    fn test_signal_serialization() {
        let signal = Signal {
            asset: "BTC".to_string(),
            direction: "LONG".to_string(),
            entry_price: 50000.0,
            stop_loss: 48000.0,
            take_profit: 54000.0,
            confidence: 85.0,
            strategy: "bull_flag".to_string(),
            reason: "Bull flag breakout".to_string(),
        };

        let json = serde_json::to_string(&signal).unwrap();
        assert!(json.contains("BTC"));
        assert!(json.contains("LONG"));
    }
}
