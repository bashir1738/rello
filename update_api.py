content = """\"use client\";

import { useRef, useEffect } from "react";
import { Terminal, Copy, CheckCircle2 } from "lucide-react";

function CodeSnippet({ title, code, language = "json" }: { title: string; code: string; language?: string }) {
  return (
    <div className="bg-[#111111] text-gray-300 rounded-xl overflow-hidden border border-black/10 shadow-sm mt-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
        <span className="text-xs font-mono text-gray-400">{title}</span>
        <button className="text-gray-500 hover:text-white transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiEndpointDetail({ 
  method, 
  path, 
  title, 
  description, 
  params, 
  responseCode 
}: { 
  method: string; 
  path: string; 
  title: string; 
  description: string; 
  params?: { name: string; type: string; req: boolean; desc: string }[];
  responseCode: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-healthy/10 text-healthy border-healthy/20",
    POST: "bg-warning/10 text-warning border-warning/20",
    PUT: "bg-brand/10 text-brand border-brand/20",
    DELETE: "bg-critical/10 text-critical border-critical/20",
  };

  return (
    <div className="bg-surface border border-black/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow mb-8 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-start gap-12">
        {/* Info Column */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-text-muted mb-6 leading-relaxed text-lg">{description}</p>
          
          <div className="inline-flex items-center gap-3 bg-black/5 rounded-lg p-1.5 pr-4 mb-8">
            <span className={`px-3 py-1 text-xs font-mono font-bold rounded-md border ${methodColors[method] || "bg-black/10 text-text border-black/20"}`}>
              {method}
            </span>
            <code className="text-sm font-mono text-text">{path}</code>
          </div>

          {params && params.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Parameters</h4>
              <div className="divide-y divide-black/5 border-t border-b border-black/5">
                {params.map((p, i) => (
                  <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <code className="text-sm font-mono font-bold text-text">{p.name}</code>
                      {p.req && <span className="text-[9px] text-critical bg-critical/10 px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-widest">Required</span>}
                    </div>
                    <code className="text-xs text-brand font-mono bg-brand/5 px-2 py-1 rounded">{p.type}</code>
                    <span className="text-sm text-text-muted">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Column */}
        <div className="flex-1 lg:max-w-[450px] w-full">
          <CodeSnippet title="Example Response" code={responseCode} />
        </div>
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 perspective">
      {/* Header */}
      <div className="mb-20 animate-fade-in-up border-b border-black/5 pb-16">
        <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-1.5 mb-8">
          <Terminal className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-widest">API Documentation</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Developer API</h1>
        <p className="text-xl md:text-2xl text-text-muted max-w-4xl leading-relaxed font-light">
          Integrate Rello&apos;s real-time market integrity data directly into your applications. Access high-fidelity on-chain analytics, trigger drift corrections, and query Pyth Network metrics.
        </p>
      </div>

      <div className="space-y-4">
        <ApiEndpointDetail 
          title="Retrieve All Tracked Assets"
          method="GET" 
          path="/api/assets" 
          description="Fetches a global list of all tokenized assets actively tracked by the Rello Engine. Includes current peg health scores, absolute drift percentages, and staleness status relative to real-world market hours." 
          responseCode={`{
  "total": 4,
  "assets": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "referencePrice": 189.84,
      "wrappedPrice": 189.90,
      "driftPct": 0.03,
      "status": "healthy"
    },
    ...
  ]
}`}
        />

        <ApiEndpointDetail 
          title="Query Specific Asset Details"
          method="GET" 
          path="/api/assets/[symbol]" 
          description="Fetch deep, isolated data for a specific ticker symbol. Use this endpoint when rendering detailed single-asset views, charts, or automated trading bots." 
          params={[
            { name: "symbol", type: "string", req: true, desc: "The unique ticker symbol (e.g., AAPL)." }
          ]}
          responseCode={`{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "pythFeedAddress": "4Zk...",
  "currentPrice": 189.84,
  "poolDepth": 450000.00,
  "lastUpdate": "2026-09-16T14:30:00.000Z",
  "status": "healthy"
}`}
        />

        <ApiEndpointDetail 
          title="Get Asset Price History"
          method="GET" 
          path="/api/assets/[symbol]/history" 
          description="Retrieve time-series snapshots of an asset's drift and price history. Perfectly formatted for integration with Recharts, TradingView, or custom dashboard visualizations." 
          params={[
            { name: "symbol", type: "string", req: true, desc: "The unique ticker symbol." },
            { name: "hours", type: "number", req: false, desc: "Timeframe in hours (default: 24)." },
            { name: "limit", type: "number", req: false, desc: "Max data points to return (default: 200)." }
          ]}
          responseCode={`{
  "symbol": "AAPL",
  "history": [
    {
      "timestamp": "2026-09-16T14:30:00Z",
      "wrappedPrice": 189.90,
      "referencePrice": 189.84,
      "driftBps": 3.1
    },
    ...
  ]
}`}
        />

        <ApiEndpointDetail 
          title="Execute Corrective Swap"
          method="POST" 
          path="/api/swap/execute" 
          description="Triggers the Rello Agent to execute a corrective arbitrage swap through Meteora DLMM. Note: Requires cryptographic signature verification in production environments." 
          params={[
            { name: "symbol", type: "string", req: true, desc: "The asset to correct." },
            { name: "amountIn", type: "number", req: true, desc: "Exact token amount to swap." },
            { name: "slippageBps", type: "number", req: false, desc: "Slippage tolerance (default: 50)." }
          ]}
          responseCode={`{
  "success": true,
  "transactionId": "5YQv3H...",
  "correction": {
    "driftBefore": 1.25,
    "driftAfter": 0.02,
    "profitUsd": 142.50
  }
}`}
        />
      </div>
    </div>
  );
}
"""
with open("app/app/developers/page.tsx", "w") as f:
    f.write(content)
