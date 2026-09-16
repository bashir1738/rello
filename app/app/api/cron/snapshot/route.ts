import { readPythPrice } from "@/lib/pyth";
import { ASSETS } from "@/lib/constants";
import { calculatePegHealth } from "@/lib/scoring";
import { insertSnapshot, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: { symbol: string; ok: boolean; error?: string }[] = [];

  for (const asset of Object.values(ASSETS)) {
    try {
      const pythData = await readPythPrice(asset.pythFeedAddress);

      const latestSnapshot = await supabase
        .from("asset_snapshots")
        .select("wrapped_price, timestamp")
        .eq("symbol", asset.symbol)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      const prevWrapped = latestSnapshot.data?.wrapped_price ?? pythData.price;
      const prevTime = latestSnapshot.data?.timestamp
        ? new Date(latestSnapshot.data.timestamp).getTime()
        : Date.now();

      const driftDuration = (Date.now() - prevTime) / 1000;

      const health = calculatePegHealth({
        referencePrice: pythData.price,
        wrappedPrice: prevWrapped,
        driftDurationSeconds: driftDuration,
        poolDepthUsd: null,
      });

      await insertSnapshot({
        symbol: asset.symbol,
        reference_price: pythData.price,
        wrapped_price: prevWrapped,
        drift_pct: health.driftPct,
        health_score: health.healthScore,
        status: pythData.staleness.isStale ? "reference_stale" : health.status,
        pool_depth: null,
        timestamp: new Date().toISOString(),
      });

      results.push({ symbol: asset.symbol, ok: true });
    } catch (error) {
      results.push({
        symbol: asset.symbol,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    results,
  });
}
