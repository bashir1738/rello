const PRESTOCKS_API = "https://prestocks.com/api/prestocks";

export interface PreStock {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  ipoDate: string | null;
  status: "active" | "upcoming" | "completed";
  imageUrl: string | null;
}

export interface PreStocksResponse {
  data: PreStock[];
  total: number;
}

export async function fetchPreStocks(): Promise<PreStock[]> {
  try {
    const res = await fetch(PRESTOCKS_API, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`PreStocks API error: ${res.status}`);
    }

    const json = await res.json();
    return json.data ?? json ?? [];
  } catch (err) {
    console.error("Failed to fetch PreStocks:", err);
    return [];
  }
}

export async function fetchPreStockByTicker(
  ticker: string
): Promise<PreStock | null> {
  const stocks = await fetchPreStocks();
  return (
    stocks.find(
      (s) => s.ticker.toUpperCase() === ticker.toUpperCase()
    ) ?? null
  );
}
