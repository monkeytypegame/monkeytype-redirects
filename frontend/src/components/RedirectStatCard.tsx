import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

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
  yMax: number;
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

export function RedirectStatCard({ item, range, yMax }: RedirectStatCardProps) {
  const chartData = getFilledChartData(item.stats?.redirectCounts || {}, range);

  return (
    <Card className="relative xl:h-80 h-110 flex flex-col xl:flex-row items-center bg-card text-card-foreground p-8">
      <div className="w-full xl:w-1/4 flex flex-col gap-2 mb-6 xl:mb-0">
        <div className="flex flex-row xl:flex-col gap-4 mb-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Source
            </div>
            <div className="text-3xl font-extrabold text-card-foreground">
              {item.source}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Total Redirects
            </div>
            <div className="text-3xl font-bold text-card-foreground">
              {item.stats?.totalRedirects ?? 0}
            </div>
          </div>
        </div>
        <div className="flex flex-row xl:flex-col gap-4 mb-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Target
            </div>
            <div className="font-extrabold text-card-foreground">
              {item.target}
            </div>
          </div>
          <div className="flex-1">
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
      </div>
      <div className="w-full xl:w-3/4 h-50">
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
            <YAxis
              domain={[0, yMax]}
              axisLine={false}
              tickLine={false}
              tickFormatter={() => ""}
              tickCount={Math.floor(yMax / 10) + 1}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
            <Bar dataKey="count" fill="var(--color-count)" radius={4}></Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div className="opacity-10 text-[0.1em] absolute bottom-0 right-0 p-4">
        {item.uuid}
      </div>
    </Card>
  );
}
