import { Connection, Keypair } from "@solana/web3.js";
import { config } from "./config";
import { log, logAgentEvent } from "./logger";
import { executeSwap } from "./meteora";

interface EngineAssetResponse {
  symbol: string;
  referencePrice: number;
  wrappedPrice: number;
  driftPct: number;
  driftBps: number;
  healthScore: number;
  status: string;
}

let lastActionTime = 0;
const ACTION_COOLDOWN_MS = 60_000;

async function fetchAssetData(): Promise<EngineAssetResponse | null> {
  try {
    const res = await fetch(`${config.engineBaseUrl}/api/assets/AAPL`);
    const data = await res.json();
    return data.assets?.[0] ?? null;
  } catch (err) {
    log("error", "Failed to fetch asset data", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return null;
  }
}

function shouldAct(asset: EngineAssetResponse): boolean {
  if (asset.status === "reference_stale") {
    log("info", "Reference feed is stale — no action taken");
    return false;
  }

  if (asset.status === "error") {
    log("warn", "Asset data error — no action taken");
    return false;
  }

  if (Math.abs(asset.driftBps) < config.swapThresholdBps) {
    return false;
  }

  if (Date.now() - lastActionTime < ACTION_COOLDOWN_MS) {
    log("info", "Action cooldown active — skipping");
    return false;
  }

  return true;
}

async function handleDrift(asset: EngineAssetResponse) {
  const driftDirection = asset.driftBps > 0 ? "above" : "below";
  log("warn", `Drift detected: ${asset.driftBps} bps ${driftDirection} peg`, {
    symbol: asset.symbol,
    referencePrice: asset.referencePrice,
    wrappedPrice: asset.wrappedPrice,
    driftPct: asset.driftPct,
  });

  if (!config.featureFlagExecution) {
    log("info", "LOG ONLY: Would execute corrective swap", {
      action:
        asset.driftBps > 0
          ? "sell_wrapped_token"
          : "buy_wrapped_token",
      amount: config.maxTradeAmount,
    });

    await logAgentEvent({
      asset: asset.symbol,
      reference_price: asset.referencePrice,
      market_price: asset.wrappedPrice,
      deviation_bps: asset.driftBps,
      trade_amount: config.maxTradeAmount,
      tx_signature: null,
      action_type: "recommended",
    });

    lastActionTime = Date.now();
    return;
  }

  log("info", "EXECUTE: Initiating corrective swap", {
    direction: asset.driftBps > 0 ? "sell" : "buy",
    amount: config.maxTradeAmount,
  });

  const rpcEndpoint = config.rpcEndpoint;
  const connection = new Connection(rpcEndpoint, "confirmed");

  let wallet: Keypair;
  try {
    const secretKey = JSON.parse(config.agentWalletPrivateKey);
    wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } catch {
    log("error", "Invalid agent wallet private key");
    return;
  }

  const wrappedMint =
    "2wNyN1o2Rp9tFaz5mDThbLGDhSE4RbJQoFvHDNnGzA3m";
  const usdcMint =
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const inToken =
    asset.driftBps > 0
      ? new (await import("@solana/web3.js")).PublicKey(wrappedMint)
      : new (await import("@solana/web3.js")).PublicKey(usdcMint);
  const outToken =
    asset.driftBps > 0
      ? new (await import("@solana/web3.js")).PublicKey(usdcMint)
      : new (await import("@solana/web3.js")).PublicKey(wrappedMint);

  const result = await executeSwap(
    connection,
    wallet,
    inToken,
    outToken,
    config.maxTradeAmount
  );

  await logAgentEvent({
    asset: asset.symbol,
    reference_price: asset.referencePrice,
    market_price: asset.wrappedPrice,
    deviation_bps: asset.driftBps,
    trade_amount: config.maxTradeAmount,
    tx_signature: result.txSignature ?? null,
    action_type: result.success ? "executed" : "failed",
  });

  lastActionTime = Date.now();
}

async function poll() {
  const asset = await fetchAssetData();
  if (!asset) {
    log("warn", "No asset data available");
    return;
  }

  log("info", `Poll: ${asset.symbol}`, {
    referencePrice: asset.referencePrice,
    wrappedPrice: asset.wrappedPrice,
    driftBps: asset.driftBps,
    status: asset.status,
  });

  if (shouldAct(asset)) {
    await handleDrift(asset);
  }
}

async function main() {
  log("info", "Rello Agent starting", {
    pollInterval: config.pollIntervalMs,
    thresholdBps: config.swapThresholdBps,
    executionEnabled: config.featureFlagExecution,
    poolAddress: config.meteoraPoolAddress || "not configured",
  });

  while (true) {
    try {
      await poll();
    } catch (err) {
      log("error", "Poll cycle error", {
        error: err instanceof Error ? err.message : "Unknown",
      });
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
}

main();
