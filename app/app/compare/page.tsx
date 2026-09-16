import { readPythPrice } from "@/lib/pyth";
import { PYTH_FEED_COMPARISON } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface FeedData {
  label: string;
  source: string;
  price: number;
  confidence: number;
  publishTime: string;
  feedAge: string;
  isStale: boolean;
  error?: string;
}

async function fetchFeedComparison(): Promise<FeedData[]> {
  const feeds = PYTH_FEED_COMPARISON.AAPL;
  if (!feeds) return [];

  const results = await Promise.all(
    feeds.map(async (feed) => {
      if (!feed.feedAddress) {
        return {
          label: feed.label,
          source: feed.source,
          price: 0,
          confidence: 0,
          publishTime: "—",
          feedAge: "—",
          isStale: true,
          error: "Feed address not configured",
        };
      }

      try {
        const data = await readPythPrice(feed.feedAddress);
        return {
          label: feed.label,
          source: feed.source,
          price: data.price,
          confidence: data.confidence,
          publishTime: new Date(data.publishTimeMs).toLocaleTimeString(),
          feedAge: `${((Date.now() - data.publishTimeMs) / 1000 / 60).toFixed(1)} min`,
          isStale: data.staleness.isStale,
        };
      } catch (err) {
        return {
          label: feed.label,
          source: feed.source,
          price: 0,
          confidence: 0,
          publishTime: "—",
          feedAge: "—",
          isStale: true,
          error: err instanceof Error ? err.message : "Failed to read",
        };
      }
    })
  );

  return results;
}

function FeedCard({ feed, index }: { feed: FeedData; index: number }) {
  const sourceColors: Record<string, string> = {
    equity: "text-brand border-brand/30",
    xstock: "text-data border-data/30",
    ondo: "text-warning border-warning/30",
  };

  const sourceBg: Record<string, string> = {
    equity: "bg-brand/10",
    xstock: "bg-data/10",
    ondo: "bg-warning/10",
  };

  return (
    <div
      className={`bg-surface border rounded-xl p-6 card-3d animate-fade-in-up ${sourceColors[feed.source] ?? "border-white/10"}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${sourceBg[feed.source] ?? "bg-white/10"} ${sourceColors[feed.source]?.split(" ")[0] ?? "text-text-muted"}`}>
          {feed.source}
        </span>
        {feed.isStale && (
          <span className="text-xs font-mono text-warning flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            Stale
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-1">{feed.label}</h3>

      {feed.error ? (
        <div className="text-sm text-text-muted font-mono mt-4 p-3 bg-white/5 rounded-lg">
          {feed.error}
        </div>
      ) : (
        <>
          <div className="text-3xl font-mono font-bold text-text mt-4">
            ${feed.price.toFixed(2)}
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            ±${feed.confidence.toFixed(2)} confidence
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-text-muted font-mono">Last Publish</div>
              <div className="text-sm font-mono mt-0.5">{feed.publishTime}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-text-muted font-mono">Feed Age</div>
              <div className="text-sm font-mono mt-0.5">{feed.feedAge}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DriftMatrix({ feeds }: { feeds: FeedData[] }) {
  const validFeeds = feeds.filter((f) => f.price > 0);
  if (validFeeds.length < 2) return null;

  const base = validFeeds[0];
  const pairs = validFeeds.slice(1);

  return (
    <div className="bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-3">
      <h3 className="text-lg font-bold mb-4">Cross-Feed Drift</h3>
      <div className="space-y-3">
        {pairs.map((pair) => {
          const driftPct =
            base.price > 0
              ? ((pair.price - base.price) / base.price) * 100
              : 0;
          const driftBps = Math.round(driftPct * 100);

          return (
            <div
              key={pair.source}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div>
                <span className="text-sm font-mono text-text-muted">
                  {base.source}
                </span>
                <span className="text-sm text-text-muted mx-2">→</span>
                <span className="text-sm font-mono">{pair.source}</span>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono font-bold ${
                    Math.abs(driftPct) < 0.5
                      ? "text-healthy"
                      : Math.abs(driftPct) < 2
                        ? "text-warning"
                        : "text-critical"
                  }`}
                >
                  {driftPct >= 0 ? "+" : ""}
                  {driftPct.toFixed(3)}%
                </div>
                <div className="text-xs text-text-muted font-mono">
                  {driftBps} bps
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function ComparePage() {
  const feeds = await fetchFeedComparison();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 perspective">
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
        <h1 className="text-3xl font-bold">Price Feed Comparison</h1>
        <p className="text-text-muted text-sm mt-1">
          Compare Pyth equity feeds vs xStock vs Ondo tokenized stock prices
        </p>
      </div>

      {/* Feed cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {feeds.map((feed, i) => (
          <FeedCard key={feed.source} feed={feed} index={i} />
        ))}
        {feeds.length === 0 && (
          <div className="col-span-full bg-surface border border-white/10 rounded-xl p-12 text-center">
            <p className="text-text-muted text-sm">
              No feed comparison data available for this asset.
            </p>
          </div>
        )}
      </div>

      {/* Drift matrix */}
      <DriftMatrix feeds={feeds} />

      {/* Explanation */}
      <div className="mt-8 bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-4">
        <h3 className="text-lg font-bold mb-3">About Feed Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-muted">
          <div>
            <span className="font-mono text-brand font-bold">Equity</span>
            <p className="mt-1">
              Direct Pyth price feeds for the underlying equity. Tradeable
              during NYSE hours. The ground-truth reference price.
            </p>
          </div>
          <div>
            <span className="font-mono text-data font-bold">xStock</span>
            <p className="mt-1">
              Tokenized stock representation on Solana. Trades 24/7. Price may
              drift from equity feed due to continuous trading.
            </p>
          </div>
          <div>
            <span className="font-mono text-warning font-bold">Ondo</span>
            <p className="mt-1">
              Ondo Finance tokenized equity. Another on-chain representation
              with its own market dynamics and liquidity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
