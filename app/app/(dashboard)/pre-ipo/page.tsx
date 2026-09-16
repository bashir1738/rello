import { fetchPreStocks, type PreStock } from "@/lib/prestocks";
import { fetchTesseraTokens, type TesseraToken } from "@/lib/tessera";
import Link from "next/link";

export const dynamic = "force-dynamic";

function PreStockCard({ stock }: { stock: PreStock }) {
  const changePercent = stock.changePercent ?? 0;
  const changeColor = changePercent >= 0 ? "text-healthy" : "text-critical";

  return (
    <div className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {stock.imageUrl && (
            <img
              src={stock.imageUrl}
              alt={stock.ticker}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="font-bold">{stock.ticker}</div>
            <div className="text-xs text-text-muted">{stock.name}</div>
          </div>
        </div>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            stock.status === "active"
              ? "bg-healthy/15 text-healthy"
              : stock.status === "upcoming"
                ? "bg-warning/15 text-warning"
                : "bg-white/10 text-text-muted"
          }`}
        >
          {stock.status}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-mono font-bold">
            ${typeof stock.currentPrice === 'number' ? stock.currentPrice.toFixed(2) : 'N/A'}
          </div>
          <div className={`text-xs font-mono ${changeColor}`}>
            {changePercent >= 0 ? "+" : ""}
            {typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) + "%" : "N/A"}
          </div>
        </div>
        {stock.ipoDate && (
          <div className="text-right">
            <div className="text-xs text-text-muted">IPO Date</div>
            <div className="text-sm font-mono">{stock.ipoDate}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TesseraCard({ token }: { token: TesseraToken }) {
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-5 card-3d animate-fade-in-up">
      <div className="flex items-center gap-3 mb-3">
        {token.logoUrl && (
          <img
            src={token.logoUrl}
            alt={token.ticker}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div>
          <div className="font-bold">{token.ticker}</div>
          <div className="text-xs text-text-muted">{token.name}</div>
        </div>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full bg-brand/15 text-brand">
          Tessera
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-text-muted font-mono">Price</div>
          <div className="text-lg font-mono font-bold">
            ${typeof token.currentPrice === 'number' ? token.currentPrice.toFixed(2) : 'N/A'}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-text-muted font-mono">Market Cap</div>
          <div className="text-lg font-mono font-bold">
            {typeof token.marketCap === 'number'
              ? `$${token.marketCap >= 1e6 ? (token.marketCap / 1e6).toFixed(1) + 'M' : token.marketCap.toLocaleString()}`
              : 'N/A'}
          </div>
        </div>
      </div>
      {token.projectDescription && (
        <p className="text-xs text-text-muted mt-3 line-clamp-2">
          {token.projectDescription}
        </p>
      )}
    </div>
  );
}

export default async function PreIPOPage() {
  const [preStocks, tesseraTokens] = await Promise.all([
    fetchPreStocks(),
    fetchTesseraTokens(),
  ]);

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 md:px-8 py-8 perspective">
      <div className="mb-8 animate-fade-in-up">
        <Link
          href="/dashboard"
          className="nav-link-3d text-sm text-text-muted inline-flex items-center gap-1.5 mb-4"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"
            />
          </svg>
          Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Pre-IPO & Tokenized Stocks</h1>
        <p className="text-text-muted text-sm mt-1">
          Pre-IPO stocks via PreStocks and Tessera — trade before the IPO
        </p>
      </div>

      {/* PreStocks */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up delay-1">
          <h2 className="text-xl font-bold">PreStocks</h2>
          <span className="text-xs font-mono text-text-muted bg-white/10 px-2.5 py-1 rounded-full">
            {preStocks.length} tokens
          </span>
        </div>
        {preStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preStocks.map((stock, index) => (
              <PreStockCard key={stock.ticker || stock.id || index} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-white/10 rounded-xl p-12 text-center">
            <p className="text-text-muted text-sm">
              No PreStocks data available. The API may be unreachable.
            </p>
          </div>
        )}
      </section>

      {/* Tessera */}
      <section>
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up delay-2">
          <h2 className="text-xl font-bold">Tessera</h2>
          <span className="text-xs font-mono text-text-muted bg-white/10 px-2.5 py-1 rounded-full">
            {tesseraTokens.length} tokens
          </span>
        </div>
        {tesseraTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tesseraTokens.map((token, index) => (
              <TesseraCard key={token.ticker || token.id || index} token={token} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-white/10 rounded-xl p-12 text-center">
            <p className="text-text-muted text-sm">
              No Tessera data available. The API may be unreachable.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
