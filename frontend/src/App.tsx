import { useState } from "react";
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
  return (
    <div className="container mx-auto min-h-screen">
      <Navbar range={range} setRange={setRange} ranges={RANGES} />
      <RedirectStats range={range} />
    </div>
  );
}

export default App;
