"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

interface Asset {
  symbol: string;
  name: string;
  referencePrice: number;
  wrappedPrice: number;
  driftPct: number;
  driftBps: number;
  healthScore: number;
  status: string;
  poolDepth: number | null;
}

function HealthBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-healthy/15 text-healthy",
    warning: "bg-warning/15 text-warning",
    critical: "bg-critical/15 text-critical",
    reference_stale: "bg-warning/15 text-warning",
    no_data: "bg-white/10 text-text-muted",
    error: "bg-critical/15 text-critical",
  };

  const labels: Record<string, string> = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    reference_stale: "Stale",
    no_data: "No Data",
    error: "Error",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? styles.error}`}>
      {status === "reference_stale" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
      )}
      {labels[status] ?? status}
    </span>
  );
}

function TableRow({ asset, index }: { asset: Asset; index: number }) {
  const ref = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px) rotateX(2deg)";
    const timer = setTimeout(() => {
      el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0) rotateX(0)";
    }, 80 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <tr
      ref={ref}
      className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 group"
    >
      <td className="px-6 py-4">
        <Link href={`/asset/${asset.symbol}`} className="flex items-center gap-3 group/link">
          <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold transition-transform duration-300 group-hover/link:scale-110 group-hover/link:rotate-6">
            {asset.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-medium transition-colors group-hover/link:text-brand">{asset.symbol}</div>
            <div className="text-xs text-text-muted">{asset.name}</div>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        {asset.referencePrice > 0 ? `$${asset.referencePrice.toFixed(2)}` : "\u2014"}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        {asset.wrappedPrice > 0 ? `$${asset.wrappedPrice.toFixed(2)}` : "\u2014"}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        <span className={
          asset.status === "reference_stale" ? "text-warning" :
          Math.abs(asset.driftPct) < 0.5 ? "text-healthy" :
          Math.abs(asset.driftPct) < 1.5 ? "text-warning" : "text-critical"
        }>
          {asset.status === "reference_stale" ? "\u2014" : `${asset.driftPct >= 0 ? "+" : ""}${asset.driftPct.toFixed(2)}%`}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                asset.healthScore >= 60 ? "bg-healthy" :
                asset.healthScore >= 30 ? "bg-warning" : "bg-critical"
              }`}
              style={{ width: `${asset.healthScore}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-muted w-8 text-right">{asset.healthScore}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <HealthBadge status={asset.status} />
      </td>
    </tr>
  );
}

export default function AssetTable({ assets }: { assets: Asset[] }) {
  return (
    <div className="bg-surface border border-white/10 rounded-xl overflow-hidden animate-fade-in-up">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-text-muted uppercase tracking-wider">
            <th className="px-6 py-3">Asset</th>
            <th className="px-6 py-3 text-right">Reference</th>
            <th className="px-6 py-3 text-right">Wrapped</th>
            <th className="px-6 py-3 text-right">Drift</th>
            <th className="px-6 py-3 text-center">Health</th>
            <th className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, i) => (
            <TableRow key={asset.symbol} asset={asset} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
