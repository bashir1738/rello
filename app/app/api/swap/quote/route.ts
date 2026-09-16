import { ASSETS, type AssetSymbol } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromAsset, toAsset, amount } = body;

    if (!fromAsset || !amount || amount <= 0) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const asset = ASSETS[fromAsset as AssetSymbol];
    if (!asset) {
      return Response.json({ error: "Unknown asset" }, { status: 404 });
    }

    // Simulate a quote based on the reference price
    // In production, this would call Meteora DLMM SDK
    const referencePrice = 189.84; // Would read from Pyth in production
    const slippage = 0.003; // 0.3%
    const fee = 0.002; // 0.2%

    const outAmount = amount * referencePrice * (1 - slippage - fee);
    const priceImpact = slippage * 100;

    return Response.json({
      inAmount: amount,
      outAmount: Math.round(outAmount * 100) / 100,
      priceImpact,
      route: `${fromAsset} → Meteora DBC → ${toAsset}`,
      fee: Math.round(amount * referencePrice * fee * 100) / 100,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Quote failed" },
      { status: 500 }
    );
  }
}
