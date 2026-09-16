-- Rello — Supabase Schema
-- Run this in the Supabase SQL editor to initialize your database.

CREATE TABLE IF NOT EXISTS asset_snapshots (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  reference_price NUMERIC NOT NULL,
  wrapped_price NUMERIC NOT NULL,
  drift_pct NUMERIC NOT NULL,
  health_score NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  pool_depth NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_events (
  id BIGSERIAL PRIMARY KEY,
  asset TEXT NOT NULL,
  reference_price NUMERIC NOT NULL,
  market_price NUMERIC NOT NULL,
  deviation_bps INTEGER NOT NULL,
  trade_amount NUMERIC,
  tx_signature TEXT,
  action_type TEXT NOT NULL DEFAULT 'recommended',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_symbol_time
  ON asset_snapshots(symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_events_asset_time
  ON agent_events(asset, timestamp DESC);
