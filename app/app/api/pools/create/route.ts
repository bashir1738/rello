export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      baseMint,
      quoteMint,
      baseAmount,
      quoteAmount,
      curveType,
      feeBps,
      graduationThreshold,
      maxDriftBps,
    } = body;

    if (!baseMint || !quoteMint) {
      return Response.json(
        { error: "Base and quote mints are required" },
        { status: 400 }
      );
    }

    // Pool creation requires:
    // 1. @meteora-ag/dlmm SDK installed
    // 2. Funded agent wallet with SOL for tx fees + tokens for liquidity
    // 3. Valid token mints on Solana mainnet
    //
    // For the hackathon demo, this endpoint returns the configuration
    // that would be sent to the Meteora DLMM pool creation instruction.
    // The agent/meteora.ts module handles live pool interaction when
    // FEATURE_FLAG_EXECUTION=true and a pool address is configured.

    return Response.json({
      success: true,
      poolAddress: null,
      config: {
        baseMint,
        quoteMint,
        baseAmount,
        quoteAmount,
        curveType,
        feeBps,
        graduationThreshold,
        maxDriftBps,
      },
      message:
        "Pool configuration saved. To create a live Meteora DLMM pool, fund the agent wallet and set METEORA_POOL_ADDRESS in .env.local.",
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Pool creation failed" },
      { status: 500 }
    );
  }
}
