# Rello

**Market-integrity infrastructure for tokenized equities on Solana.**

Built for the Colosseum Stocklana Hackathon — Pyth + Meteora Bounties.

---

## The Problem

Tokenized equities on Solana trade 24/7, but the real assets they represent don't. When a wrapped token's on-chain price drifts from its fair value, someone loses money. Rello closes that gap automatically.

## How It Works

1. **Read** — Pyth Core price accounts read directly from Solana RPC (on-chain binary format)
2. **Compare** — Wrapped token price vs. Pyth reference price, weighted Peg Health Score
3. **Detect** — NYSE-hours-aware staleness, drift threshold monitoring
4. **Correct** — Autonomous agent recommends/executes corrective swaps via Jupiter aggregated routes

## Verified Status

| Component | Status |
|-----------|--------|
| Guard program (Anchor) | **Passes 12/12 tests on localnet** — 6 instructions, 8 error codes |
| Staleness detection | **Passes 29/29 tests** — market open/close, weekend, feed age thresholds |
| Jupiter swap quotes | **Live on mainnet** — real AAPLx quotes via Raydium CLMM |
| Pyth on-chain reader | Reads Pyth Core accounts directly from Solana RPC |
| Pyth Hermes client | Requires API key (as of Aug 2026) |
| Meteora pool | No AAPLx pool on Meteora — liquidity exists on Raydium CLMM |
| Guard program deployment | **Not deployed** — tested on localnet only |

## Folder Structure

```
rello/
├── app/                        # Next.js 16 frontend + API routes
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Asset monitoring table
│   │   ├── asset/[symbol]/     # Asset detail + price chart
│   │   ├── activity/           # Agent activity log
│   │   ├── developers/         # API documentation
│   │   └── api/                # REST endpoints
│   ├── lib/
│   │   ├── pyth.ts             # On-chain Pyth Core reader
│   │   ├── pyth-hermes.ts      # Hermes client (dashboard)
│   │   ├── scoring.ts          # Peg Health Score calculator
│   │   ├── staleness.ts        # NYSE hours detection
│   │   ├── supabase.ts         # Database client
│   │   └── constants.ts        # Asset configuration
│   └── supabase/
│       └── schema.sql          # Database schema
│
├── program/                    # Anchor 0.32 Solana program
│   └── programs/rello_guard/
│       └── src/
│           ├── lib.rs          # 6 instructions
│           ├── state.rs        # AssetConfig, CorrectionEvent
│           ├── error.rs        # Custom error codes
│           └── instructions/   # Instruction handlers
│
├── agent/                      # Standalone Node.js agent
│   ├── index.ts                # Poll loop + drift detection
│   ├── meteora.ts              # Meteora DLMM swap execution
│   ├── config.ts               # Environment config
│   └── logger.ts               # Structured logging
│
└── README.md                   # This file
```

## Quick Start

```bash
# Install dependencies for all components
cd app && pnpm install
cd ../program && pnpm install
cd ../agent && pnpm install

# Set up environment
cp app/.env.example app/.env.local
cp agent/.env.example agent/.env
# Fill in Supabase, Solana RPC, and wallet keys

# Initialize database
# Run app/supabase/schema.sql in your Supabase SQL editor

# Start the dashboard
cd app && pnpm dev

# Start the agent (log-only mode by default)
cd agent && pnpm dev

# Run smart contract tests
cd program && anchor test
```

## Environment Variables

```bash
# app/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PYTH_API_KEY=your-pyth-api-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# agent/.env
ENGINE_BASE_URL=http://localhost:3000
AGENT_WALLET_PRIVATE_KEY=[...]
METEORA_POOL_ADDRESS=...
FEATURE_FLAG_EXECUTION=false
```

## Agent Execution Modes

| Mode | `FEATURE_FLAG_EXECUTION` | Behavior |
|------|--------------------------|----------|
| **Log-only** (default) | `false` | Detects drift, logs recommendations, fires webhooks |
| **Live** | `true` | Executes corrective swaps via Meteora DLMM on mainnet |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Price feeds | Pyth Network (Core on-chain + Hermes) |
| Swaps | Meteora DLMM (Dynamic Liquidity Market Maker) |
| Chain | Solana |
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Database | Supabase |
| Smart contract | Anchor 0.32 |
| Charts | Recharts |
| Agent | Node.js, TypeScript |

## License

MIT
