import { config } from "./config";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "action";
  message: string;
  data?: Record<string, unknown>;
}

export function log(
  level: LogEntry["level"],
  message: string,
  data?: Record<string, unknown>
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  console.log(JSON.stringify(entry));
}

export async function insertAgentEvent(event: {
  asset: string;
  reference_price: number;
  market_price: number;
  deviation_bps: number;
  trade_amount: number | null;
  tx_signature: string | null;
  action_type: string;
}) {
  try {
    const res = await fetch(`${config.engineBaseUrl}/api/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: event.asset,
        action: `agent_${event.action_type}`,
        driftPct: event.deviation_bps / 100,
        referencePrice: event.reference_price,
        wrappedPrice: event.market_price,
      }),
    });
    log("info", "Webhook sent", { status: res.status });
  } catch (err) {
    log("error", "Failed to send webhook", {
      error: err instanceof Error ? err.message : "Unknown",
    });
  }
}

export async function logAgentEvent(event: {
  asset: string;
  reference_price: number;
  market_price: number;
  deviation_bps: number;
  trade_amount: number | null;
  tx_signature: string | null;
  action_type: string;
}) {
  log("action", `Agent action: ${event.action_type}`, {
    asset: event.asset,
    deviation_bps: event.deviation_bps,
    action_type: event.action_type,
    tx_signature: event.tx_signature,
  });

  await insertAgentEvent(event);
}
