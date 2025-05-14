import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function AddRedirectDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddRedirect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        (import.meta.env.DEV ? "http://localhost:3000" : undefined);
      const res = await fetch(`${apiBaseUrl}/api/configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add redirect");
        setLoading(false);
        return;
      }
      setSource("");
      setTarget("");
      setOpen(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new redirect</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddRedirect}>
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-2"
            style={{ gridTemplateColumns: "max-content 1fr" }}
          >
            <Label htmlFor="source">Source hostname</Label>
            <Input
              id="source"
              placeholder="monkeytype.com"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
            <Label htmlFor="target">Target URL</Label>
            <Input
              id="target"
              placeholder="https://monkeytype.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
