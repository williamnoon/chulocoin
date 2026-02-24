use anyhow::Result;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tokio::time;
use tracing::{debug, error, info, warn};

use super::config::MiningConfig;
use super::market_data::MarketDataFetcher;
use super::strategy::{Signal, StrategyExecutor};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MiningStatus {
    Active,
    Paused,
}

#[derive(Debug, Clone)]
pub struct MiningStats {
    pub signals_processed: u64,
    pub signals_validated: u64,
    pub signals_rejected: u64,
    pub uptime: Duration,
    pub earnings_today: f64,
    pub earnings_total: f64,
    pub last_check: Option<Instant>,
    pub last_signal: Option<String>,
}

impl Default for MiningStats {
    fn default() -> Self {
        Self {
            signals_processed: 0,
            signals_validated: 0,
            signals_rejected: 0,
            uptime: Duration::from_secs(0),
            earnings_today: 0.0,
            earnings_total: 0.0,
            last_check: None,
            last_signal: None,
        }
    }
}

/// Mining engine that orchestrates strategy execution and signal submission
pub struct MiningEngine {
    status: MiningStatus,
    stats: Arc<RwLock<MiningStats>>,
    start_time: Option<Instant>,
    config: MiningConfig,
    market_data_fetcher: MarketDataFetcher,
    strategy_executor: StrategyExecutor,
}

impl MiningEngine {
    pub fn new(config: MiningConfig) -> Self {
        let market_data_fetcher = MarketDataFetcher::new(config.market_data_source.clone());
        let strategy_executor = StrategyExecutor::new(config.clone());

        Self {
            status: MiningStatus::Paused,
            stats: Arc::new(RwLock::new(MiningStats::default())),
            start_time: None,
            config,
            market_data_fetcher,
            strategy_executor,
        }
    }

    pub fn start(&mut self) {
        if self.status == MiningStatus::Paused {
            self.status = MiningStatus::Active;
            self.start_time = Some(Instant::now());
            info!("Mining started");
        }
    }

    pub fn stop(&mut self) {
        if self.status == MiningStatus::Active {
            self.status = MiningStatus::Paused;
            info!("Mining stopped");
        }
    }

    pub fn toggle(&mut self) {
        match self.status {
            MiningStatus::Active => self.stop(),
            MiningStatus::Paused => self.start(),
        }
    }

    pub fn status(&self) -> MiningStatus {
        self.status
    }

    pub async fn stats(&self) -> MiningStats {
        self.stats.read().await.clone()
    }

    pub fn is_active(&self) -> bool {
        self.status == MiningStatus::Active
    }

    /// Main mining loop - should be run in a background task
    pub async fn run_mining_loop(
        status: Arc<RwLock<MiningStatus>>,
        stats: Arc<RwLock<MiningStats>>,
        config: MiningConfig,
    ) {
        info!("Mining loop started");

        let market_data_fetcher = MarketDataFetcher::new(config.market_data_source.clone());
        let strategy_executor = StrategyExecutor::new(config.clone());

        let check_interval = Duration::from_secs(config.check_interval_seconds);
        let mut interval = time::interval(check_interval);

        loop {
            interval.tick().await;

            // Check if mining is active
            let is_active = *status.read().await == MiningStatus::Active;
            if !is_active {
                debug!("Mining paused, skipping check");
                continue;
            }

            // Update last check time
            {
                let mut stats_guard = stats.write().await;
                stats_guard.last_check = Some(Instant::now());
            }

            info!("Running mining check...");

            // Fetch market data for all monitored assets
            for asset in &config.monitored_assets {
                match market_data_fetcher.fetch(asset).await {
                    Ok(market_data) => {
                        info!(
                            "Fetched {} candles for {}",
                            market_data.candles.len(),
                            asset
                        );

                        // Run strategies against this market data
                        let signals = strategy_executor.run_all_strategies(&market_data);

                        if !signals.is_empty() {
                            info!("Generated {} signals for {}", signals.len(), asset);

                            // Process each signal
                            for signal in signals {
                                let mut stats_guard = stats.write().await;
                                stats_guard.signals_processed += 1;

                                // TODO: Submit signal to blockchain
                                // For now, simulate submission
                                match Self::submit_signal_to_chain(&signal).await {
                                    Ok(()) => {
                                        stats_guard.signals_validated += 1;
                                        stats_guard.last_signal = Some(format!(
                                            "{} {} on {} (confidence: {:.1}%)",
                                            signal.direction,
                                            signal.strategy,
                                            signal.asset,
                                            signal.confidence
                                        ));

                                        // Simulate earnings (replace with actual blockchain events)
                                        let reward = 0.5;
                                        stats_guard.earnings_today += reward;
                                        stats_guard.earnings_total += reward;

                                        info!("Signal validated and submitted: {:?}", signal);
                                    }
                                    Err(e) => {
                                        stats_guard.signals_rejected += 1;
                                        error!("Signal submission failed: {}", e);
                                    }
                                }
                            }
                        } else {
                            debug!("No signals generated for {}", asset);
                        }
                    }
                    Err(e) => {
                        error!("Failed to fetch market data for {}: {}", asset, e);
                    }
                }
            }

            info!("Mining check completed");

            // Check max signals limit
            let stats_guard = stats.read().await;
            if config.max_signals > 0 && stats_guard.signals_validated >= config.max_signals {
                warn!("Max signals limit reached, stopping mining");
                let mut status_guard = status.write().await;
                *status_guard = MiningStatus::Paused;
            }
        }
    }

    /// Submit signal to blockchain (stub for now)
    async fn submit_signal_to_chain(signal: &Signal) -> Result<()> {
        // TODO: Implement actual blockchain submission
        // This will:
        // 1. Connect to SignalRegistry contract
        // 2. Format signal data
        // 3. Submit transaction
        // 4. Wait for confirmation
        // 5. Listen for validation events

        debug!("Submitting signal to blockchain: {:?}", signal);

        // Simulate network delay
        tokio::time::sleep(Duration::from_millis(100)).await;

        // For MVP, always succeed
        Ok(())
    }

    /// Update uptime and stats (called from UI loop)
    pub async fn update(&mut self) {
        // Update uptime
        if let Some(start) = self.start_time {
            if self.status == MiningStatus::Active {
                let mut stats_guard = self.stats.write().await;
                stats_guard.uptime = start.elapsed();
            }
        }
    }

    /// Get a reference to the stats for reading
    pub fn stats_ref(&self) -> Arc<RwLock<MiningStats>> {
        Arc::clone(&self.stats)
    }
}

impl Default for MiningEngine {
    fn default() -> Self {
        Self::new(MiningConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mining_engine_starts_paused() {
        let config = MiningConfig::default();
        let engine = MiningEngine::new(config);
        assert_eq!(engine.status(), MiningStatus::Paused);
    }

    #[test]
    fn test_mining_engine_toggle() {
        let config = MiningConfig::default();
        let mut engine = MiningEngine::new(config);
        assert_eq!(engine.status(), MiningStatus::Paused);

        engine.toggle();
        assert_eq!(engine.status(), MiningStatus::Active);

        engine.toggle();
        assert_eq!(engine.status(), MiningStatus::Paused);
    }

    #[tokio::test]
    async fn test_mining_stats_default() {
        let config = MiningConfig::default();
        let engine = MiningEngine::new(config);
        let stats = engine.stats().await;
        assert_eq!(stats.signals_processed, 0);
        assert_eq!(stats.signals_validated, 0);
        assert_eq!(stats.signals_rejected, 0);
        assert_eq!(stats.earnings_today, 0.0);
    }
}
