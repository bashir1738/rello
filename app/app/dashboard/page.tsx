import { readPythPrice } from "@/lib/pyth";
import { ASSETS } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot } from "@/lib/supabase";
import AssetTable from "./components/AssetTable";

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Live market integrity monitoring for tokenized equities
        </p>
      </div>
      <AssetTable assets={assets} />
    </div>
  );
}
