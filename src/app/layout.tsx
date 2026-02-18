import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subs Manager",
  description: "Manage groups and subscription reminders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>
        <div className="container">
          <header className="header">
            <div className="brand">Subs Manager</div>
            <nav className="nav">
              <a href="/">Dashboard</a>
              <a href="/groups">Groups</a>
              <a href="/customers">Customers</a>
              <a href="/memberships">Memberships</a>
              <form action="/api/logout" method="post">
                <button className="linkBtn" type="submit">Logout</button>
              </form>
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">© {new Date().getFullYear()} Subs Manager</footer>
        </div>
      </body>
    </html>
  );
}
