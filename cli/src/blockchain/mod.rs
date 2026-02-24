use ethers::prelude::*;
use std::sync::Arc;
use std::time::Instant;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum BlockchainError {
    #[error("Wallet not connected")]
    NotConnected,
    #[error("Invalid private key: {0}")]
    InvalidPrivateKey(String),
    #[error("RPC connection error: {0}")]
    RpcError(String),
    #[error("Contract call failed: {0}")]
    ContractError(String),
    #[error("Insufficient balance for gas: required {required}, have {available}")]
    InsufficientBalance { required: f64, available: f64 },
    #[error("Transaction failed: {0}")]
    TransactionFailed(String),
}

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

// Type aliases for cleaner code
type Provider = Provider<Http>;
type Wallet = LocalWallet;
type Client = SignerMiddleware<Provider, Wallet>;

pub struct BlockchainClient {
    wallet_info: WalletInfo,
    last_update: Option<Instant>,
    is_connected: bool,
    provider: Option<Arc<Provider>>,
    client: Option<Arc<Client>>,
    chulo_address: Option<Address>,
    signal_registry_address: Option<Address>,
    chain_id: u64,
}

impl BlockchainClient {
    pub fn new() -> Self {
        Self {
            wallet_info: WalletInfo::default(),
            last_update: None,
            is_connected: false,
            provider: None,
            client: None,
            chulo_address: None,
            signal_registry_address: None,
            chain_id: 0,
        }
    }

    /// Connect to wallet and initialize provider
    pub async fn connect(
        &mut self,
        private_key: &str,
        rpc_url: &str,
        chain_id: u64,
        chulo_address: &str,
        signal_registry_address: &str,
    ) -> Result<(), BlockchainError> {
        // Parse private key
        let wallet = private_key
            .parse::<LocalWallet>()
            .map_err(|e| BlockchainError::InvalidPrivateKey(e.to_string()))?
            .with_chain_id(chain_id);

        // Connect to provider
        let provider = Provider::<Http>::try_from(rpc_url)
            .map_err(|e| BlockchainError::RpcError(e.to_string()))?;

        // Create client with wallet
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());

        // Store connection details
        self.provider = Some(Arc::new(provider));
        self.client = Some(Arc::new(client));
        self.chain_id = chain_id;

        // Parse contract addresses
        self.chulo_address = Some(
            chulo_address
                .parse::<Address>()
                .map_err(|e| BlockchainError::InvalidPrivateKey(format!("Invalid CHULO address: {}", e)))?,
        );
        self.signal_registry_address = Some(
            signal_registry_address
                .parse::<Address>()
                .map_err(|e| {
                    BlockchainError::InvalidPrivateKey(format!("Invalid SignalRegistry address: {}", e))
                })?,
        );

        // Get wallet address
        let address = wallet.address();
        self.wallet_info.address = format!("{:?}", address);

        // Fetch initial balance
        match self.fetch_balance_internal().await {
            Ok(balance) => {
                self.wallet_info.chulo_balance = balance;
                self.update_tier();
            }
            Err(e) => {
                tracing::warn!("Failed to fetch initial balance: {}", e);
                // Still mark as connected even if balance fetch fails
            }
        }

        self.is_connected = true;
        self.last_update = Some(Instant::now());

