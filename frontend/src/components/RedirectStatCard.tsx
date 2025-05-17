import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Badge } from "./ui/badge";
import { Check, X, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import clsx from "clsx";

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
  testResultCache: Record<string, any>;
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

export function RedirectStatCard({ item, range, yMax, testResultCache }: RedirectStatCardProps) {
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
          <TestResultBadges uuid={item.uuid} testResultCache={testResultCache} />
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

function TestResultBadges({ uuid, testResultCache }: { uuid: string; testResultCache: Record<string, any> }) {
  // State for HTTP/HTTPS test results
  const [httpStatus, setHttpStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [httpsStatus, setHttpsStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [httpError, setHttpError] = useState<string | undefined>();
  const [httpsError, setHttpsError] = useState<string | undefined>();

  useEffect(() => {
    if (testResultCache[uuid]) {
      const data = testResultCache[uuid];
      setHttpStatus(data.httpStatus);
      setHttpsStatus(data.httpsStatus);
      setHttpError(data.httpError);
      setHttpsError(data.httpsError);
      return;
    }
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    let isMounted = true;
    setHttpStatus("loading");
    setHttpsStatus("loading");
    setHttpError(undefined);
    setHttpsError(undefined);
    fetch(`${apiBaseUrl}/api/test-redirect/${uuid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to test redirect");
        const data = await res.json();
        if (!isMounted) return;
        const httpStatusVal = data.data.http.result ? "success" : "error";
        const httpsStatusVal = data.data.https.result ? "success" : "error";
        setHttpStatus(httpStatusVal);
        setHttpsStatus(httpsStatusVal);
        setHttpError(data.data.http.error);
        setHttpsError(data.data.https.error);
        testResultCache[uuid] = {
          httpStatus: httpStatusVal,
          httpsStatus: httpsStatusVal,
          httpError: data.data.http.error,
          httpsError: data.data.https.error,
        };
      })
      .catch(() => {
        if (!isMounted) return;
        setHttpStatus("error");
        setHttpsStatus("error");
        testResultCache[uuid] = {
          httpStatus: "error",
          httpsStatus: "error",
          httpError: undefined,
          httpsError: undefined,
        };
      });
    return () => {
      isMounted = false;
    };
  }, [uuid, testResultCache]);

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={clsx(
                httpStatus === "loading" && "bg-gray-400",
                httpStatus === "success" && "bg-green-400",
                httpStatus === "error" && "bg-red-400"
              )}
            >
              {httpStatus === "loading" ? (
                <LoaderCircle className="animate-spin" strokeWidth={5} />
              ) : httpStatus === "success" ? (
                <Check strokeWidth={5} />
              ) : (
                <X strokeWidth={5} />
              )}
              HTTP
            </Badge>
          </TooltipTrigger>
          {httpStatus === "error" && httpError && (
            <TooltipContent>
              <p>{httpError}</p>
            </TooltipContent>
          )}
          {httpStatus === "success" && (
            <TooltipContent>
              <p>All good!</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={clsx(
                httpsStatus === "loading" && "bg-gray-400",
                httpsStatus === "success" && "bg-green-400",
                httpsStatus === "error" && "bg-red-400"
              )}
            >
              {httpsStatus === "loading" ? (
                <LoaderCircle className="animate-spin" strokeWidth={5} />
              ) : httpsStatus === "success" ? (
                <Check strokeWidth={5} />
              ) : (
                <X strokeWidth={5} />
              )}
              HTTPS
            </Badge>
          </TooltipTrigger>
          {httpsStatus === "error" && httpsError && (
            <TooltipContent>
              <p>{httpsError}</p>
            </TooltipContent>
          )}
          {httpsStatus === "success" && (
            <TooltipContent>
              <p>All good!</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
