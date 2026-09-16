import { readPythPrice } from "@/lib/pyth";
import { ASSETS, type AssetSymbol } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot, getSnapshots } from "@/lib/supabase";
import PriceChart from "./components/PriceChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase() as AssetSymbol;
  const asset = ASSETS[upperSymbol];

  if (!asset) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
        <p className="text-text-muted mb-6">
          No configuration found for &quot;{symbol}&quot;.
        </p>
        <Link href="/dashboard" className="text-brand hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const pythData = await readPythPrice(asset.pythFeedAddress);
  const snapshot = await getLatestSnapshot(asset.symbol);
  const history = await getSnapshots(asset.symbol, 200);

  const driftDuration = snapshot
    ? (Date.now() - new Date(snapshot.timestamp).getTime()) / 1000
    : 0;

  const health = calculatePegHealth({
    referencePrice: pythData.price,
    wrappedPrice: snapshot?.wrapped_price ?? pythData.price,
    driftDurationSeconds: driftDuration,
    poolDepthUsd: snapshot?.pool_depth ?? null,
  });

  const status = pythData.staleness.isStale ? "reference_stale" : health.status;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold">
              {upperSymbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{upperSymbol}</h1>
              <p className="text-sm text-text-muted">{asset.name}</p>
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "reference_stale"
              ? "bg-warning/15 text-warning"
              : status === "healthy"
                ? "bg-healthy/15 text-healthy"
                : status === "warning"
                  ? "bg-warning/15 text-warning"
                  : "bg-critical/15 text-critical"
          }`}
        >
          {status === "reference_stale"
            ? "Market Closed"
            : status === "healthy"
              ? "Pegged"
              : status === "warning"
                ? "Drifting"
                : "Critical"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">
            Reference Price
          </div>
          <div className="text-xl font-mono font-bold text-data">
            ${pythData.price.toFixed(2)}
          </div>
          <div className="text-xs text-text-muted mt-1 font-mono">
            ±${pythData.confidence.toFixed(2)} conf
          </div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">
            Wrapped Price
          </div>
          <div className="text-xl font-mono font-bold">
            ${(snapshot?.wrapped_price ?? pythData.price).toFixed(2)}
          </div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">
            Drift
          </div>
          <div
            className={`text-xl font-mono font-bold ${
              status === "reference_stale"
                ? "text-warning"
                : Math.abs(health.driftPct) < 0.5
                  ? "text-healthy"
                  : Math.abs(health.driftPct) < 1.5
                    ? "text-warning"
                    : "text-critical"
            }`}
          >
            {status === "reference_stale"
              ? "—"
              : `${health.driftPct >= 0 ? "+" : ""}${health.driftPct.toFixed(2)}%`}
          </div>
          <div className="text-xs text-text-muted mt-1 font-mono">
            {health.driftBps} bps
          </div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">
            Health Score
          </div>
          <div className="flex items-end gap-2">
            <div
              className={`text-xl font-mono font-bold ${
                health.healthScore >= 60
                  ? "text-healthy"
                  : health.healthScore >= 30
                    ? "text-warning"
                    : "text-critical"
              }`}
            >
              {health.healthScore}
            </div>
            <div className="text-xs text-text-muted mb-0.5">/100</div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                health.healthScore >= 60
                  ? "bg-healthy"
                  : health.healthScore >= 30
                    ? "bg-warning"
                    : "bg-critical"
              }`}
              style={{ width: `${health.healthScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Price History</h2>
        {history.length > 0 ? (
          <PriceChart
            data={history.map((s) => ({
              timestamp: s.timestamp,
              referencePrice: s.reference_price,
              wrappedPrice: s.wrapped_price,
              driftPct: s.drift_pct,
              healthScore: s.health_score,
              status: s.status,
            }))}
          />
        ) : (
          <div className="text-center py-12 text-text-muted">
            No historical data yet. Snapshots will appear after the cron job
            runs.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
            Feed Details
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Feed</span>
              <span className="font-mono text-xs">
                {asset.pythFeedAddress.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Last Publish</span>
              <span className="font-mono text-xs">
                {new Date(pythData.publishTimeMs).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Market Status</span>
              <span className="font-mono text-xs">
                {pythData.staleness.marketStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
            Configuration
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Threshold</span>
              <span className="font-mono text-xs">
                {asset.deviationThresholdBps} bps
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Max Trade</span>
              <span className="font-mono text-xs">
                {asset.maxTradeAmount} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Pool</span>
              <span className="font-mono text-xs">
                {asset.meteoraPoolAddress
                  ? `${asset.meteoraPoolAddress.slice(0, 8)}...`
                  : "Not configured"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
