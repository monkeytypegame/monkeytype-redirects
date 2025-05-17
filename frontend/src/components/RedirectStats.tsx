import { RedirectStatCard } from "./RedirectStatCard";
import type { RedirectStat } from "@/App";
import { useRef } from "react";

interface RedirectStatsProps {
  data: RedirectStat[];
  range: number | null;
  search: string;
}

export default function RedirectStats({
  data,
  range,
  search,
}: RedirectStatsProps) {
  // Calculate the global max redirect count for all charts
  const allCounts = data.flatMap((stat) =>
    Object.values(stat.stats?.redirectCounts || {})
  );
  const globalMax = Math.max(1, ...allCounts); // fallback to 1 if empty

  // Cache for test results by uuid
  const testResultCache = useRef<Record<string, any>>({});

  const filteredStats = data.filter((item) => {
    const sourceMatch = item.source
      .toLowerCase()
      .includes(search.toLowerCase());
    const targetMatch = item.target
      .toLowerCase()
      .includes(search.toLowerCase());
    return sourceMatch || targetMatch;
  });

  return (
    <div className="">
      <div className="flex flex-col gap-8">
        {filteredStats.map((item) => (
          <RedirectStatCard
            key={item.uuid}
            item={item}
            range={range}
            yMax={globalMax}
            testResultCache={testResultCache.current}
          />
        ))}
      </div>
    </div>
  );
}
