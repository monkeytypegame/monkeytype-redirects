import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "./ui/card";

interface RedirectStat {
  _id: string;
  uuid: string;
  source: string;
  target: string;
  createdAt: string;
  stats: {
    _id: string;
    uuid: string;
    redirectCounts: Record<string, number>;
    totalRedirects: number;
    lastRedirected: string;
  };
}

interface RedirectStatCardProps {
  item: RedirectStat;
}

export function RedirectStatCard({ item }: RedirectStatCardProps) {
  const chartData = Object.entries(item.stats?.redirectCounts || {}).map(
    ([date, count]) => ({ date, count })
  );
  return (
    <Card className="flex flex-row items-center bg-card text-card-foreground p-8">
      <div className="w-1/4 flex flex-col gap-2">
        <div className="mb-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Source
          </div>
          <div className="text-4xl font-extrabold text-card-foreground">
            {item.source}
          </div>
        </div>
        <div className="mb-2">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Total Redirects
          </div>
          <div className="text-4xl font-bold text-card-foreground">
            {item.stats?.totalRedirects ?? 0}
          </div>
        </div>
        <div className="mb-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Target
          </div>
          <div className="font-extrabold text-card-foreground">
            {item.target}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Last Redirected
          </div>
          <div className="text-xs font-bold text-card-foreground">
            {item.stats?.lastRedirected
              ? new Date(item.stats.lastRedirected).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>
      <div className="w-3/4 h-50">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              stroke="#8884d8"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              stroke="#8884d8"
              tick={{ fill: "currentColor" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "none",
                color: "#fff",
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
