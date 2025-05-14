import { useEffect, useState } from "react";
import { RedirectStatCard } from "./RedirectStatCard";

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

interface RedirectStatsProps {
  range: number | null;
}

export default function RedirectStats({ range }: RedirectStatsProps) {
  const [stats, setStats] = useState<RedirectStat[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/ui-data`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || []);
        setLoading(false);
      });
  }, []);

  // Calculate the global max redirect count for all charts
  const allCounts = stats.flatMap((stat) =>
    Object.values(stat.stats?.redirectCounts || {})
  );
  const globalMax = Math.max(1, ...allCounts); // fallback to 1 if empty

  if (loading)
    return <div className="text-center text-muted-foreground">Loading...</div>;
  return (
    <div className="">
      <div className="flex flex-col gap-8">
        {stats.map((item) => (
          <RedirectStatCard
            key={item.uuid}
            item={item}
            range={range}
            yMax={globalMax}
          />
        ))}
      </div>
    </div>
  );
}
