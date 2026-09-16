# Rello Dashboard

Next.js 16 frontend for monitoring tokenized equity prices on Solana.

## Overview

The dashboard reads Pyth price feeds on-chain, fetches snapshots from Supabase, calculates Peg Health Scores, and displays real-time drift monitoring with price charts.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with architecture diagram and feature overview |
| `/dashboard` | Asset monitoring table with health scores and summary cards |
| `/asset/[symbol]` | Per-asset detail: reference price, wrapped price, drift, chart |
| `/activity` | Agent activity log with correction attempts and tx links |
| `/developers` | API documentation with endpoint cards and code examples |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assets` | List all tracked assets with live Pyth prices |
| GET | `/api/assets/[symbol]` | Detailed single-asset data |
| GET | `/api/assets/[symbol]/history` | Historical snapshots (`?hours=24&limit=100`) |
| POST | `/api/webhook` | Receive alert payloads (Discord/Slack) |
| GET | `/api/cron/snapshot` | Trigger snapshot capture (cron job) |

## Library Modules

| Module | Purpose |
|--------|---------|
| `lib/pyth.ts` | Direct on-chain Pyth Core price reader (binary decode) |
| `lib/pyth-hermes.ts` | Hermes HTTP client for dashboard display |
| `lib/scoring.ts` | Weighted Peg Health Score calculator (0-100) |
| `lib/staleness.ts` | NYSE hours awareness, feed age checks |
| `lib/supabase.ts` | Database CRUD helpers |
| `lib/constants.ts` | Asset configuration (AAPL, thresholds) |

## Database

Schema at `supabase/schema.sql`:

- **`asset_snapshots`** — Periodic price snapshots with drift and health scores
- **`agent_events`** — Agent action log with tx signatures

## Setup

```bash
pnpm install
cp .env.example .env.local
# Fill in Supabase, Pyth, and Solana RPC credentials

# Initialize database
# Run supabase/schema.sql in Supabase SQL editor

pnpm dev
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PYTH_API_KEY=your-pyth-api-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Tech Stack

- Next.js 16 (App Router, React 19)
- Tailwind CSS v4
- Recharts (price charts)
- Supabase (database)
- Pyth Network (price feeds)
