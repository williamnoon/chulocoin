use std::time::Instant;

#[derive(Debug, Clone)]
pub struct WalletInfo {
    pub address: String,
    pub chulo_balance: f64,
    pub tier: String,
    pub tier_level: u8,
}

impl Default for WalletInfo {
    fn default() -> Self {
        Self {
            address: "Not Connected".to_string(),
            chulo_balance: 0.0,
            tier: "Free".to_string(),
            tier_level: 0,
        }
    }
}

#[derive(Debug)]
pub struct BlockchainClient {
    wallet: WalletInfo,
    last_update: Option<Instant>,
    is_connected: bool,
}

impl BlockchainClient {
    pub fn new() -> Self {
        Self {
            wallet: WalletInfo::default(),
            last_update: None,
            is_connected: false,
        }
    }

    /// Connect to wallet (stub for now)
    pub async fn connect(&mut self, private_key: &str) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement actual wallet connection using ethers-rs
        // This will connect to Arbitrum One and fetch wallet details

        // Stub implementation
        self.wallet = WalletInfo {
            address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb".to_string(),
            chulo_balance: 1500.0,
            tier: "Builder".to_string(),
            tier_level: 2,
        };
        self.is_connected = true;
        self.last_update = Some(Instant::now());

        Ok(())
    }

    /// Fetch CHULO balance from contract
    pub async fn fetch_balance(&mut self) -> Result<f64, Box<dyn std::error::Error>> {
        // TODO: Implement actual balance fetching
        // This will call the CHULO ERC-20 contract balanceOf method

        if !self.is_connected {
            return Err("Wallet not connected".into());
        }

        // Stub implementation
        self.last_update = Some(Instant::now());
        Ok(self.wallet.chulo_balance)
    }

    /// Determine tier based on CHULO balance
    pub fn calculate_tier(balance: f64) -> (String, u8) {
        if balance >= 50_000.0 {
            ("Whale".to_string(), 4)
        } else if balance >= 10_000.0 {
            ("Pro".to_string(), 3)
        } else if balance >= 1_000.0 {
            ("Builder".to_string(), 2)
        } else if balance >= 100.0 {
            ("Starter".to_string(), 1)
        } else {
            ("Free".to_string(), 0)
        }
    }

    /// Update tier based on current balance
    pub fn update_tier(&mut self) {
        let (tier, level) = Self::calculate_tier(self.wallet.chulo_balance);
        self.wallet.tier = tier;
        self.wallet.tier_level = level;
    }

    /// Refresh balance (synchronous wrapper)
    pub fn refresh_balance(&mut self) {
        // Trigger async balance fetch
        // In production, this will spawn a task
        self.last_update = Some(Instant::now());
    }

    pub fn wallet(&self) -> &WalletInfo {
        &self.wallet
    }

    pub fn is_connected(&self) -> bool {
        self.is_connected
    }

    pub fn time_since_update(&self) -> Option<std::time::Duration> {
        self.last_update.map(|t| t.elapsed())
    }
}

impl Default for BlockchainClient {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_tier_whale() {
        let (tier, level) = BlockchainClient::calculate_tier(50_000.0);
        assert_eq!(tier, "Whale");
        assert_eq!(level, 4);
    }

    #[test]
    fn test_calculate_tier_pro() {
        let (tier, level) = BlockchainClient::calculate_tier(10_000.0);
        assert_eq!(tier, "Pro");
        assert_eq!(level, 3);
    }

    #[test]
    fn test_calculate_tier_builder() {
        let (tier, level) = BlockchainClient::calculate_tier(1_000.0);
        assert_eq!(tier, "Builder");
        assert_eq!(level, 2);
    }

    #[test]
    fn test_calculate_tier_starter() {
        let (tier, level) = BlockchainClient::calculate_tier(100.0);
        assert_eq!(tier, "Starter");
        assert_eq!(level, 1);
    }

    #[test]
    fn test_calculate_tier_free() {
        let (tier, level) = BlockchainClient::calculate_tier(50.0);
        assert_eq!(tier, "Free");
        assert_eq!(level, 0);
    }

    #[test]
    fn test_blockchain_client_starts_disconnected() {
        let client = BlockchainClient::new();
        assert!(!client.is_connected());
    }
}
