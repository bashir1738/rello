import { readPythPrice } from "@/lib/pyth";
import { ASSETS, type AssetSymbol } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { getLatestSnapshot, getSnapshots } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/assets/[symbol]">
) {
  const { symbol } = await ctx.params;
  const upperSymbol = symbol.toUpperCase() as AssetSymbol;
  const asset = ASSETS[upperSymbol];

  if (!asset) {
    return Response.json(
      { error: `Unknown asset: ${symbol}` },
      { status: 404 }
    );
  }

  try {
    const pythData = await readPythPrice(asset.pythFeedAddress);
    const latestSnapshot = await getLatestSnapshot(asset.symbol);
    const history = await getSnapshots(asset.symbol, 200);

    const driftDuration = latestSnapshot
      ? (Date.now() - new Date(latestSnapshot.timestamp).getTime()) / 1000
      : 0;

    const health = calculatePegHealth({
      referencePrice: pythData.price,
      wrappedPrice: latestSnapshot?.wrapped_price ?? pythData.price,
      driftDurationSeconds: driftDuration,
      poolDepthUsd: latestSnapshot?.pool_depth ?? null,
    });

    return Response.json({
      symbol: asset.symbol,
      name: asset.name,
      referencePrice: pythData.price,
      confidence: pythData.confidence,
      wrappedPrice: latestSnapshot?.wrapped_price ?? pythData.price,
      driftPct: health.driftPct,
      driftBps: health.driftBps,
      healthScore: health.healthScore,
      status: pythData.staleness.isStale ? "reference_stale" : health.status,
      poolDepth: latestSnapshot?.pool_depth ?? null,
      feedPublishTime: new Date(pythData.publishTimeMs).toISOString(),
      staleness: pythData.staleness,
      history: history.map((s) => ({
        timestamp: s.timestamp,
        referencePrice: s.reference_price,
        wrappedPrice: s.wrapped_price,
        driftPct: s.drift_pct,
        healthScore: s.health_score,
        status: s.status,
      })),
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        symbol: asset.symbol,
      },
      { status: 500 }
    );
  }
}
