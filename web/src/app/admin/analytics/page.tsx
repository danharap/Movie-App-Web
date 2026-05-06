import { getEventChart, getUserGrowthChart } from "@/app/actions/admin";
import { DailyEventsChart, TopEventsChart, UserGrowthChart } from "./AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [growth, events] = await Promise.all([
    getUserGrowthChart(30),
    getEventChart(14),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          User growth and app activity for the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UserGrowthChart data={growth} />
        <DailyEventsChart data={events.daily} />
      </div>

      <TopEventsChart data={events.topEvents} />

      {events.topEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center">
          <p className="text-sm text-zinc-500">
            No analytics events tracked yet. Events are recorded automatically as users interact
            with the app.
          </p>
        </div>
      )}
    </div>
  );
}
