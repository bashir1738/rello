import { readPythPrice } from "@/lib/pyth";
import { ASSETS, type AssetSymbol } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot, getSnapshots } from "@/lib/supabase";
import PriceChart from "./components/PriceChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub, color, delay }: { label: string; value: string; sub?: string; color: string; delay: number }) {
  return (
    <div
      className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-text-muted mt-1 font-mono">{sub}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} text-text`}>{value}</span>
    </div>
  );
}

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
      <div className="mx-auto max-w-7xl px-4 py-16 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
        <p className="text-text-muted mb-6">No configuration found for &quot;{symbol}&quot;.</p>
        <Link href="/dashboard" className="btn-3d inline-flex items-center px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium">
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

  const statusColor =
    status === "reference_stale" ? "text-warning" :
    status === "healthy" ? "text-healthy" :
    status === "warning" ? "text-warning" : "text-critical";

  const statusBg =
    status === "reference_stale" ? "bg-warning/15 text-warning" :
    status === "healthy" ? "bg-healthy/15 text-healthy" :
    status === "warning" ? "bg-warning/15 text-warning" : "bg-critical/15 text-critical";

  const statusLabel =
    status === "reference_stale" ? "Market Closed" :
    status === "healthy" ? "Pegged" :
    status === "warning" ? "Drifting" : "Critical";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 perspective">
      {/* Back link */}
      <div className="mb-6 animate-fade-in-up">
        <Link href="/dashboard" className="nav-link-3d text-sm text-text-muted inline-flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z" /></svg>
          Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 animate-fade-in-up delay-1">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand/15 flex items-center justify-center text-brand text-lg font-bold transition-transform duration-300 hover:scale-110 hover:rotate-3">
            {upperSymbol.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{upperSymbol}</h1>
            <p className="text-sm text-text-muted">{asset.name}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusBg}`}>
          {statusLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Reference Price" value={`$${pythData.price.toFixed(2)}`} sub={`\u00B1$${pythData.confidence.toFixed(2)} conf`} color="text-data" delay={0.1} />
        <StatCard label="Wrapped Price" value={`$${(snapshot?.wrapped_price ?? pythData.price).toFixed(2)}`} color="text-text" delay={0.2} />
        <StatCard
          label="Drift"
          value={status === "reference_stale" ? "\u2014" : `${health.driftPct >= 0 ? "+" : ""}${health.driftPct.toFixed(2)}%`}
          sub={`${health.driftBps} bps`}
          color={
            status === "reference_stale" ? "text-warning" :
            Math.abs(health.driftPct) < 0.5 ? "text-healthy" :
            Math.abs(health.driftPct) < 1.5 ? "text-warning" : "text-critical"
          }
          delay={0.3}
        />
        <div className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up relative overflow-hidden" style={{ animationDelay: "0.4s" }}>
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            health.healthScore >= 60 ? "bg-healthy" :
            health.healthScore >= 30 ? "bg-warning" : "bg-critical"
          }`} />
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2">Health Score</div>
          <div className="flex items-end gap-2">
            <div className={`text-3xl font-mono font-bold ${
              health.healthScore >= 60 ? "text-healthy" :
              health.healthScore >= 30 ? "text-warning" : "text-critical"
            }`}>{health.healthScore}</div>
            <div className="text-xs text-text-muted mb-1">/100</div>
          </div>
          <div className="mt-3 h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                health.healthScore >= 60 ? "bg-healthy" :
                health.healthScore >= 30 ? "bg-warning" : "bg-critical"
              }`}
              style={{ width: `${health.healthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8 animate-fade-in-up delay-2">
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
          <div className="text-center py-16 text-text-muted text-sm">
            No historical data yet. Snapshots will appear after the cron job runs.
          </div>
        )}
      </div>

      {/* Info panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up delay-3">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-brand"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>
            Feed Details
          </h3>
          <div>
            <InfoRow label="Feed" value={`${asset.pythFeedAddress.slice(0, 12)}...`} />
            <InfoRow label="Last Publish" value={new Date(pythData.publishTimeMs).toLocaleTimeString()} />
            <InfoRow label="Market Status" value={pythData.staleness.marketStatus} />
            <InfoRow label="Feed Age" value={`${((Date.now() - pythData.publishTimeMs) / 1000 / 60).toFixed(1)} min`} />
          </div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up delay-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-data"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V6a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V4.5A3.5 3.5 0 008 1zM2 4.5A4.5 4.5 0 016.5 0h3A4.5 4.5 0 0114 4.5v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" fill="none" stroke="currentColor" strokeWidth="1.2" /><rect x="3" y="8" width="10" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            Configuration
          </h3>
          <div>
            <InfoRow label="Threshold" value={`${asset.deviationThresholdBps} bps`} />
            <InfoRow label="Max Trade" value={`${asset.maxTradeAmount} tokens`} />
            <InfoRow label="Pool" value={asset.meteoraPoolAddress ? `${asset.meteoraPoolAddress.slice(0, 12)}...` : "Not configured"} />
          </div>
        </div>
      </div>
    </div>
  );
}
