use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use reqwest;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Candle {
    pub timestamp: DateTime<Utc>,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone)]
pub struct MarketData {
    pub symbol: String,
    pub candles: Vec<Candle>,
}

impl MarketData {
    /// Save market data to CSV file for Python strategy consumption
    pub fn save_to_csv(&self, path: &PathBuf) -> Result<()> {
        let mut file = File::create(path)
            .with_context(|| format!("Failed to create CSV file: {:?}", path))?;

        // Write header
        writeln!(file, "timestamp,open,high,low,close,volume,symbol")?;

        // Write data
        for candle in &self.candles {
            writeln!(
                file,
                "{},{},{},{},{},{},{}",
                candle.timestamp.to_rfc3339(),
                candle.open,
                candle.high,
                candle.low,
                candle.close,
                candle.volume,
                self.symbol
            )?;
        }

        Ok(())
    }
}

/// Market data fetcher
pub struct MarketDataFetcher {
    client: reqwest::Client,
    source: String,
}

impl MarketDataFetcher {
    pub fn new(source: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            source,
        }
    }

    /// Fetch market data for an asset
    pub async fn fetch(&self, asset: &str) -> Result<MarketData> {
        match self.source.as_str() {
            "coingecko" => self.fetch_coingecko(asset).await,
            "binance" => self.fetch_binance(asset).await,
            _ => self.fetch_coingecko(asset).await, // Default to CoinGecko
        }
    }

    /// Fetch data from CoinGecko API
    async fn fetch_coingecko(&self, asset: &str) -> Result<MarketData> {
        // CoinGecko free API: get price + 24h data
        // For proper OHLCV data, we'd need the pro API, but for MVP we'll use simple price endpoint
        // and construct basic candles

        let url = format!(
            "https://api.coingecko.com/api/v3/coins/{}/market_chart?vs_currency=usd&days=7&interval=daily",
            asset
        );

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .context("Failed to fetch data from CoinGecko")?;

        if !response.status().is_success() {
            anyhow::bail!("CoinGecko API error: {}", response.status());
        }

        let data: CoinGeckoResponse = response
            .json()
            .await
            .context("Failed to parse CoinGecko response")?;

        // Convert to candles (simplified - using prices as close, approximating OHLC)
        let mut candles = Vec::new();

        for i in 0..data.prices.len() {
            let timestamp = DateTime::from_timestamp_millis(data.prices[i][0] as i64)
                .unwrap_or_else(|| Utc::now());

            let close = data.prices[i][1];
            let volume = if i < data.total_volumes.len() {
                data.total_volumes[i][1]
            } else {
                0.0
            };

            // Approximate OHLC from close prices
            let prev_close = if i > 0 {
                data.prices[i - 1][1]
            } else {
                close
            };
            let next_close = if i < data.prices.len() - 1 {
                data.prices[i + 1][1]
            } else {
                close
            };

            let high = close.max(prev_close).max(next_close) * 1.005; // Add 0.5% buffer
            let low = close.min(prev_close).min(next_close) * 0.995; // Subtract 0.5% buffer
            let open = prev_close;

            candles.push(Candle {
                timestamp,
                open,
                high,
                low,
                close,
                volume,
            });
        }

        Ok(MarketData {
            symbol: asset.to_uppercase(),
            candles,
        })
    }

    /// Fetch data from Binance API (for future implementation)
    async fn fetch_binance(&self, asset: &str) -> Result<MarketData> {
        // Map asset names to Binance symbols
        let symbol = match asset.to_lowercase().as_str() {
            "bitcoin" => "BTCUSDT",
            "ethereum" => "ETHUSDT",
            _ => return Err(anyhow::anyhow!("Unsupported asset for Binance: {}", asset)),
        };

        let url = format!(
            "https://api.binance.com/api/v3/klines?symbol={}&interval=1h&limit=168",
            symbol
        );

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .context("Failed to fetch data from Binance")?;

        if !response.status().is_success() {
            anyhow::bail!("Binance API error: {}", response.status());
        }

        let data: Vec<BinanceKline> = response
            .json()
            .await
            .context("Failed to parse Binance response")?;

        let mut candles = Vec::new();

        for kline in data {
            let timestamp = DateTime::from_timestamp_millis(kline.0)
                .unwrap_or_else(|| Utc::now());

            candles.push(Candle {
                timestamp,
                open: kline.1.parse().unwrap_or(0.0),
                high: kline.2.parse().unwrap_or(0.0),
                low: kline.3.parse().unwrap_or(0.0),
                close: kline.4.parse().unwrap_or(0.0),
                volume: kline.5.parse().unwrap_or(0.0),
            });
        }

        Ok(MarketData {
            symbol: asset.to_uppercase(),
            candles,
        })
    }
}

#[derive(Debug, Deserialize)]
struct CoinGeckoResponse {
    prices: Vec<[f64; 2]>,
    total_volumes: Vec<[f64; 2]>,
}

// Binance kline format: [timestamp, open, high, low, close, volume, ...]
type BinanceKline = (i64, String, String, String, String, String);

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_fetch_coingecko() {
        let fetcher = MarketDataFetcher::new("coingecko".to_string());
        let result = fetcher.fetch("bitcoin").await;
        assert!(result.is_ok());
        let data = result.unwrap();
        assert!(!data.candles.is_empty());
    }
}
