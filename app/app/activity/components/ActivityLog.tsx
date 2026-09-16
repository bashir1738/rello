"use client";

import { useRef, useEffect } from "react";

interface AgentEvent {
  id: number;
  asset: string;
  reference_price: number;
  market_price: number;
  deviation_bps: number;
  trade_amount: number | null;
  tx_signature: string | null;
  action_type: string;
  timestamp: string;
}

function EventRow({ event, index }: { event: AgentEvent; index: number }) {
  const ref = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateX(-16px) rotateY(3deg)";
    const timer = setTimeout(() => {
      el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "translateX(0) rotateY(0)";
    }, 60 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <tr
      ref={ref}
      className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 group"
    >
      <td className="px-6 py-4 text-sm font-mono text-text-muted">
        {new Date(event.timestamp).toLocaleTimeString()}
      </td>
      <td className="px-6 py-4 font-medium">{event.asset}</td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        ${event.reference_price.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        ${event.market_price.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm">
        <span className={
          Math.abs(event.deviation_bps) > 150 ? "text-critical" :
          Math.abs(event.deviation_bps) > 50 ? "text-warning" : "text-healthy"
        }>
          {event.deviation_bps > 0 ? "+" : ""}{event.deviation_bps} bps
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          event.action_type === "executed" ? "bg-healthy/15 text-healthy" :
          event.action_type === "recommended" ? "bg-warning/15 text-warning" :
          "bg-white/10 text-text-muted"
        }`}>
          {event.action_type}
        </span>
      </td>
      <td className="px-6 py-4">
        {event.tx_signature ? (
          <a
            href={`https://solscan.io/tx/${event.tx_signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-brand hover:underline transition-colors group-hover:text-brand"
          >
            {event.tx_signature.slice(0, 8)}...
          </a>
        ) : (
          <span className="text-xs text-text-muted">\u2014</span>
        )}
      </td>
    </tr>
  );
}

export default function ActivityLog({ events }: { events: AgentEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl p-12 text-center animate-fade-in-up">
        <div className="text-text-muted text-sm">
          No agent activity yet. The agent will log actions here when it detects
          drift conditions.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/10 rounded-xl overflow-hidden animate-fade-in-up">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-text-muted uppercase tracking-wider">
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">Asset</th>
            <th className="px-6 py-3 text-right">Reference</th>
            <th className="px-6 py-3 text-right">Market</th>
            <th className="px-6 py-3 text-right">Deviation</th>
            <th className="px-6 py-3 text-center">Action</th>
            <th className="px-6 py-3">Tx</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, i) => (
            <EventRow key={event.id} event={event} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
