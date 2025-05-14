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

export default function RedirectStats() {
  const [stats, setStats] = useState<RedirectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/ui-data")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center text-muted-foreground">Loading...</div>;
  return (
    <div className="">
      <div className="flex flex-col gap-6">
        {stats.map((item) => (
          <RedirectStatCard key={item.uuid} item={item} />
        ))}
      </div>
    </div>
  );
}
