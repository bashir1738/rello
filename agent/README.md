# Rello Agent

Standalone Node.js service that monitors tokenized equity prices and executes corrective swaps via Meteora DLMM.

## Overview

The agent runs in an infinite polling loop, fetching asset data from the Rello dashboard API. When it detects a price drift that exceeds the configured threshold, it either logs a recommendation (default) or executes a corrective swap on Solana mainnet.

## Flow

```
Poll (10s interval)
  │
  ├─ Fetch asset data from /api/assets/AAPL
  │
  ├─ Evaluate: shouldAct()?
  │   ├─ Reference stale? → skip
  │   ├─ Drift below threshold? → skip
  │   └─ Cooldown active? → skip
  │
  └─ handleDrift()
      ├─ Log-only mode → log recommendation, fire webhook
      └─ Live mode → execute swap via Meteora DLMM
```

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Main loop, `shouldAct()`, `handleDrift()` logic |
| `meteora.ts` | Meteora DLMM pool connection, quote, swap execution |
| `config.ts` | Reads `.env` configuration |
| `logger.ts` | Structured JSON logging + webhook event logging |

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in environment variables
```

## Environment Variables

```bash
# Required
ENGINE_BASE_URL=http://localhost:3000      # Rello dashboard URL
AGENT_WALLET_PRIVATE_KEY=[1,2,3,...]       # Solana keypair (JSON array)
METEORA_POOL_ADDRESS=...                   # Meteora DLMM pool address

# Optional
FEATURE_FLAG_EXECUTION=false               # true = live swaps, false = log only
SWAP_THRESHOLD_BPS=50                      # Minimum drift to act on
MAX_TRADE_AMOUNT=1000                      # Max tokens per swap
POLL_INTERVAL_MS=10000                     # Poll frequency
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WEBHOOK_URL=                               # Discord/Slack webhook
```

## Running

```bash
# Development (auto-restart)
pnpm dev

# Production
pnpm start
```

## Execution Modes

| Mode | Behavior |
|------|----------|
| **Log-only** (default) | Detects drift, logs "recommended" action, sends webhook alert |
| **Live** | Loads wallet, connects to Meteora DLMM, gets quote, executes swap |

## Dependencies

- `@meteora-ag/dlmm` — Meteora DLMM (Dynamic Liquidity Market Maker) SDK
- `@solana/web3.js` — Solana RPC client
- `bn.js` — Big number arithmetic
- `dotenv` — Environment variable loading
