"use client";

import { useEffect, useRef, useState } from "react";

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={`w-full h-full ${className}`}>
      <rect width="48" height="48" rx="12" fill="#6C5DFF" fillOpacity="0.12" />
      <path
        d="M24 8L12 14v8c0 9.33 5.12 18.06 12 20 6.88-1.94 12-10.67 12-20v-8L24 8z"
        stroke="#6C5DFF"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M18 24l4 4 8-8" stroke="#00E5C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={`w-full h-full ${className}`}>
      <rect width="48" height="48" rx="12" fill="#00E5C7" fillOpacity="0.12" />
      <path d="M12 36V22" stroke="#8B93A7" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 36V16" stroke="#8B93A7" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 36V26" stroke="#6C5DFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 36V12" stroke="#6C5DFF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="12" r="3" fill="#6C5DFF" />
      <circle cx="28" cy="26" r="3" fill="#6C5DFF" />
      <circle cx="20" cy="16" r="3" fill="#00E5C7" />
      <circle cx="12" cy="22" r="3" fill="#8B93A7" />
    </svg>
  );
}

function SwapIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={`w-full h-full ${className}`}>
      <rect width="48" height="48" rx="12" fill="#FFB020" fillOpacity="0.12" />
      <path d="M14 20h20M30 16l4 4-4 4" stroke="#FFB020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 28H14M18 24l-4 4 4 4" stroke="#FFB020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={`w-full h-full ${className}`}>
      <rect width="48" height="48" rx="12" fill="#00D084" fillOpacity="0.12" />
      <circle cx="24" cy="24" r="12" stroke="#00D084" strokeWidth="2" fill="none" />
      <path d="M24 16v8l5 5" stroke="#00D084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PythLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect width="24" height="24" rx="6" fill="#6C5DFF" fillOpacity="0.2" />
      <text x="6" y="17" fill="#6C5DFF" fontSize="12" fontWeight="bold" fontFamily="monospace">P</text>
    </svg>
  );
}

function MeteoraLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect width="24" height="24" rx="6" fill="#00E5C7" fillOpacity="0.2" />
      <text x="5" y="17" fill="#00E5C7" fontSize="12" fontWeight="bold" fontFamily="monospace">M</text>
    </svg>
  );
}

function SolanaLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect width="24" height="24" rx="6" fill="#FF5C5C" fillOpacity="0.2" />
      <text x="6" y="17" fill="#FF5C5C" fontSize="12" fontWeight="bold" fontFamily="monospace">S</text>
    </svg>
  );
}

