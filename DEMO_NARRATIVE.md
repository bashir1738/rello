# Rello — Demo Narrative

## What Rello Is

Rello is market-integrity infrastructure for tokenized equities on Solana. It monitors the gap between a wrapped token's on-chain price and its Pyth reference price, then recommends or executes corrective swaps.

## What's Proven (Verified)

### Guard Program — 12/12 Tests Pass
The Anchor program (`EbR22rNs4fWi6zKjJNVhKDiD8axopWUWmb66saFLFx1N`) runs on localnet with full test coverage:
- `register_asset` — creates asset config PDA
- `set_threshold`, `set_max_trade`, `set_agent` — admin functions
- `check_and_authorize` — validates deviation, trade size, agent authorization
- `record_event` — emits CorrectionEvent with price data
- Rejection paths: UnauthorizedAgent, DeviationBelowThreshold, TradeExceedsMaximum, InvalidAsset

### Staleness Detection — 29/29 Tests Pass
NYSE-hours-aware staleness check covers:
- Market open (9:30–16:00 ET) / pre-market / after-hours / weekend
- Feed age thresholds (5-minute cutoff)
- Boundary precision (9:30:00 open, 16:00:00 close)
- Edge cases (future timestamps, epoch, very old feeds)

### Jupiter Swap Quotes — Live on Mainnet
Real AAPLx (`XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp`) quotes via Jupiter aggregator:
- Route: USDC → AAPLx via Raydium CLMM
- 1 USDC → ~300,234 AAPLx
- Price impact: 0.002%
- Full swap transaction building via Jupiter `/swap/v1/swap` endpoint

### Trade UI — End-to-End Flow
- Phantom wallet connection (real)
- Jupiter quote fetching (real, hits mainnet)
- Swap transaction building (real, Jupiter returns serialized tx)
- Transaction signing with Phantom (real)
- Transaction submission to Solana mainnet (real)

## What's Not Proven

| Item | Status | What's Needed |
|------|--------|---------------|
| Guard program on devnet/mainnet | Not deployed | `anchor deploy` with funded wallet |
| Pyth Hermes API | Returns `unauthorized` | API key from pyth.network |
| Meteora DLMM pool for AAPLx | No pool exists | Create pool + seed with liquidity |
| Agent live execution | Dry-run only | Funded wallet + `FEATURE_FLAG_EXECUTION=true` |
| Supabase database | Not configured | Project URL + service key |

## What the Demo Shows

1. **Dashboard**: Real-time asset monitoring page with AAPL and 5 other tokenized equities
2. **Feed Comparison**: Pyth Equity vs xStock vs Ondo feed comparison UI
3. **Trade**: Real Jupiter quotes for AAPLx, Phantom wallet signing flow
4. **Guard Program**: 12 passing tests demonstrating on-chain authorization logic
5. **Staleness Logic**: 29 passing tests proving NYSE-hours-aware detection
6. **Activity Log**: Agent activity tracking with drift detection and recommendation logging

## Honest Assessment

Rello is a working prototype with verified core logic. The guard program, staleness detection, and Jupiter swap routing are tested and functional. The main gap is live deployment: the guard program needs to be deployed, Pyth needs an API key, and a Meteora pool needs funding.

For a hackathon submission, this represents significant work across 4 components (program, app, agent, tests) with verified correctness on the parts that can be tested locally.

## What Would Make It Production-Ready

1. Deploy guard program to devnet/mainnet
2. Get Pyth API key for Hermes access
3. Fund agent wallet (SOL + USDC)
4. Create Meteora DLMM pool for AAPLx/USDC
5. Set `FEATURE_FLAG_EXECUTION=true`
6. Configure Supabase for persistence
