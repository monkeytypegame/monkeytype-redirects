import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface LoginFormProps {
  onLogin: () => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
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
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <Button type="submit" className="justify-self-end">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
