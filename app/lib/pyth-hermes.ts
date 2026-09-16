import { HermesClient } from "@pythnetwork/hermes-client";

const HERMES_ENDPOINT = "https://hermes.pyth.network";

let client: HermesClient | null = null;

function getClient(): HermesClient {
  if (!client) {
    const apiKey = process.env.PYTH_API_KEY;
    client = new HermesClient(HERMES_ENDPOINT, {
      accessToken: apiKey || undefined,
    });
  }
  return client;
}

export interface PriceUpdate {
  price: number;
  confidence: number;
  timestamp: number;
}

export async function getLatestPrice(feedId: string): Promise<PriceUpdate> {
  const hermes = getClient();
  const update = await hermes.getLatestPriceUpdates([feedId], {
    parsed: true,
  });

  const parsed = update.parsed;
  if (!parsed || parsed.length === 0) {
    throw new Error(`No price data for feed: ${feedId}`);
  }

  const assetData = parsed[0].price;
  return {
    price: Number(assetData.price),
    confidence: Number(assetData.conf),
    timestamp: Number(assetData.publish_time) * 1000,
  };
}

export async function getLatestPrices(
  feedIds: string[]
): Promise<Map<string, PriceUpdate>> {
  const hermes = getClient();
  const update = await hermes.getLatestPriceUpdates(feedIds, {
    parsed: true,
  });

  const results = new Map<string, PriceUpdate>();
  const parsed = update.parsed;
  if (!parsed) return results;

  for (let i = 0; i < parsed.length; i++) {
    const assetData = parsed[i].price;
    results.set(feedIds[i], {
      price: Number(assetData.price),
      confidence: Number(assetData.conf),
      timestamp: Number(assetData.publish_time) * 1000,
    });
  }

  return results;
}
