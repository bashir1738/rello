import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local"
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

export interface AssetSnapshot {
  id: number;
  symbol: string;
  reference_price: number;
  wrapped_price: number;
  drift_pct: number;
  health_score: number;
  status: string;
  pool_depth: number | null;
  timestamp: string;
}

export interface AgentEvent {
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

export async function insertSnapshot(snapshot: Omit<AssetSnapshot, "id">) {
  const client = getSupabase();
  const { data, error } = await client
    .from("asset_snapshots")
    .insert(snapshot)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSnapshots(symbol: string, limit = 100) {
  const client = getSupabase();
  const { data, error } = await client
    .from("asset_snapshots")
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AssetSnapshot[];
}

export async function getLatestSnapshot(symbol: string) {
  const client = getSupabase();
  const { data, error } = await client
    .from("asset_snapshots")
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as AssetSnapshot;
}

export async function insertAgentEvent(event: Omit<AgentEvent, "id">) {
  const client = getSupabase();
  const { data, error } = await client
    .from("agent_events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAgentEvents(symbol?: string, limit = 50) {
  const client = getSupabase();
  let query = client
    .from("agent_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (symbol) {
    query = query.eq("asset", symbol);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AgentEvent[];
}
