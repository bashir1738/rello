import { Connection, PublicKey } from "@solana/web3.js";
import { checkStaleness, type StalenessResult } from "./staleness";

export interface PythPriceData {
  price: number;
  confidence: number;
  publishTimeMs: number;
  exponent: number;
  staleness: StalenessResult;
}

const PYTH_PRICE_ACCOUNT_SIZE = 3224;

const connection = new Connection(
  process.env.SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com",
  "confirmed"
);

function decodePriceAccount(data: Buffer): {
  price: bigint;
  confidence: bigint;
  publishTime: bigint;
  exponent: number;
} {
  let offset = 0;

  const magic = data.readUInt32LE(offset);
  offset += 4;
  const version = data.readUInt32LE(offset);
  offset += 4;
  const accountType = data.readUInt32LE(offset);
  offset += 4;
  const size = data.readUInt32LE(offset);
  offset += 4;

  offset += 4;

  const price = data.readBigInt64LE(offset);
  offset += 8;
  const confidence = data.readBigInt64LE(offset);
  offset += 8;

  offset += 8;

  const publishTime = data.readBigInt64LE(offset);
  offset += 8;

  offset += 2;

  const exponent = data.readInt32LE(offset);

  return { price, confidence, publishTime, exponent };
}

export async function readPythPrice(
  feedAddress: string
): Promise<PythPriceData> {
  const pubkey = new PublicKey(feedAddress);
  const accountInfo = await connection.getAccountInfo(pubkey);

  if (!accountInfo || !accountInfo.data) {
    throw new Error(`Pyth account not found: ${feedAddress}`);
  }

  const data = Buffer.from(accountInfo.data);
  const decoded = decodePriceAccount(data);

  const divisor = Math.pow(10, Math.abs(decoded.exponent));
  const price =
    decoded.exponent >= 0
      ? Number(decoded.price) * divisor
      : Number(decoded.price) / divisor;
  const confidence =
    decoded.exponent >= 0
      ? Number(decoded.confidence) * divisor
      : Number(decoded.confidence) / divisor;

  const publishTimeMs = Number(decoded.publishTime) * 1000;
  const staleness = checkStaleness(publishTimeMs);

  return {
    price,
    confidence,
    publishTimeMs,
    exponent: decoded.exponent,
    staleness,
  };
}

export async function readMultiplePrices(
  feeds: { symbol: string; address: string }[]
): Promise<Map<string, PythPriceData>> {
  const results = new Map<string, PythPriceData>();

  const pubkeys = feeds.map((f) => new PublicKey(f.address));
  const accounts = await connection.getMultipleAccountsInfo(pubkeys);

  for (let i = 0; i < feeds.length; i++) {
    const account = accounts[i];
    if (!account || !account.data) {
      continue;
    }

    const data = Buffer.from(account.data);
    const decoded = decodePriceAccount(data);
    const divisor = Math.pow(10, Math.abs(decoded.exponent));
    const price =
      decoded.exponent >= 0
        ? Number(decoded.price) * divisor
        : Number(decoded.price) / divisor;
    const confidence =
      decoded.exponent >= 0
        ? Number(decoded.confidence) * divisor
        : Number(decoded.confidence) / divisor;

    const publishTimeMs = Number(decoded.publishTime) * 1000;
    const staleness = checkStaleness(publishTimeMs);

    results.set(feeds[i].symbol, {
      price,
      confidence,
      publishTimeMs,
      exponent: decoded.exponent,
      staleness,
    });
  }

  return results;
}
