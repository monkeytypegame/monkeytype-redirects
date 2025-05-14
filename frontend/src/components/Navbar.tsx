import { Button } from "@/components/ui/button";

interface NavbarProps {
  range: number | null;
  setRange: (r: number | null) => void;
  ranges: { label: string; value: number | null }[];
}

export default function Navbar({ range, setRange, ranges }: NavbarProps) {
  return (
    <div className="py-8 flex justify-between align-center">
      <h1
        className="text-3xl font-bold"
        style={{
          //@ts-ignore it exists
          "text-box-edge": "ex alphabetic",
          "text-box-trim": "trim-both",
          "align-self": "center",
        }}
      >
        monkeytype-redirects
      </h1>
      <div className="flex gap-2 align-center rounded-md ring-ring/50 ring-1 p-2">
        {ranges.map((r) => (
          <Button
            key={r.label}
            variant={range === r.value ? undefined : "outline"}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
