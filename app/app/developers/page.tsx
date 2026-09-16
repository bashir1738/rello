"use client";

import { useRef, useEffect } from "react";

function EndpointCard({ method, path, desc, delay }: { method: string; path: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px) rotateX(2deg)";
    const timer = setTimeout(() => {
      el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0) rotateX(0)";
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const methodColors: Record<string, string> = {
    GET: "bg-healthy/15 text-healthy",
    POST: "bg-warning/15 text-warning",
    PUT: "bg-brand/15 text-brand",
    DELETE: "bg-critical/15 text-critical",
  };

  return (
    <div ref={ref} className="bg-background rounded-lg p-4 card-3d group">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded ${methodColors[method] ?? "bg-white/10 text-text"}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-text">{path}</code>
      </div>
      <p className="text-sm text-text-muted">{desc}</p>
    </div>
  );
}

function CodeBlock({ title, code, delay }: { title: string; code: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "perspective(600px) rotateX(3deg) translateY(12px)";
    const timer = setTimeout(() => {
      el.style.transition = "transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "perspective(600px) rotateX(0) translateY(0)";
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} className="bg-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <h3 className="text-sm font-bold">{title}</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-critical/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-healthy/60" />
        </div>
      </div>
      <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 perspective">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Developer API</h1>
        <p className="text-text-muted">
          Integrate Rello&apos;s market integrity data into your applications.
        </p>
      </div>

      <div className="space-y-8">
        {/* Endpoints */}
        <section className="animate-fade-in-up delay-1">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-brand"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0011.5 2h-7zM8 1a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 1zm0 8a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 9z" /></svg>
            Endpoints
          </h2>
          <div className="space-y-3">
            <EndpointCard method="GET" path="/api/assets" desc="List all tracked assets with current health scores and drift data." delay={100} />
            <EndpointCard method="GET" path="/api/assets/[symbol]" desc="Get detailed data for a specific asset including price history." delay={150} />
            <EndpointCard method="GET" path="/api/assets/[symbol]/history?hours=24" desc="Get historical snapshots for charting. Params: hours (default 24), limit (default 200)." delay={200} />
            <EndpointCard method="POST" path="/api/swap/quote" desc="Get a swap quote for tokenized equity pairs via Meteora DBC." delay={225} />
            <EndpointCard method="POST" path="/api/swap/execute" desc="Execute a swap through Meteora DBC. Requires wallet signature." delay={250} />
            <EndpointCard method="POST" path="/api/pools/create" desc="Create a new Meteora DBC pool with equity-tuned curve config." delay={275} />
            <EndpointCard method="POST" path="/api/webhook" desc="Receive alert payloads and forward to Discord/Slack webhooks." delay={300} />
            <EndpointCard method="GET" path="/api/cron/snapshot" desc="Trigger a snapshot capture for all tracked assets. Call via cron or manually." delay={350} />
          </div>
        </section>

        {/* Webhook payload */}
        <CodeBlock
          title="Sample Webhook Payload"
          delay={350}
          code={`{
  "symbol": "AAPL",
  "action": "corrective_swap_recommended",
  "driftPct": -1.23,
  "referencePrice": 189.84,
  "wrappedPrice": 187.52,
  "timestamp": "2026-09-16T14:30:00.000Z"
}`}
        />

        {/* Agent integration */}
        <CodeBlock
          title="Agent Integration (Phase 2)"
          delay={400}
          code={`// Subscribe to live drift updates
const res = await fetch("https://your-domain.com/api/assets/AAPL");
const { driftBps, healthScore, status } = await res.json();

if (Math.abs(driftBps) > 50 && status !== "reference_stale") {
  // Threshold crossed — agent takes action
  console.log(\`Drift: \${driftBps}bps — initiating correction\`);
}`}
        />

        {/* Architecture */}
        <CodeBlock
          title="Architecture"
          delay={450}
          code={`Pyth Core (on-chain accounts, permissionless)
    │
    ▼
Rello Engine (Next.js API routes)
    │ deviation + staleness check
    │
    ├──── Rello Dashboard (Next.js frontend)
    │
    ▼
Rello Agent (standalone Node service)
    │
    ├──── Rello Guard Program (Anchor, Phase 3)
    │     validates rules on-chain
    │
    ▼
Meteora DBC Pool → Corrective swap → DAMM v2`}
        />
      </div>
    </div>
  );
}
