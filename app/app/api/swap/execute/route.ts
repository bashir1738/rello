import { ASSETS, type AssetSymbol } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SOL_MINT = "So11111111111111111111111111111111111111112";

const XSTOCK_MINTS: Record<string, string> = {
  AAPL: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromAsset, toAsset, amount, wallet, inputMint, outputMint, quote } =
      body;

    if (!amount || !wallet) {
      return Response.json(
        { error: "Missing required fields: amount, wallet" },
        { status: 400 }
      );
    }

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

    const inDecimals = inMint === SOL_MINT ? 9 : 6;
    const rawAmount = Math.round(amount * Math.pow(10, inDecimals));

    // Fetch fresh quote if not provided
    let swapQuote = quote;
    if (!swapQuote) {
      const params = new URLSearchParams({
        inputMint: inMint,
        outputMint: outMint,
        amount: rawAmount.toString(),
        slippageBps: "50",
      });
      const quoteRes = await fetch(
        `https://api.jup.ag/swap/v1/quote?${params.toString()}`
      );
      if (!quoteRes.ok) {
        return Response.json(
          { error: "Failed to fetch quote" },
          { status: 502 }
        );
      }
      swapQuote = await quoteRes.json();
    }

    // Get serialized swap transaction from Jupiter
    const swapRes = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: swapQuote,
        userPublicKey: wallet,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });

    if (!swapRes.ok) {
      const errText = await swapRes.text();
      return Response.json(
        { error: `Jupiter swap build failed: ${errText}` },
        { status: 502 }
      );
    }

    const swapData = await swapRes.json();

    const outDecimals = outMint === SOL_MINT ? 9 : 6;
    const outAmount =
      Number(swapQuote.outAmount) / Math.pow(10, outDecimals);

    return Response.json({
      success: true,
      swapTransaction: swapData.swapTransaction,
      lastValidBlockHeight: swapData.lastValidBlockHeight,
      inAmount: amount,
      outAmount: Math.round(outAmount * 10000) / 10000,
      message:
        "Sign and send this transaction with your wallet to execute the swap.",
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Swap build failed" },
      { status: 500 }
    );
  }
}
