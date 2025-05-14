import { useState, useEffect } from "react";
import RedirectStats from "./components/RedirectStats";
import Navbar from "./components/Navbar";

const RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 365 days", value: 365 },
  { label: "All time", value: null },
];

function App() {
  const [range, setRange] = useState<number | null>(7);
  // Debug: show current Tailwind breakpoint
  const [breakpoint, setBreakpoint] = useState<string>("");
  useEffect(() => {
    const getBreakpoint = () => {
      if (window.matchMedia("(min-width: 1536px)").matches) return "2xl";
      if (window.matchMedia("(min-width: 1280px)").matches) return "xl";
      if (window.matchMedia("(min-width: 1024px)").matches) return "lg";
      if (window.matchMedia("(min-width: 768px)").matches) return "md";
      if (window.matchMedia("(min-width: 640px)").matches) return "sm";
      return "xs";
    };
    const update = () => setBreakpoint(getBreakpoint());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="container mx-auto min-h-screen px-8">
      <Navbar range={range} setRange={setRange} ranges={RANGES} />
      <div
        className="text-xs text-muted-foreground mb-2"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        Breakpoint: {breakpoint}
      </div>
      <RedirectStats range={range} />
    </div>
  );
}

export default App;
