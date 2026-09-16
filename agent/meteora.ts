import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { DLMM } from "@meteora-ag/dlmm";
import { config } from "./config";
import { log } from "./logger";
import BN from "bn.js";

export interface SwapResult {
  success: boolean;
  txSignature?: string;
  inAmount: number;
  outAmount: number;
  error?: string;
}

let dlmmInstance: DLMM | null = null;

export async function getPoolInstance(
  connection: Connection
): Promise<DLMM | null> {
  if (dlmmInstance) return dlmmInstance;

  if (!config.meteoraPoolAddress) {
    log("warn", "No Meteora pool address configured");
    return null;
  }

  try {
    const poolPubkey = new PublicKey(config.meteoraPoolAddress);
    dlmmInstance = await DLMM.create(connection, poolPubkey);
    log("info", "Connected to Meteora pool", {
      pool: config.meteoraPoolAddress,
      tokenX: dlmmInstance.lbPair.tokenX.toString(),
      tokenY: dlmmInstance.lbPair.tokenY.toString(),
    });
    return dlmmInstance;
  } catch (err) {
    log("error", "Failed to connect to Meteora pool", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return null;
  }
}

export async function getPoolDepth(
  dlmm: DLMM
): Promise<{ tokenX: number; tokenY: number; totalUsd: number }> {
  try {
    const reserves = dlmm.getSecret();
    return {
      tokenX: 0,
      tokenY: 0,
      totalUsd: 0,
    };
  } catch {
    return { tokenX: 0, tokenY: 0, totalUsd: 0 };
  }
}

export async function executeSwap(
  connection: Connection,
  wallet: Keypair,
  inToken: PublicKey,
  outToken: PublicKey,
  inAmount: number,
  allowedSlippageBps: number = 50
): Promise<SwapResult> {
  const dlmm = await getPoolInstance(connection);
  if (!dlmm) {
    return {
      success: false,
      inAmount,
      outAmount: 0,
      error: "Pool not available",
    };
  }

  try {
    const swapForY = inToken.equals(dlmm.lbPair.tokenX);
    const inAmountBN = new BN(inAmount);

    const binArrays = await dlmm.getBinArrayForSwap(swapForY);
    const allowedSlippage = new BN(allowedSlippageBps);

    const quote = dlmm.swapQuote(
      inAmountBN,
      swapForY,
      allowedSlippage,
      binArrays
    );

    log("info", "Swap quote received", {
      inAmount,
      outAmount: quote.outAmount.toNumber(),
      priceImpact: quote.priceImpact.toString(),
      swapForY,
    });

    if (!config.featureFlagExecution) {
      log("info", "DRY RUN: Would execute swap", {
        inAmount,
        outAmount: quote.outAmount.toNumber(),
      });
      return {
        success: true,
        inAmount,
        outAmount: quote.outAmount.toNumber(),
        txSignature: "dry-run",
      };
    }

    const swapTx = await dlmm.swap({
      inToken,
      outToken,
      inAmount: inAmountBN,
      minOutAmount: quote.minOutAmount,
      lbPair: dlmm.lbPair,
      user: wallet.publicKey,
      binArraysPubkey: binArrays.map((b) => b.publicKey),
    });

    const txSignature = await connection.sendTransaction(swapTx, [wallet], {
      skipPreflight: true,
    });

    log("info", "Swap transaction sent", { txSignature });

    const confirmation = await connection.confirmTransaction(
      txSignature,
      "confirmed"
    );

    if (confirmation.value.err) {
      return {
        success: false,
        inAmount,
        outAmount: 0,
        txSignature,
        error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
      };
    }

    return {
      success: true,
      txSignature,
      inAmount,
      outAmount: quote.outAmount.toNumber(),
    };
  } catch (err) {
    log("error", "Swap execution failed", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return {
      success: false,
      inAmount,
      outAmount: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
