"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMsg(data?.error || "Login failed");
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1 className="h1">Login</h1>
      <p className="muted">Admin login (set ADMIN_EMAIL / ADMIN_PASSWORD in .env)</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" type="submit">Sign in</button>
        {msg && <div className="badge red">{msg}</div>}
      </form>
    </div>
  );
}
