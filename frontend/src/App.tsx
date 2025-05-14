import { useState, useEffect } from "react";
import RedirectStats from "./components/RedirectStats";
import Navbar from "./components/Navbar";
import AddRedirectDialog from "./components/AddRedirectDialog";

const RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 365 days", value: 365 },
  { label: "All time", value: null },
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      localStorage.setItem("token", data.token);
      onLogin();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function App() {
  const [range, setRange] = useState<number | null>(7);
  const [breakpoint, setBreakpoint] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());

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

  // Attach JWT to all fetch requests
  useEffect(() => {
    const origFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      const token = localStorage.getItem("token");
      if (token && typeof input === "string" && input.startsWith("/api")) {
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return origFetch(input, init);
    };
    return () => {
      window.fetch = origFetch;
    };
  }, []);

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="container mx-auto min-h-screen p-8">
      <Navbar
        range={range}
        setRange={setRange}
        ranges={RANGES}
        onAddRedirect={() => setDialogOpen(true)}
      />
      <AddRedirectDialog open={dialogOpen} setOpen={setDialogOpen} />
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
