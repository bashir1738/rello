"use client";

import { useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

interface HistoryPoint {
  timestamp: string;
  referencePrice: number;
  wrappedPrice: number;
  driftPct: number;
  healthScore: number;
  status: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-white/10 rounded-lg px-4 py-3 shadow-xl" style={{ transform: "perspective(600px) rotateY(-2deg)", transformOrigin: "right center" }}>
      <p className="text-xs text-text-muted font-mono mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-text-muted">{p.name}:</span>
          <span className="font-mono font-medium">${Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-2 text-xs text-text-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function PriceChart({ data }: { data: HistoryPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "perspective(800px) rotateX(4deg) translateY(16px)";
    const timer = setTimeout(() => {
      el.style.transition = "transform 0.8s cubic-bezier(0.23,1,0.32,1), opacity 0.8s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "perspective(800px) rotateX(0) translateY(0)";
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div ref={ref} className="w-full h-[420px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C5DFF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6C5DFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradWrap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5C7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00E5C7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            stroke="#8B93A7"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          />
          <YAxis
            stroke="#8B93A7"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)" />
          <Area
            type="monotone"
            dataKey="referencePrice"
            stroke="#6C5DFF"
            strokeWidth={2}
            fill="url(#gradRef)"
            dot={false}
            activeDot={{ r: 4, fill: "#6C5DFF", stroke: "#131826", strokeWidth: 2 }}
            name="Reference"
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="wrappedPrice"
            stroke="#00E5C7"
            strokeWidth={2}
            fill="url(#gradWrap)"
            dot={false}
            activeDot={{ r: 4, fill: "#00E5C7", stroke: "#131826", strokeWidth: 2 }}
            name="Wrapped"
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
