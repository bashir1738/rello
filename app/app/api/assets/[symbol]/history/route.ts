import { getSnapshots } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/assets/[symbol]/history">
) {
  const { symbol } = await ctx.params;
  const upperSymbol = symbol.toUpperCase();

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200"), 500);
  const hours = parseInt(url.searchParams.get("hours") || "24");

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await (await import("@/lib/supabase")).supabase
    .from("asset_snapshots")
    .select("*")
    .eq("symbol", upperSymbol)
    .gte("timestamp", cutoff)
    .order("timestamp", { ascending: true })
    .limit(limit);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    symbol: upperSymbol,
    hours,
    count: data.length,
    data: data.map((s) => ({
      timestamp: s.timestamp,
      referencePrice: s.reference_price,
      wrappedPrice: s.wrapped_price,
      driftPct: s.drift_pct,
      healthScore: s.health_score,
      status: s.status,
    })),
  });
}
