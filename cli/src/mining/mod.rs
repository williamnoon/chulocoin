use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MiningStatus {
    Active,
    Paused,
}

#[derive(Debug)]
pub struct MiningStats {
    pub signals_processed: u64,
    pub signals_validated: u64,
    pub signals_rejected: u64,
    pub uptime: Duration,
    pub earnings_today: f64,
    pub earnings_total: f64,
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
        }
    }
}

#[derive(Debug)]
pub struct MiningEngine {
    status: MiningStatus,
    stats: MiningStats,
    start_time: Option<Instant>,
}

impl MiningEngine {
    pub fn new() -> Self {
        Self {
            status: MiningStatus::Paused,
            stats: MiningStats::default(),
            start_time: None,
        }
    }

    pub fn start(&mut self) {
        if self.status == MiningStatus::Paused {
            self.status = MiningStatus::Active;
            self.start_time = Some(Instant::now());
        }
    }

    pub fn stop(&mut self) {
        self.status = MiningStatus::Paused;
    }

    pub fn toggle(&mut self) {
        match self.status {
            MiningStatus::Active => self.stop(),
            MiningStatus::Paused => self.start(),
        }
    }

    pub fn update(&mut self) {
        // Update uptime
        if let Some(start) = self.start_time {
            if self.status == MiningStatus::Active {
                self.stats.uptime = start.elapsed();

                // Simulate mining activity (stub)
                // In production, this will connect to the backend and process real signals
                if self.stats.uptime.as_secs() % 10 == 0 {
                    self.stats.signals_processed += 1;

                    // Simulate 80% validation rate
                    if self.stats.signals_processed % 5 != 0 {
                        self.stats.signals_validated += 1;
                        self.stats.earnings_today += 0.5;
                        self.stats.earnings_total += 0.5;
                    } else {
                        self.stats.signals_rejected += 1;
                    }
                }
            }
        }
    }

    pub fn status(&self) -> MiningStatus {
        self.status
    }

    pub fn stats(&self) -> &MiningStats {
        &self.stats
    }

    pub fn is_active(&self) -> bool {
        self.status == MiningStatus::Active
    }
}

impl Default for MiningEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mining_engine_starts_paused() {
        let engine = MiningEngine::new();
        assert_eq!(engine.status(), MiningStatus::Paused);
    }

    #[test]
    fn test_mining_engine_toggle() {
        let mut engine = MiningEngine::new();
        assert_eq!(engine.status(), MiningStatus::Paused);

        engine.toggle();
        assert_eq!(engine.status(), MiningStatus::Active);

        engine.toggle();
        assert_eq!(engine.status(), MiningStatus::Paused);
    }

    #[test]
    fn test_mining_stats_default() {
        let stats = MiningStats::default();
        assert_eq!(stats.signals_processed, 0);
        assert_eq!(stats.signals_validated, 0);
        assert_eq!(stats.signals_rejected, 0);
        assert_eq!(stats.earnings_today, 0.0);
    }
}
