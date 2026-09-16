"use client";

import { useState } from "react";
import Link from "next/link";

interface PoolConfig {
  baseMint: string;
  quoteMint: string;
  baseAmount: number;
  quoteAmount: number;
  curveType: "constant_product" | "stable" | "custom";
  feeBps: number;
  graduationThreshold: number;
  maxDriftBps: number;
}

const CURVE_PRESETS = {
  constant_product: {
    label: "Constant Product (x*y=k)",
    description: "Standard AMM curve. Good for volatile pairs.",
    suggestedFee: 30,
  },
  stable: {
    label: "Stable Curve",
    description: "Optimized for pegged assets. Lower slippage near peg.",
    suggestedFee: 10,
  },
  custom: {
    label: "Custom Equity-Tuned",
    description: "Asymmetric fees: lower when near peg, higher when drifted. Built for tokenized stocks.",
    suggestedFee: 20,
  },
};

export default function PoolsPage() {
  const [config, setConfig] = useState<PoolConfig>({
    baseMint: "",
    quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    baseAmount: 100,
    quoteAmount: 18984,
    curveType: "custom",
    feeBps: 20,
    graduationThreshold: 50000,
    maxDriftBps: 100,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const preset = CURVE_PRESETS[config.curveType];

  async function handleCreate() {
    setIsCreating(true);
    setResult(null);

    try {
      const res = await fetch("/api/pools/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (data.success) {
        setResult(`Pool created! Pool address: ${data.poolAddress}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch {
      setResult("Failed to create pool. Is the agent running?");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 perspective">
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
        <h1 className="text-3xl font-bold">Meteora DLMM Pool Config</h1>
        <p className="text-text-muted text-sm mt-1">
          Configure Meteora DLMM pools for tokenized equity trading pairs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Curve type */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-1">
            <h2 className="text-lg font-bold mb-4">Curve Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.entries(CURVE_PRESETS) as [string, typeof preset][]).map(
                ([key, p]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setConfig({
                        ...config,
                        curveType: key as PoolConfig["curveType"],
                        feeBps: p.suggestedFee,
                      })
                    }
                    className={`p-4 rounded-lg border text-left transition-all ${
                      config.curveType === key
                        ? "border-brand bg-brand/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm font-bold mb-1">{p.label}</div>
                    <div className="text-xs text-text-muted">
                      {p.description}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Token config */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-2">
            <h2 className="text-lg font-bold mb-4">Token Pair</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Base Token (Stock)
                </label>
                <input
                  type="text"
                  value={config.baseMint}
                  onChange={(e) =>
                    setConfig({ ...config, baseMint: e.target.value })
                  }
                  placeholder="Token mint address"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Quote Token (USDC)
                </label>
                <input
                  type="text"
                  value={config.quoteMint}
                  onChange={(e) =>
                    setConfig({ ...config, quoteMint: e.target.value })
                  }
                  placeholder="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Base Amount
                </label>
                <input
                  type="number"
                  value={config.baseAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      baseAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Quote Amount (USDC)
                </label>
                <input
                  type="number"
                  value={config.quoteAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      quoteAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Fee & graduation */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-3">
            <h2 className="text-lg font-bold mb-4">Fee & Graduation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Fee (bps)
                </label>
                <input
                  type="number"
                  value={config.feeBps}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      feeBps: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
                <div className="text-xs text-text-muted mt-1">
                  {(config.feeBps / 100).toFixed(2)}%
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Graduation Threshold (USD)
                </label>
                <input
                  type="number"
                  value={config.graduationThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      graduationThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
                <div className="text-xs text-text-muted mt-1">
                  Pool graduates to DAMM v2 at this liquidity
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
                  Max Drift (bps)
                </label>
                <input
                  type="number"
                  value={config.maxDriftBps}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxDriftBps: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                />
                <div className="text-xs text-text-muted mt-1">
                  Agent triggers correction above this drift
                </div>
              </div>
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || !config.baseMint}
            className="w-full btn-3d bg-brand text-white rounded-xl py-3.5 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating Pool..." : "Launch DLMM Pool"}
          </button>

          {result && (
            <div className={`p-4 rounded-xl text-sm font-mono ${result.startsWith("Error") || result.startsWith("Failed") ? "bg-critical/10 text-critical border border-critical/20" : "bg-healthy/10 text-healthy border border-healthy/20"}`}>
              {result}
            </div>
          )}
        </div>

        {/* Preview sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-white/10 rounded-xl p-6 sticky top-20 animate-fade-in-up delay-2">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-brand">
                <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z" />
                <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
              </svg>
              Pool Preview
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Curve</span>
                <span className="font-mono">{preset.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Fee</span>
                <span className="font-mono">{(config.feeBps / 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Initial Price</span>
                <span className="font-mono">
                  {config.baseAmount > 0
                    ? `$${(config.quoteAmount / config.baseAmount).toFixed(2)}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Max Drift</span>
                <span className="font-mono">{config.maxDriftBps} bps</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-text-muted font-mono mb-2">
                DLMM Configuration
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Meteora DLMM uses discrete price bins for concentrated liquidity.
                Equity-tuned pools set tighter bins near peg and wider bins
                away from it, optimizing capital efficiency for stock-like assets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
