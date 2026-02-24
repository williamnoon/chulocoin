use anyhow::{Context, Result};
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub wallet: WalletConfig,
    pub network: NetworkConfig,
    pub contracts: ContractsConfig,
    #[serde(default)]
    pub mining: MiningConfig,
    #[serde(default)]
    pub ui: UiConfig,
}

#[derive(Debug, Deserialize, Clone)]
pub struct WalletConfig {
    #[serde(default)]
    pub private_key: String,
    #[serde(default = "default_private_key_env")]
    pub private_key_env: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct NetworkConfig {
    pub rpc_url: String,
    pub chain_id: u64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ContractsConfig {
    pub chulo_address: String,
    pub signal_registry_address: String,
    #[serde(default)]
    pub validator_staking_address: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct MiningConfig {
    #[serde(default)]
    pub auto_start: bool,
    #[serde(default = "default_validation_threshold")]
    pub validation_threshold: f64,
    #[serde(default)]
    pub max_signals: u64,
    #[serde(default = "default_poll_interval")]
    pub poll_interval: u64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UiConfig {
    #[serde(default = "default_true")]
    pub colors: bool,
    #[serde(default = "default_refresh_rate")]
    pub refresh_rate: u64,
    #[serde(default)]
    pub debug: bool,
}

fn default_private_key_env() -> String {
    "CHULO_PRIVATE_KEY".to_string()
}

fn default_validation_threshold() -> f64 {
    0.8
}

fn default_poll_interval() -> u64 {
    5
}

fn default_refresh_rate() -> u64 {
    100
}

fn default_true() -> bool {
    true
}

impl Default for MiningConfig {
    fn default() -> Self {
        Self {
            auto_start: false,
            validation_threshold: default_validation_threshold(),
            max_signals: 0,
            poll_interval: default_poll_interval(),
        }
    }
}

impl Default for UiConfig {
    fn default() -> Self {
        Self {
            colors: true,
            refresh_rate: default_refresh_rate(),
            debug: false,
        }
    }
}

impl Config {
    /// Load config from the default location
    pub fn load() -> Result<Self> {
        let config_path = Self::default_path()?;
        Self::load_from_path(&config_path)
    }

    /// Load config from a specific path
    pub fn load_from_path(path: &PathBuf) -> Result<Self> {
        let content = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read config file: {}", path.display()))?;

        let config: Config = toml::from_str(&content)
            .with_context(|| "Failed to parse config file")?;

        Ok(config)
    }

    /// Get the default config path based on OS
    pub fn default_path() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .context("Failed to get config directory")?;

        let app_config_dir = config_dir.join("chulobots");
        let config_file = app_config_dir.join("config.toml");

        Ok(config_file)
    }

    /// Get the private key from config or environment variable
    pub fn get_private_key(&self) -> Result<String> {
        if !self.wallet.private_key.is_empty() {
            return Ok(self.wallet.private_key.clone());
        }

        // Try to get from environment variable
        let env_var = &self.wallet.private_key_env;
        std::env::var(env_var)
            .with_context(|| format!(
                "Private key not found in config or environment variable '{}'",
                env_var
            ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config_values() {
        let mining = MiningConfig::default();
        assert_eq!(mining.validation_threshold, 0.8);
        assert_eq!(mining.poll_interval, 5);

        let ui = UiConfig::default();
        assert!(ui.colors);
        assert_eq!(ui.refresh_rate, 100);
    }
}
