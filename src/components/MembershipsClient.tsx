"use client";
import { useEffect, useState } from "react";

type Group = { id: string; name: string; planDays: number };
type Customer = { id: string; fullName: string };
type Membership = any;

export default function MembershipsClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [groupId, setGroupId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [endDate, setEndDate] = useState<string>(() => new Date(Date.now() + 30*24*3600*1000).toISOString().slice(0,10));
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function loadAll() {
    const [g, c, m] = await Promise.all([
      fetch("/api/groups").then(r => r.json()),
      fetch("/api/customers").then(r => r.json()),
      fetch("/api/memberships").then(r => r.json()),
    ]);
    setGroups(g.groups);
    setCustomers(c.customers);
    setMemberships(m.memberships);
  }

  useEffect(() => { loadAll(); }, []);

  async function add() {
    setMsg(null);
    const res = await fetch("/api/memberships", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        groupId,
        customerId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        notes,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error || "Failed");
      return;
    }
    setNotes("");
    await loadAll();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="h1">Memberships</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add membership</h2>
        <div className="row">
          <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">Select group</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.planDays}d)</option>)}
          </select>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <input className="input" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="actions" style={{ marginTop: 10 }}>
          <button className="btn" onClick={add} disabled={!groupId || !customerId}>Add</button>
          {msg && <span className="badge red">{msg}</span>}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>All memberships</h2>
        <table className="table">
          <thead><tr><th>Group</th><th>Customer</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
          <tbody>
            {memberships.map((m: any) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.group.name}</td>
                <td>{m.customer.fullName}</td>
                <td className="muted">{m.startDate.slice(0,10)}</td>
                <td className="muted">{m.endDate.slice(0,10)}</td>
                <td>
                  <span className={`badge ${m.computed.status === "EXPIRED" ? "red" : m.computed.status === "EXPIRING_SOON" ? "yellow" : "green"}`}>
                    {m.computed.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
