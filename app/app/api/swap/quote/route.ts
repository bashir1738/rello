import { ASSETS, type AssetSymbol } from "@/lib/constants";

export const dynamic = "force-dynamic";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";

const XSTOCK_MINTS: Record<string, string> = {
  AAPL: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromAsset, toAsset, amount, inputMint, outputMint } = body;

    if (!amount || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Resolve mints: allow direct mint addresses or asset symbols
    let inMint = inputMint;
    let outMint = outputMint;

    if (!inMint && fromAsset) {
      const asset = ASSETS[fromAsset as AssetSymbol];
      if (!asset) {
        return Response.json({ error: "Unknown asset" }, { status: 404 });
      }
      inMint = XSTOCK_MINTS[fromAsset] || asset.wrappedTokenMint || SOL_MINT;
    }
    if (!outMint && toAsset) {
      const asset = ASSETS[toAsset as AssetSymbol];
      if (!asset) {
        return Response.json({ error: "Unknown asset" }, { status: 404 });
      }
      outMint = XSTOCK_MINTS[toAsset] || asset.wrappedTokenMint || SOL_MINT;
    }

    if (!inMint || !outMint) {
      return Response.json(
        { error: "Provide inputMint/outputMint or fromAsset/toAsset" },
        { status: 400 }
      );
    }

    // Determine decimals: USDC = 6, SOL = 9, xStock tokens = 6
    const inDecimals = inMint === SOL_MINT ? 9 : 6;
    const rawAmount = Math.round(amount * Math.pow(10, inDecimals));

    const params = new URLSearchParams({
      inputMint: inMint,
      outputMint: outMint,
      amount: rawAmount.toString(),
      slippageBps: "50",
      swapMode: "ExactIn",
    });

    const res = await fetch(
      `https://api.jup.ag/swap/v1/quote?${params.toString()}`
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Jupiter quote failed: ${errText}` },
        { status: 502 }
      );
    }

    const quote = await res.json();

    const outDecimals = outMint === SOL_MINT ? 9 : 6;
    const outAmount =
      Number(quote.outAmount) / Math.pow(10, outDecimals);

    return Response.json({
      inAmount: amount,
      outAmount: Math.round(outAmount * 10000) / 10000,
      priceImpactPct: parseFloat(quote.priceImpactPct || "0"),
      route: quote.routePlan?.map((r: any) => r.swapInfo?.label).join(" → ") || "direct",
      quote, // include full quote for execute route
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Quote failed" },
      { status: 500 }
    );
  }
}
