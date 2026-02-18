# Subs Manager (Groups + Subscriptions + Reminders)

A small Next.js app to manage:
- Groups (each group can be monthly = 30 days or 3 months = 90 days)
- Customers (email + WhatsApp/Facebook contact)
- Memberships (start/end dates)
- Alerts for memberships expiring in 48h / 24h (in-app; cron endpoint creates Reminder records)

## 1) Run locally

1. Install Node 18+
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Install deps:
   ```bash
   npm install
   ```
4. Setup DB + seed:
   ```bash
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```
5. Start:
   ```bash
   npm run dev
   ```
Open http://localhost:3000

Login at /login with ADMIN_EMAIL / ADMIN_PASSWORD from `.env`.

## 2) Deploy online (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel:
   - DATABASE_URL (use a hosted SQLite is not supported; prefer Postgres in production)
   - ADMIN_EMAIL / ADMIN_PASSWORD
   - (optional) CRON_SECRET

### Recommended: Postgres + Prisma
For online deploy, switch `prisma/schema.prisma` datasource to `provider = "postgresql"` and set `DATABASE_URL` accordingly.

## 3) Reminders (daily)
Call:
- `GET /api/cron/reminders`

If you set `CRON_SECRET`, send header:
- `x-cron-secret: <your secret>`

On Vercel you can configure Cron Jobs to hit that endpoint daily.

## Notes
This is a starter. Next improvements:
- Real auth (NextAuth)
- Email notifications (Resend/SendGrid)
- Group detail page with exactly 7 seats
- Renew button (clone membership with new dates)
