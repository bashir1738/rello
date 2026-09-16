"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function PriceChart({ data }: { data: HistoryPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    ts: new Date(d.timestamp).getTime(),
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="time"
            stroke="#8B93A7"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#8B93A7"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#131826",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#8B93A7" }}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          <Line
            type="monotone"
            dataKey="referencePrice"
            stroke="#6C5DFF"
            strokeWidth={2}
            dot={false}
            name="Reference"
          />
          <Line
            type="monotone"
            dataKey="wrappedPrice"
            stroke="#00E5C7"
            strokeWidth={2}
            dot={false}
            name="Wrapped"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
