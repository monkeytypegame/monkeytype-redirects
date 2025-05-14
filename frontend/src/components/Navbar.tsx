import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface NavbarProps {
  range: number | null;
  setRange: (r: number | null) => void;
  ranges: { label: string; value: number | null }[];
}

export default function Navbar({ range, setRange, ranges }: NavbarProps) {
  return (
    <div className="py-8 flex justify-between align-center h-25">
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
      <div className="flex gap-2 align-center rounded-md">
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
        <Dialog>
          <DialogTrigger>
            <Button variant="outline" className="text-xs">
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new redirect</DialogTitle>
              {/* <DialogDescription> */}
              {/* Add a new redirect to the database. */}
              {/* </DialogDescription> */}
            </DialogHeader>
            <div
              className="grid grid-cols-2 gap-x-4 gap-y-2"
              style={{
                gridTemplateColumns: "max-content 1fr",
              }}
            >
              <Label htmlFor="source">Source hostname</Label>
              <Input id="source" placeholder="monketype.com" />
              <Label htmlFor="target">Target URL</Label>
              <Input id="target" placeholder="https://monkeytype.com" />
            </div>
            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
