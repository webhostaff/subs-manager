"use client";
import { useEffect, useState } from "react";

type Group = { id: string; name: string; planDays: number; createdAt: string };

export default function GroupsClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [planDays, setPlanDays] = useState(30);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/groups");
    if (!res.ok) return;
    const data = await res.json();
    setGroups(data.groups);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    setMsg(null);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, planDays }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error || "Failed");
      return;
    }
    setName("");
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="h1">Groups</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add group</h2>
        <div className="row">
          <input className="input" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="number" min={1} max={365} value={planDays} onChange={(e) => setPlanDays(parseInt(e.target.value || "30"))} />
        </div>
        <div className="actions" style={{ marginTop: 10 }}>
          <button className="btn" onClick={add}>Add</button>
          {msg && <span className="badge red">{msg}</span>}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>All groups</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Plan days</th><th>Created</th></tr></thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id}>
                <td style={{ fontWeight: 600 }}>{g.name}</td>
                <td>{g.planDays}</td>
                <td className="muted">{g.createdAt.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
