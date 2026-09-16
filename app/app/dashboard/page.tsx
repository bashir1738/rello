import { readPythPrice } from "@/lib/pyth";
import { ASSETS } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot, getSnapshots } from "@/lib/supabase";
import AssetTable from "./components/AssetTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const assets = await Promise.all(
    Object.values(ASSETS).map(async (asset) => {
      try {
        const pythData = await readPythPrice(asset.pythFeedAddress);
        const snapshot = await getLatestSnapshot(asset.symbol);
        const driftDuration = snapshot
          ? (Date.now() - new Date(snapshot.timestamp).getTime()) / 1000
          : 0;

        const health = calculatePegHealth({
          referencePrice: pythData.price,
          wrappedPrice: snapshot?.wrapped_price ?? pythData.price,
          driftDurationSeconds: driftDuration,
          poolDepthUsd: snapshot?.pool_depth ?? null,
        });

        return {
          symbol: asset.symbol,
          name: asset.name,
          referencePrice: pythData.price,
          wrappedPrice: snapshot?.wrapped_price ?? pythData.price,
          driftPct: health.driftPct,
          driftBps: health.driftBps,
          healthScore: health.healthScore,
          status: pythData.staleness.isStale
            ? ("reference_stale" as const)
            : health.status,
          poolDepth: snapshot?.pool_depth ?? null,
        };
      } catch {
        return {
          symbol: asset.symbol,
          name: asset.name,
          referencePrice: 0,
          wrappedPrice: 0,
          driftPct: 0,
          driftBps: 0,
          healthScore: 0,
          status: "error" as const,
          poolDepth: null,
        };
      }
    })
  );

  const totalAssets = assets.length;
  const healthyCount = assets.filter((a) => a.status === "healthy").length;
  const warningCount = assets.filter((a) => a.status === "warning" || a.status === "reference_stale").length;
  const criticalCount = assets.filter((a) => a.status === "critical").length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 perspective">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            Live market integrity monitoring for tokenized equities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/activity"
            className="btn-3d inline-flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm font-medium"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-brand"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm0 4a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V7zm0 4a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" /></svg>
            Activity Log
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-white/10 rounded-xl p-4 card-3d animate-fade-in-up delay-1">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Total Assets</div>
          <div className="text-2xl font-mono font-bold text-text">{totalAssets}</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4 card-3d animate-fade-in-up delay-2">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Healthy</div>
          <div className="text-2xl font-mono font-bold text-healthy">{healthyCount}</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4 card-3d animate-fade-in-up delay-3">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Warning</div>
          <div className="text-2xl font-mono font-bold text-warning">{warningCount}</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4 card-3d animate-fade-in-up delay-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Critical</div>
          <div className="text-2xl font-mono font-bold text-critical">{criticalCount}</div>
        </div>
      </div>

      {/* Table */}
      <AssetTable assets={assets} />
    </div>
  );
}
