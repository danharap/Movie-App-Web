"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DayPoint = { date: string; count: number };
type EventPoint = { event: string; count: number };

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#e4e4e7",
  fontSize: 12,
};

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export function UserGrowthChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">User Growth</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(l) => `Date: ${l}`}
            formatter={(v) => [v, "New users"]}
          />
          <Bar dataKey="count" fill="#fde68a" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyEventsChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Daily Events</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(l) => `Date: ${l}`}
            formatter={(v) => [v, "Events"]}
          />
          <Bar dataKey="count" fill="#a78bfa" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopEventsChart({ data }: { data: EventPoint[] }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Top Events</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="event"
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [v, "Count"]}
          />
          <Bar dataKey="count" fill="#34d399" radius={[0, 3, 3, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
