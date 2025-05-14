import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Plus } from "lucide-react";

interface NavbarProps {
  range: number | null;
  setRange: (r: number | null) => void;
  ranges: { label: string; value: number | null }[];
  onAddRedirect: () => void;
}

export default function Navbar({
  range,
  setRange,
  ranges,
  onAddRedirect,
}: NavbarProps) {
  return (
    <div className="pb-8 flex justify-between align-center">
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
      <div className="flex gap-2 rounded-md">
        {ranges.map((r) => (
          <Button
            key={r.label}
            variant={range === r.value ? undefined : "outline"}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-2" />
        <Button variant="outline" className="text-xs" onClick={onAddRedirect}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}
