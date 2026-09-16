"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Activity, Zap, Layers, RefreshCw, BarChart, Code2, Globe } from "lucide-react";

function LiveTicker({ data }: { data: { price: number; driftPct: number; status: string } }) {
  return (
    <div className="mt-16 flex flex-col items-center animate-fade-in-up delay-4">
      <div className="flex flex-col sm:flex-row items-center gap-8 bg-surface border border-white/10 rounded-2xl p-8 shadow-sm">
        <div className="text-left flex-1 min-w-[120px]">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-2">Live Asset</div>
          <div className="text-2xl font-bold">AAPL</div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-white/10" />
        <div className="text-left flex-1 min-w-[120px]">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-2">Pyth Oracle</div>
          <div className="text-2xl font-mono font-bold">${data.price.toFixed(2)}</div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-white/10" />
        <div className="text-left flex-1 min-w-[120px]">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-2">Drift</div>
          <div className={`text-2xl font-mono font-bold ${
            data.status === "reference_stale" ? "text-warning" :
            Math.abs(data.driftPct) < 0.5 ? "text-healthy" :
            Math.abs(data.driftPct) < 1.5 ? "text-warning" : "text-critical"
          }`}>
            {data.status === "reference_stale" ? "STALE" : `${data.driftPct >= 0 ? "+" : ""}${data.driftPct.toFixed(2)}%`}
          </div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-white/10" />
        <div className="text-left flex-1 min-w-[120px]">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-2">Status</div>
          <div className="flex items-center gap-2 text-base font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${
              data.status === "reference_stale" ? "bg-warning" :
              data.status === "healthy" ? "bg-healthy animate-pulse" :
              data.status === "warning" ? "bg-warning" : "bg-critical"
            }`} />
            {data.status === "reference_stale" ? "Market Closed" :
             data.status === "healthy" ? "Pegged" :
             data.status === "warning" ? "Drifting" : "Critical"}
          </div>
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
    <div className="flex flex-col overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-32 pb-24 border-b border-white/10 bg-surface">
        <div className="w-full max-w-[1536px] mx-auto text-center perspective">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 text-xs font-mono text-text-muted animate-fade-in-up">
            <Zap className="w-3.5 h-3.5 text-brand" />
            <span className="tracking-wide">Powered by Pyth Network & Solana</span>
          </div>
          <h1 className="text-6xl md:text-[100px] font-black tracking-tighter leading-[0.9] mb-8 animate-fade-in-up delay-1 text-text">
            Real-Time Integrity<br />
            <span className="text-brand">for Tokenized Equities.</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-muted max-w-4xl mx-auto mb-12 leading-relaxed font-light tracking-tight animate-fade-in-up delay-2">
            Rello is the execution layer for on-chain price parity. We detect drift using sub-second oracle feeds and autonomously correct it, keeping your pegged assets exactly where they belong.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up delay-3">
            <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-white text-black hover:bg-brand transition-colors rounded-full font-bold tracking-wide text-lg">
              Launch Platform
            </Link>
            <Link href="/developers" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-surface border border-white/10 hover:border-white/30 transition-colors rounded-full font-bold tracking-wide text-text text-lg shadow-sm">
              Read API Docs
            </Link>
          </div>
          {aaplData && <LiveTicker data={aaplData} />}
        </div>
      </section>

      {/* Trusted By / Integrations */}
      <section className="px-4 py-12 border-b border-white/10 bg-background">
        <div className="w-full max-w-[1536px] mx-auto text-center">
          <p className="text-sm font-mono text-text-muted uppercase tracking-widest mb-8">Integrated With The Best</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale">
            <div className="text-2xl font-black tracking-tighter">Pyth Network</div>
            <div className="text-2xl font-black tracking-tighter">Solana</div>
            <div className="text-2xl font-black tracking-tighter">Meteora</div>
            <div className="text-2xl font-black tracking-tighter">Tessera</div>
            <div className="text-2xl font-black tracking-tighter">PreStocks</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 px-4 py-32 bg-surface border-b border-white/10">
        <div className="w-full max-w-[1536px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-text">The Parity Engine</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-light">
              A closed-loop infrastructure designed to protect automated market makers from off-chain volatility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="col-span-1 md:col-span-2 bg-surface border border-white/10 rounded-3xl p-10 hover:border-white/10 transition-all">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-8">
                <Activity className="w-7 h-7 text-brand" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4 text-text">Sub-Second Price Discovery</h3>
              <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                We ingest Pyth Core on-chain price feeds directly to establish ground truth. No external APIs, no permissioned keys—just pure on-chain speed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="col-span-1 bg-surface border border-white/10 rounded-3xl p-10 hover:border-white/10 transition-all">
              <div className="w-14 h-14 bg-healthy/10 rounded-2xl flex items-center justify-center mb-8">
                <Shield className="w-7 h-7 text-healthy" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4 text-text">Drift Detection</h3>
              <p className="text-lg text-text-muted leading-relaxed">
                Continuous monitoring computes a weighted Peg Health Score, instantly flagging any divergence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="col-span-1 bg-surface border border-white/10 rounded-3xl p-10 hover:border-white/10 transition-all">
              <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center mb-8">
                <RefreshCw className="w-7 h-7 text-warning" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4 text-text">Autonomous Swaps</h3>
              <p className="text-lg text-text-muted leading-relaxed">
                When thresholds are breached, the Rello Agent executes corrective swaps via Meteora DLMM to restore the peg.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="col-span-1 md:col-span-2 bg-surface border border-white/10 rounded-3xl p-10 hover:border-white/10 transition-all">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8">
                <Layers className="w-7 h-7 text-text" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4 text-text">Pre-IPO Market Access</h3>
              <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                Integrated tightly with PreStocks and Tessera networks, allowing you to monitor and trade tokenized pre-IPO allocations before they hit Nasdaq.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="px-4 py-32 bg-background">
        <div className="w-full max-w-[1536px] mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-6 text-xs font-mono text-text-muted">
              <Code2 className="w-3.5 h-3.5" /> API First
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-6 text-text">Build with Rello.</h2>
            <p className="text-xl text-text-muted mb-8 leading-relaxed font-light">
              We expose all of our internal parity mechanics, drift data, and execution routing via a highly documented REST API. Build your own on-chain arbitrage bots in minutes.
            </p>
            <Link href="/developers" className="inline-flex items-center px-8 py-4 bg-white text-black hover:bg-brand transition-colors rounded-full font-bold tracking-wide">
              Explore API Documentation
            </Link>
          </div>
          <div className="flex-1 w-full bg-background rounded-3xl p-8 shadow-xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-critical" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-healthy" />
            </div>
            <pre className="text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <code>{`// Fetch Real-time Asset Drift
const res = await fetch("https://rello.app/api/assets/AAPL");
const { driftBps, status } = await res.json();

if (Math.abs(driftBps) > 50 && status === "healthy") {
  // Execute Arbitrage Correction
  await executeCorrection({
    symbol: "AAPL",
    amount: 100,
    slippage: 0.5
  });
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-32 bg-surface text-center">
        <div className="w-full max-w-[1536px] mx-auto perspective">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-text">Built for Solana.</h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 font-light">
            Experience the speed and integrity of automated on-chain parity.
          </p>
          <Link href="/dashboard" className="inline-flex items-center px-12 py-5 bg-brand text-black hover:bg-white transition-colors rounded-full font-bold tracking-wide text-xl">
            Enter the Platform
          </Link>
        </div>
      </section>
    </div>
  );
}