function useTilt(ref: React.RefObject<HTMLDivElement | null>, intensity = 15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el!.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(4px)`;
    }

    function handleLeave() {
      el!.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    }

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref, intensity]);
}

function TiltCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, 8);
  return (
    <div
      ref={ref}
      className={`card-3d animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function FlowDiagram() {
  return (
    <svg viewBox="0 0 800 200" fill="none" className="w-full max-w-3xl animate-fade-in-up delay-3">
      <rect x="0" y="60" width="140" height="80" rx="8" fill="#131826" stroke="#6C5DFF" strokeWidth="1.5" />
      <text x="70" y="90" textAnchor="middle" fill="#6C5DFF" fontSize="11" fontFamily="monospace" fontWeight="600">PYTH CORE</text>
      <text x="70" y="108" textAnchor="middle" fill="#8B93A7" fontSize="9" fontFamily="monospace">on-chain feeds</text>
      <text x="70" y="122" textAnchor="middle" fill="#00E5C7" fontSize="10" fontFamily="monospace" fontWeight="600">$189.84</text>

      <line x1="140" y1="100" x2="200" y2="100" stroke="#6C5DFF" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow-pulse" />
      <polygon points="198,96 206,100 198,104" fill="#6C5DFF" />

      <rect x="206" y="60" width="140" height="80" rx="8" fill="#131826" stroke="#00E5C7" strokeWidth="1.5" />
      <text x="276" y="90" textAnchor="middle" fill="#00E5C7" fontSize="11" fontFamily="monospace" fontWeight="600">RELLO ENGINE</text>
      <text x="276" y="108" textAnchor="middle" fill="#8B93A7" fontSize="9" fontFamily="monospace">drift + staleness</text>
      <text x="276" y="122" textAnchor="middle" fill="#FFB020" fontSize="10" fontFamily="monospace" fontWeight="600">-1.23% drift</text>

      <line x1="346" y1="100" x2="406" y2="100" stroke="#00E5C7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow-pulse" style={{ animationDelay: "0.5s" }} />
      <polygon points="404,96 412,100 404,104" fill="#00E5C7" />

      <rect x="412" y="60" width="140" height="80" rx="8" fill="#131826" stroke="#FFB020" strokeWidth="1.5" />
      <text x="482" y="90" textAnchor="middle" fill="#FFB020" fontSize="11" fontFamily="monospace" fontWeight="600">RELLO AGENT</text>
      <text x="482" y="108" textAnchor="middle" fill="#8B93A7" fontSize="9" fontFamily="monospace">decide + execute</text>
      <text x="482" y="122" textAnchor="middle" fill="#FF5C5C" fontSize="10" fontFamily="monospace" fontWeight="600">autonomous</text>

      <line x1="552" y1="100" x2="612" y2="100" stroke="#FFB020" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow-pulse" style={{ animationDelay: "1s" }} />
      <polygon points="610,96 618,100 610,104" fill="#FFB020" />

      <rect x="618" y="60" width="140" height="80" rx="8" fill="#131826" stroke="#FF5C5C" strokeWidth="1.5" />
      <text x="688" y="90" textAnchor="middle" fill="#FF5C5C" fontSize="11" fontFamily="monospace" fontWeight="600">METEORA DLMM</text>
      <text x="688" y="108" textAnchor="middle" fill="#8B93A7" fontSize="9" fontFamily="monospace">corrective swap</text>
      <text x="688" y="122" textAnchor="middle" fill="#00D084" fontSize="10" fontFamily="monospace" fontWeight="600">peg restored</text>

      <rect x="412" y="155" width="140" height="40" rx="6" fill="#131826" stroke="#8B93A7" strokeWidth="1" strokeDasharray="3 3" />
      <text x="482" y="180" textAnchor="middle" fill="#8B93A7" fontSize="9" fontFamily="monospace">Guard Program (Phase 3)</text>
      <line x1="482" y1="140" x2="482" y2="155" stroke="#8B93A7" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

function LiveTicker({ data }: { data: { price: number; driftPct: number; status: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, 6);
  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-8 bg-surface border border-white/10 rounded-xl px-10 py-6 animate-scale-in delay-4"
    >
      <div className="text-left">
        <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">AAPL Live</div>
        <div className="text-3xl font-mono font-bold text-data">${data.price.toFixed(2)}</div>
      </div>
      <div className="w-px h-12 bg-white/10" />
      <div className="text-left">
        <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Drift</div>
        <div className={`text-3xl font-mono font-bold ${
          data.status === "reference_stale" ? "text-warning" :
          Math.abs(data.driftPct) < 0.5 ? "text-healthy" :
          Math.abs(data.driftPct) < 1.5 ? "text-warning" : "text-critical"
        }`}>
          {data.status === "reference_stale" ? "STALE" : `${data.driftPct >= 0 ? "+" : ""}${data.driftPct.toFixed(2)}%`}
        </div>
      </div>
      <div className="w-px h-12 bg-white/10" />
      <div className="text-left">
        <div className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">Status</div>
        <div className={`text-sm font-medium ${
          data.status === "reference_stale" ? "text-warning" :
          data.status === "healthy" ? "text-healthy" :
          data.status === "warning" ? "text-warning" : "text-critical"
        }`}>
          {data.status === "reference_stale" ? "Market Closed" :
           data.status === "healthy" ? "Pegged" :
           data.status === "warning" ? "Drifting" : "Critical"}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [aaplData, setAaplData] = useState<{ price: number; driftPct: number; status: string } | null>(null);

  useEffect(() => {
    fetch("/api/assets/AAPL")
      .then((r) => r.json())
      .then((d) => {
        const asset = d.assets?.[0];
        if (asset) {
          setAaplData({ price: asset.referencePrice, driftPct: asset.driftPct, status: asset.status });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 pt-20 pb-16">
        <div className="mx-auto max-w-5xl text-center perspective">
          <div className="inline-flex items-center gap-2 bg-surface border border-white/10 rounded-full px-4 py-1.5 mb-8 text-xs font-mono text-text-muted animate-fade-in-up animate-pulse-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-healthy animate-pulse" />
            Colosseum Stocklana Hackathon — Pyth + Meteora Bounties
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-in-up delay-1">
            What is this asset
            <br />
            <span className="text-brand">actually worth?</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-2">
            Rello is market-integrity infrastructure for tokenized equities on
            Solana. It compares on-chain wrapped prices against real-world Pyth
            feeds, detects drift, and autonomously corrects it — so pegged
            assets stay pegged.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in-up delay-3">
            <a href="/dashboard" className="btn-3d inline-flex items-center px-7 py-3.5 bg-brand text-white rounded-lg font-medium">
              Open Dashboard
            </a>
            <a href="/developers" className="btn-3d inline-flex items-center px-7 py-3.5 border border-white/20 rounded-lg font-medium">
              API Docs
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-3d inline-flex items-center px-7 py-3.5 border border-white/20 rounded-lg font-medium">
              GitHub
            </a>
          </div>
          {aaplData && <LiveTicker data={aaplData} />}
        </div>
      </section>

      {/* Three questions */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">Three questions, one system</h2>
            <p className="text-text-muted max-w-xl mx-auto animate-fade-in-up delay-1">
              Every component answers a specific question about market integrity.
              Together they form a closed loop from price discovery to correction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective">
            <TiltCard delay={1} className="bg-surface border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 mb-4 icon-3d">
                <PythLogo />
              </div>
              <div className="text-xs font-mono text-brand mb-2">01 — Pyth</div>
              <h3 className="text-lg font-bold mb-2">What is this asset actually worth?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Pyth Core on-chain price feeds provide the ground truth. We read
                them directly — no API key, no external dependency — so the
                critical path stays permissionless and fast.
              </p>
            </TiltCard>
            <TiltCard delay={2} className="bg-surface border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 mb-4 icon-3d">
                <ChartIcon />
              </div>
              <div className="text-xs font-mono text-data mb-2">02 — Rello Engine</div>
              <h3 className="text-lg font-bold mb-2">How far is the on-chain market from that value?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                The engine compares the wrapped token price against the Pyth
                reference, calculates a weighted Peg Health Score, and detects
                staleness when NYSE markets are closed.
              </p>
            </TiltCard>
            <TiltCard delay={3} className="bg-surface border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 mb-4 icon-3d">
                <SwapIcon />
              </div>
              <div className="text-xs font-mono text-warning mb-2">03 — Rello Agent</div>
              <h3 className="text-lg font-bold mb-2">When should we act?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                The agent monitors drift continuously. When it crosses a
                threshold and the reference is live, it executes a corrective
                swap via Meteora DLMM — or recommends the action in log-only
                mode.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="px-4 py-20 bg-surface/50 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">How it works</h2>
            <p className="text-text-muted max-w-xl mx-auto animate-fade-in-up delay-1">
              A single pipeline from raw price data to autonomous market correction.
            </p>
          </div>
          <div className="flex justify-center perspective">
            <FlowDiagram />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">Built for hackathon speed, production truth</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective">
            {[
              { icon: <ShieldIcon />, title: "Permissionless Price Reads", text: "The agent reads Pyth Core accounts directly on-chain. No API key, no rate limit, no single point of failure. Hermes is used only for dashboard display." },
              { icon: <ClockIcon />, title: "Equity-Aware Staleness", text: "Tokenized equities trade 24/7 but real stocks don\u2019t. Rello detects NYSE hours and feed staleness, returning explicit status instead of false drift signals." },
              { icon: <ChartIcon />, title: "Peg Health Score", text: "A weighted composite of drift magnitude, drift duration, and pool depth. Not just a threshold check \u2014 a continuous signal that captures how unhealthy the peg really is." },
              { icon: <SwapIcon />, title: "Autonomous Correction", text: "When drift exceeds threshold, the agent recommends a corrective swap via Jupiter aggregated routes. Feature-flagged: runs in log-only mode by default, upgrades to live execution with one env var." },
              { icon: <ShieldIcon />, title: "On-Chain Guard Rails", text: "The Rello Guard program validates every correction on-chain: authorized agent, deviation above threshold, trade below max, correct pool. No action without approval." },
              { icon: <ClockIcon />, title: "Real-Time Dashboard", text: "Live drift tracking, historical price charts, agent activity log. The activity log shows every autonomous correction with tx signature \u2014 the primary demo surface." },
            ].map((f, i) => (
              <TiltCard key={i} delay={i * 0.1} className="bg-surface border border-white/10 rounded-xl p-6 flex gap-4">
                <div className="w-10 h-10 shrink-0 mt-0.5 icon-3d">{f.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.text}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why Solana */}
      <section className="px-4 py-20 bg-surface/50 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center perspective">
          <div className="inline-flex items-center gap-2 mb-6 animate-fade-in-up">
            <SolanaLogo />
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Why Solana</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 animate-fade-in-up delay-1">
            Sub-second correction needs sub-second settlement
          </h2>
          <p className="text-text-muted leading-relaxed text-lg animate-fade-in-up delay-2">
            Automated market integrity only works if the correction can land
            before the market moves again. Solana&apos;s 400ms block times and
            sub-cent transaction costs make autonomous, high-frequency peg
            correction viable in a way no other chain can match.
          </p>
        </div>
      </section>

      {/* Bounty callout */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">Hackathon Tracks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective">
            <TiltCard delay={1} className="bg-surface border border-brand/30 rounded-xl p-6 animate-border-shift">
              <div className="text-xs font-mono text-brand mb-3">MAIN TRACK</div>
              <h3 className="font-bold mb-2">Rello Core</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Complete market-integrity pipeline: Pyth price reads, drift
                detection, corrective swap recommendations via Jupiter,
                on-chain guard rails via Anchor.
              </p>
            </TiltCard>
            <TiltCard delay={2} className="bg-surface border border-data/30 rounded-xl p-6">
              <div className="text-xs font-mono text-data mb-3">PYTH BOUNTY</div>
              <h3 className="font-bold mb-2">Multi-Feed Comparison</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Compare Equity.US, xStock, and Ondo feeds side-by-side.
                Direct on-chain Pyth Core reads for the critical path.
              </p>
            </TiltCard>
            <TiltCard delay={3} className="bg-surface border border-warning/30 rounded-xl p-6">
              <div className="text-xs font-mono text-warning mb-3">METEORA BOUNTY</div>
              <h3 className="font-bold mb-2">Meteora DLMM Integration</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                DLMM pool configuration UI with asymmetric fee tuning for
                equity-like assets. Swap execution wired to Meteora SDK.
                Pool creation requires funded agent wallet.
              </p>
            </TiltCard>
            <TiltCard delay={4} className="bg-surface border border-healthy/30 rounded-xl p-6">
              <div className="text-xs font-mono text-healthy mb-3">PRESTOCKS BOUNTY</div>
              <h3 className="font-bold mb-2">Pre-IPO Integration</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                PreStocks API integration showing tokenized pre-IPO stocks
                alongside live equities. Compare pre-IPO pricing with on-chain data.
              </p>
            </TiltCard>
            <TiltCard delay={5} className="bg-surface border border-critical/30 rounded-xl p-6">
              <div className="text-xs font-mono text-critical mb-3">TESSERA BOUNTY</div>
              <h3 className="font-bold mb-2">Tessera Tokens</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Tessera pre-IPO token data integrated into the dashboard.
                One surface for all tokenized equity exposure.
              </p>
            </TiltCard>
            <TiltCard delay={6} className="bg-surface border border-white/20 rounded-xl p-6">
              <div className="text-xs font-mono text-text-muted mb-3">TRADING</div>
              <h3 className="font-bold mb-2">24/7 Swap Interface</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Wallet-connected swap UI. Trade tokenized equities any time
                via Meteora DLMM pools. On-chain guard rails validate every swap.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="px-4 py-20 bg-surface/50 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-8 animate-fade-in-up">Tech Stack</h2>
          <div className="flex items-center justify-center gap-6 flex-wrap perspective">
            {[
              { logo: <PythLogo />, label: "Pyth Network" },
              { logo: <MeteoraLogo />, label: "Meteora DLMM" },
              { logo: <SolanaLogo />, label: "Solana" },
              { logo: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect width="24" height="24" rx="6" fill="#ffffff" fillOpacity="0.1" /><text x="4" y="17" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">N</text></svg>, label: "Next.js" },
              { logo: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect width="24" height="24" rx="6" fill="#ffffff" fillOpacity="0.1" /><text x="3" y="17" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">Su</text></svg>, label: "Supabase" },
              { logo: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect width="24" height="24" rx="6" fill="#ffffff" fillOpacity="0.1" /><text x="4" y="17" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">A</text></svg>, label: "Anchor" },
              { logo: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect width="24" height="24" rx="6" fill="#00D084" fillOpacity="0.2" /><text x="2" y="17" fill="#00D084" fontSize="10" fontWeight="bold" fontFamily="monospace">PS</text></svg>, label: "PreStocks" },
              { logo: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect width="24" height="24" rx="6" fill="#FFB020" fillOpacity="0.2" /><text x="3" y="17" fill="#FFB020" fontSize="10" fontWeight="bold" fontFamily="monospace">Ts</text></svg>, label: "Tessera" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-background border border-white/10 rounded-lg px-4 py-2.5 card-3d animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="icon-3d">{t.logo}</span>
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-white/5">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-brand">Rello</span>
            <span className="text-xs text-text-muted font-mono">market integrity for tokenized equities</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="/dashboard" className="nav-link-3d">Dashboard</a>
            <a href="/compare" className="nav-link-3d">Feeds</a>
            <a href="/trade" className="nav-link-3d">Trade</a>
            <a href="/pre-ipo" className="nav-link-3d">Pre-IPO</a>
            <a href="/activity" className="nav-link-3d">Activity</a>
            <a href="/developers" className="nav-link-3d">Developers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
