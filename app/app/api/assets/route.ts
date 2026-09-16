import { readPythPrice } from "@/lib/pyth";
import { ASSETS } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await Promise.all(
    Object.values(ASSETS).map(async (asset) => {
      try {
        const pythData = await readPythPrice(asset.pythFeedAddress);
        const latestSnapshot = await getLatestSnapshot(asset.symbol);
        const driftDuration = latestSnapshot
          ? (Date.now() - new Date(latestSnapshot.timestamp).getTime()) / 1000
          : 0;

        const health = calculatePegHealth({
          referencePrice: pythData.price,
          wrappedPrice: latestSnapshot?.wrapped_price ?? pythData.price,
          driftDurationSeconds: driftDuration,
          poolDepthUsd: latestSnapshot?.pool_depth ?? null,
        });

        return {
          symbol: asset.symbol,
          name: asset.name,
          referencePrice: pythData.price,
          wrappedPrice: latestSnapshot?.wrapped_price ?? pythData.price,
          driftPct: health.driftPct,
          driftBps: health.driftBps,
          healthScore: health.healthScore,
          status: pythData.staleness.isStale
            ? "reference_stale"
            : health.status,
          poolDepth: latestSnapshot?.pool_depth ?? null,
          lastUpdate: new Date().toISOString(),
        };
      } catch (error) {
        return {
          symbol: asset.symbol,
          name: asset.name,
          referencePrice: null,
          wrappedPrice: null,
          driftPct: 0,
          driftBps: 0,
          healthScore: 0,
          status: "error",
          poolDepth: null,
          lastUpdate: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return Response.json({ assets });
}
