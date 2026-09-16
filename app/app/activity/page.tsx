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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Agent Activity Log</h1>
        <p className="text-text-muted text-sm mt-1">
          Autonomous correction attempts and recommended actions
        </p>
      </div>
      <ActivityLog events={events} />
    </div>
  );
}
