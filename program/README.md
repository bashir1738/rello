# Rello Guard — Solana Program

Anchor 0.32 program that provides on-chain authorization for equity correction swaps.

## Overview

`rello_guard` is the on-chain gatekeeper. Before the agent executes any corrective swap, it must pass through this program's validation. The program ensures:

- The asset is registered and active
- The signer is the authorized agent
- The proposed deviation meets the configured threshold
- The trade amount is within bounds

## Instructions

| Instruction | Description |
|------------|-------------|
| `register_asset` | Register a new tokenized equity with its Pyth feed, pool, and thresholds |
| `set_threshold` | Update the deviation threshold (authority only) |
| `set_max_trade` | Update max trade amount and slippage (authority only) |
| `set_agent` | Rotate the authorized agent keypair (authority only) |
| `check_and_authorize` | Validate a proposed swap against stored rules (agent signs) |
| `record_event` | Emit a `CorrectionEvent` on-chain for audit trail |

## Account Structure

### AssetConfig (PDA)

Seeds: `["asset_config", asset_pubkey]`

| Field | Type | Description |
|-------|------|-------------|
| `authority` | `Pubkey` | Admin who registered the asset |
| `asset` | `Pubkey` | Wrapped token mint |
| `reference_feed` | `Pubkey` | Pyth price feed address |
| `deviation_threshold_bps` | `u16` | Minimum drift to trigger correction |
| `max_trade_amount` | `u64` | Max tokens per correction |
| `max_slippage_bps` | `u16` | Max allowed slippage |
| `authorized_agent` | `Pubkey` | Only this key can call `check_and_authorize` |
| `pool_address` | `Pubkey` | Meteora DBC pool |
| `active` | `bool` | Whether the config is active |

### CorrectionEvent (Emitted)

| Field | Type | Description |
|-------|------|-------------|
| `asset` | `Pubkey` | Asset that was corrected |
| `reference_price` | `u64` | Pyth reference price |
| `market_price` | `u64` | On-chain wrapped price |
| `deviation_bps` | `u16` | Drift in basis points |
| `trade_amount` | `u64` | Tokens traded |
| `timestamp` | `i64` | Unix timestamp |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 6000 | `UnauthorizedAgent` | Signer is not the authorized agent |
| 6001 | `AssetNotActive` | Asset configuration is disabled |
| 6002 | `DeviationBelowThreshold` | Drift is below the configured threshold |
| 6003 | `TradeExceedsMaximum` | Trade amount exceeds max allowed |
| 6004 | `SlippageExceedsMaximum` | Slippage exceeds max allowed |
| 6005 | `InvalidPool` | Pool address doesn't match config |
| 6006 | `InvalidAsset` | Asset pubkey doesn't match config |
| 6007 | `InvalidFeed` | Reference feed doesn't match config |

## Development

```bash
# Install dependencies
pnpm install

# Build
anchor build

# Run tests (starts local validator automatically)
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Program ID

```
EbR22rNs4fWi6zKjJNVhKDiD8axopWUWmb66saFLFx1N
```
