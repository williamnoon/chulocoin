# Chainlink Price Feed Addresses

## Arbitrum Goerli (Testnet)

| Asset   | Feed Address                                 | Decimals |
| ------- | -------------------------------------------- | -------- |
| BTC/USD | `0x6550bc2301936011c1334555e62A87705A81C12C` | 8        |
| ETH/USD | `0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08` | 8        |

## Arbitrum One (Mainnet)

| Asset    | Feed Address                                 | Decimals |
| -------- | -------------------------------------------- | -------- |
| BTC/USD  | `0x6ce185860a4963106506C203335A2910413708e9` | 8        |
| ETH/USD  | `0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612` | 8        |
| SOL/USD  | `0x24ceA4b8ce57cdA5058b924B9B9987992450590c` | 8        |
| LINK/USD | `0x86E53CF1B870786351Da77A57575e79CB55812CB` | 8        |
| AVAX/USD | `0x8bf61728eeDCE2F32c456454d87B5d6eD6150208` | 8        |

## Documentation

- Arbitrum Data Feeds: https://docs.chain.link/data-feeds/price-feeds/addresses?network=arbitrum
- API Reference: https://docs.chain.link/data-feeds/api-reference

## Usage

```typescript
// Add price feed to oracle
await oracle.addPriceFeed('BTC', '0x6ce185860a4963106506C203335A2910413708e9');

// Get latest price
const [price, timestamp] = await oracle.getLatestPrice('BTC');
console.log('BTC Price:', ethers.formatUnits(price, 8));

// Verify signal price
const signalPrice = ethers.parseUnits('50000', 8); // $50,000
const [isValid, oraclePrice, deviation] = await oracle.verifyPrice('BTC', signalPrice);
console.log('Valid:', isValid);
console.log('Deviation:', deviation, 'basis points');
```

## Notes

- All USD price feeds use 8 decimals
- Prices are updated by Chainlink node operators
- Check data freshness using the timestamp
- Default price tolerance is 200 basis points (2%)
- Stale price threshold is 3600 seconds (1 hour)