        Ok(())
    }

    /// Fetch CHULO balance from contract (internal)
    async fn fetch_balance_internal(&self) -> Result<f64, BlockchainError> {
        if !self.is_connected {
            return Err(BlockchainError::NotConnected);
        }

        let client = self.client.as_ref().ok_or(BlockchainError::NotConnected)?;
        let chulo_address = self.chulo_address.ok_or(BlockchainError::NotConnected)?;

        // Get wallet address
        let wallet_address = client.address();

        // Create ERC-20 contract instance using abigen! macro or parse_abi
        abigen!(
            ERC20,
            r#"[
                function balanceOf(address account) external view returns (uint256)
                function decimals() external view returns (uint8)
                function approve(address spender, uint256 amount) external returns (bool)
            ]"#
        );

        let contract = ERC20::new(chulo_address, client.clone());

        // Fetch balance
        let balance = contract
            .balance_of(wallet_address)
            .call()
            .await
            .map_err(|e| BlockchainError::ContractError(e.to_string()))?;

        // Convert from wei (18 decimals) to human-readable
        let balance_f64 = balance.as_u128() as f64 / 1e18;

        Ok(balance_f64)
    }

    /// Fetch CHULO balance from contract (public)
    pub async fn fetch_balance(&mut self) -> Result<f64, BlockchainError> {
        let balance = self.fetch_balance_internal().await?;

        self.wallet_info.chulo_balance = balance;
        self.update_tier();
        self.last_update = Some(Instant::now());

        Ok(balance)
    }

    /// Submit a signal to the SignalRegistry contract
    pub async fn submit_signal(
        &self,
        asset: &str,
        direction: &str,
        entry: i64,
        stop: i64,
        target: i64,
        confidence: u64,
    ) -> Result<H256, BlockchainError> {
        if !self.is_connected {
            return Err(BlockchainError::NotConnected);
        }

        let client = self.client.as_ref().ok_or(BlockchainError::NotConnected)?;
        let signal_registry_address = self
            .signal_registry_address
            .ok_or(BlockchainError::NotConnected)?;
        let chulo_address = self.chulo_address.ok_or(BlockchainError::NotConnected)?;

        // Determine tier for gas calculation
        let tier = &self.wallet_info.tier;
        let tier_upper = tier.to_uppercase();

        // Define SignalRegistry ABI
        abigen!(
            SignalRegistry,
            r#"[
                function submitSignal(string calldata asset, string calldata direction, int256 entry, int256 stop, int256 target, uint256 confidence, string calldata tier) external returns (uint256)
                function gasCosts(string calldata tier) external view returns (uint256)
            ]"#
        );

        let registry_contract = SignalRegistry::new(signal_registry_address, client.clone());

        // Get gas cost for tier
        let gas_cost = registry_contract
            .gas_costs(tier_upper.clone())
            .call()
            .await
            .map_err(|e| BlockchainError::ContractError(format!("Failed to get gas cost: {}", e)))?;

        let gas_cost_f64 = gas_cost.as_u128() as f64 / 1e18;

        // Check if we have enough balance
        if self.wallet_info.chulo_balance < gas_cost_f64 {
            return Err(BlockchainError::InsufficientBalance {
                required: gas_cost_f64,
                available: self.wallet_info.chulo_balance,
            });
        }

        // First, approve the SignalRegistry to spend CHULO tokens
        abigen!(
            ERC20,
            r#"[
                function approve(address spender, uint256 amount) external returns (bool)
            ]"#
        );

        let chulo_contract = ERC20::new(chulo_address, client.clone());

        let approve_tx = chulo_contract
            .approve(signal_registry_address, gas_cost)
            .send()
            .await
            .map_err(|e| BlockchainError::TransactionFailed(format!("Approve failed: {}", e)))?;

        // Wait for approval confirmation
        approve_tx
            .await
            .map_err(|e| BlockchainError::TransactionFailed(format!("Approve confirmation failed: {}", e)))?;

        // Now submit the signal
        let tx = registry_contract
            .submit_signal(
                asset.to_string(),
                direction.to_string(),
                I256::from(entry),
                I256::from(stop),
                I256::from(target),
                U256::from(confidence),
                tier_upper,
            )
            .send()
            .await
            .map_err(|e| BlockchainError::TransactionFailed(format!("Submit signal failed: {}", e)))?;

        // Wait for transaction confirmation
        let receipt = tx
            .await
            .map_err(|e| {
                BlockchainError::TransactionFailed(format!("Transaction confirmation failed: {}", e))
            })?
            .ok_or_else(|| BlockchainError::TransactionFailed("No transaction receipt".to_string()))?;

        Ok(receipt.transaction_hash)
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
        let (tier, level) = Self::calculate_tier(self.wallet_info.chulo_balance);
        self.wallet_info.tier = tier;
        self.wallet_info.tier_level = level;
    }

    pub fn wallet(&self) -> &WalletInfo {
        &self.wallet_info
    }

    pub fn is_connected(&self) -> bool {
        self.is_connected
    }

    pub fn time_since_update(&self) -> Option<std::time::Duration> {
        self.last_update.map(|t| t.elapsed())
    }

    /// Get the last error message (for UI display)
    pub fn last_error(&self) -> Option<String> {
        None // Could add error tracking here
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
