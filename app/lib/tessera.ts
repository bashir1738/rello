const TESSERA_API = "https://rest-api.tessera.pe/v1/public/token-details";

export interface TesseraToken {
  id: string;
  name: string;
  ticker: string;
  contractAddress: string;
  chain: string;
  currentPrice: number;
  totalSupply: number;
  marketCap: number;
  projectDescription: string;
  website: string | null;
  logoUrl: string | null;
}

export async function fetchTesseraTokens(): Promise<TesseraToken[]> {
  try {
    const res = await fetch(TESSERA_API, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Tessera API error: ${res.status}`);
    }

    const json = await res.json();
    return json.data ?? json.tokens ?? [];
  } catch (err) {
    console.error("Failed to fetch Tessera tokens:", err);
    return [];
  }
}

export async function fetchTesseraByTicker(
  ticker: string
): Promise<TesseraToken | null> {
  const tokens = await fetchTesseraTokens();
  return (
    tokens.find(
      (t) => t.ticker.toUpperCase() === ticker.toUpperCase()
    ) ?? null
  );
}
