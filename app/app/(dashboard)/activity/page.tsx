import { getAgentEvents } from "@/lib/supabase";
import ActivityLog from "./components/ActivityLog";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  let events: Awaited<ReturnType<typeof getAgentEvents>> = [];
  try {
    events = await getAgentEvents(undefined, 50);
  } catch {
    events = [];
  }

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 md:px-8 py-8 perspective">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold">Agent Activity Log</h1>
          <p className="text-text-muted text-sm mt-1">
            Autonomous correction attempts and recommended actions
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-healthy animate-pulse" />
          {events.length} events
        </div>
      </div>
      <ActivityLog events={events} />
    </div>
  );
}
