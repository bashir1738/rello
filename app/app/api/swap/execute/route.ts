import { ASSETS, type AssetSymbol } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromAsset, toAsset, amount, wallet } = body;

    if (!fromAsset || !amount || !wallet) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const asset = ASSETS[fromAsset as AssetSymbol];
    if (!asset) {
      return Response.json({ error: "Unknown asset" }, { status: 404 });
    }

    if (!asset.meteoraPoolAddress) {
      return Response.json(
        { error: "Pool not configured for this asset. Create one at /pools" },
        { status: 400 }
      );
    }

    // In production: load agent wallet, connect to Meteora DLMM, execute swap
    // For now, return a simulated result
    return Response.json({
      success: true,
      txSignature: "simulated_" + Date.now().toString(36),
      inAmount: amount,
      outAmount: amount * 189.84 * 0.995,
      message: "Swap simulated. Configure pool and agent wallet for live execution.",
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Swap failed" },
      { status: 500 }
    );
  }
}
