import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "./ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

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
  range: number | null;
}

function getFilledChartData(
  redirectCounts: Record<string, number>,
  range: number | null
) {
  // Dates in redirectCounts are assumed to be YYYY-MM-DD
  const today = new Date();
  let days: string[] = [];
  if (range) {
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
  } else {
    // All time: use all keys, sorted
    days = Object.keys(redirectCounts).sort();
  }
  return days.map((date) => ({
    date,
    count: redirectCounts[date] || 0,
  }));
}

export function RedirectStatCard({ item, range }: RedirectStatCardProps) {
  const chartData = getFilledChartData(item.stats?.redirectCounts || {}, range);

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
        {/* <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fill: "currentColor" }}
              minTickGap={100}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "none",
                color: "#fff",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer> */}
        <ChartContainer
          className="h-full w-full"
          config={{
            stuff: {
              label: "yay",
            },
            count: {
              label: "Redirects",
              color: "#e2b714",
            },
          }}
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            ></XAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
            <Bar dataKey="count" fill="var(--color-count)" radius={4}></Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
