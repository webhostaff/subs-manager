"use client";
import { useEffect, useState } from "react";

type Customer = { id: string; fullName: string; email?: string | null; contactType: "WHATSAPP" | "FACEBOOK"; contactValue: string; createdAt: string };

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactType, setContactType] = useState<"WHATSAPP" | "FACEBOOK">("WHATSAPP");
  const [contactValue, setContactValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/customers");
    if (!res.ok) return;
    const data = await res.json();
    setCustomers(data.customers);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    setMsg(null);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName, email, contactType, contactValue }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error || "Failed");
      return;
    }
    setFullName(""); setEmail(""); setContactValue("");
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="h1">Customers</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add customer</h2>
        <div className="row">
          <input className="input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="input" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <select className="input" value={contactType} onChange={(e) => setContactType(e.target.value as any)}>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="FACEBOOK">Facebook</option>
          </select>
          <input className="input" placeholder="WhatsApp number or Facebook profile" value={contactValue} onChange={(e) => setContactValue(e.target.value)} />
        </div>
        <div className="actions" style={{ marginTop: 10 }}>
          <button className="btn" onClick={add}>Add</button>
          {msg && <span className="badge red">{msg}</span>}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>All customers</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Created</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                <td className="muted">{c.email || "—"}</td>
                <td>{c.contactType}: {c.contactValue}</td>
                <td className="muted">{c.createdAt.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
