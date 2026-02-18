import { prisma } from "@/lib/db";
import { computeStatus, progressPercent, progressColor } from "@/lib/status";
import { differenceInCalendarDays } from "date-fns";

export default async function Dashboard() {
  const now = new Date();

  const memberships = await prisma.membership.findMany({
    include: { group: true, customer: true },
    orderBy: { endDate: "asc" },
    take: 20,
  });

  const enriched = memberships.map((m) => {
    const s = computeStatus(m.endDate, now);
    const pct = progressPercent(m.startDate, m.endDate, now);
    return { m, s, pct, color: progressColor(pct) };
  });

  const expiring48 = enriched.filter(x => x.s.daysLeft === 2).length;
  const expiring24 = enriched.filter(x => x.s.daysLeft === 1).length;
  const expired = enriched.filter(x => x.s.daysLeft < 0).length;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="h1">Dashboard</h1>

      <div className="grid">
        <div className="card">
          <div className="muted">Expiring in 48h</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{expiring48}</div>
        </div>
        <div className="card">
          <div className="muted">Expiring in 24h</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{expiring24}</div>
        </div>
        <div className="card">
          <div className="muted">Expired</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{expired}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0 }}>Upcoming expirations</h2>
          <span className="muted">Top 20</span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Customer</th>
              <th>Ends</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(({ m, s, pct, color }) => (
              <tr key={m.id}>
                <td>{m.group.name}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.customer.fullName}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{m.customer.email || "—"}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.endDate.toISOString().slice(0,10)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{s.daysLeft} day(s) left</div>
                </td>
                <td>
                  <span className={`badge ${s.status === "EXPIRED" ? "red" : s.status === "EXPIRING_SOON" ? "yellow" : "green"}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div className="progressWrap">
                    <div className="progressBar" aria-label="progress">
                      <div className="progressFill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="muted">{pct}%</span>
                  </div>
                </td>
                <td>
                  {m.customer.contactType === "WHATSAPP" ? (
                    <a href={`https://wa.me/${m.customer.contactValue.replace(/\D/g, "")}`} target="_blank">
                      WhatsApp
                    </a>
                  ) : (
                    <span>{m.customer.contactValue}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          Tip: call <code>/api/cron/reminders</code> daily to generate reminders.
        </div>
      </div>
    </div>
  );
}
