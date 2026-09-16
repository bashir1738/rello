export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Developer API</h1>
        <p className="text-text-muted text-sm mt-1">
          Integrate Rello&apos;s market integrity data into your applications.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Endpoints</h2>
          <div className="space-y-4">
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-healthy/15 text-healthy text-xs font-mono rounded">
                  GET
                </span>
                <code className="text-sm font-mono">/api/assets</code>
              </div>
              <p className="text-sm text-text-muted">
                List all tracked assets with current health scores and drift
                data.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-healthy/15 text-healthy text-xs font-mono rounded">
                  GET
                </span>
                <code className="text-sm font-mono">
                  /api/assets/[symbol]
                </code>
              </div>
              <p className="text-sm text-text-muted">
                Get detailed data for a specific asset including price history.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-healthy/15 text-healthy text-xs font-mono rounded">
                  GET
                </span>
                <code className="text-sm font-mono">
                  /api/assets/[symbol]/history?hours=24
                </code>
              </div>
              <p className="text-sm text-text-muted">
                Get historical snapshots for charting. Params:{" "}
                <code className="text-xs bg-white/10 px-1 rounded">
                  hours
                </code>{" "}
                (default 24),{" "}
                <code className="text-xs bg-white/10 px-1 rounded">
                  limit
                </code>{" "}
                (default 200).
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-warning/15 text-warning text-xs font-mono rounded">
                  POST
                </span>
                <code className="text-sm font-mono">/api/webhook</code>
              </div>
              <p className="text-sm text-text-muted">
                Receive alert payloads and forward to Discord/Slack webhooks.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-healthy/15 text-healthy text-xs font-mono rounded">
                  GET
                </span>
                <code className="text-sm font-mono">/api/cron/snapshot</code>
              </div>
              <p className="text-sm text-text-muted">
                Trigger a snapshot capture for all tracked assets. Call via cron
                or manually.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Sample Webhook Payload</h2>
          <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono">
            <code>{`{
  "symbol": "AAPL",
  "action": "corrective_swap_recommended",
  "driftPct": -1.23,
  "referencePrice": 189.84,
  "wrappedPrice": 187.52,
  "timestamp": "2026-09-16T14:30:00.000Z"
}`}</code>
          </pre>
        </section>

        <section className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">
            Agent Integration (Phase 2)
          </h2>
          <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono">
            <code>{`// Subscribe to live drift updates
const res = await fetch("https://your-domain.com/api/assets/AAPL");
const { driftBps, healthScore, status } = await res.json();

if (Math.abs(driftBps) > 50 && status !== "reference_stale") {
  // Threshold crossed — agent takes action
  console.log(\`Drift: \${driftBps}bps — initiating correction\`);
}`}</code>
          </pre>
        </section>

        <section className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Architecture</h2>
          <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-text-muted leading-relaxed">
            <code>{`Pyth Core (on-chain accounts, permissionless)
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
Meteora DBC Pool → Corrective swap → DAMM v2`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
