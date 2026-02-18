import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays, startOfDay } from "date-fns";
import { computeStatus } from "@/lib/status";

function requireCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev convenience
  const hdr = req.headers.get("x-cron-secret");
  return hdr === secret;
}

async function ensureReminder(membershipId: string, type: "D1" | "D2", remindAt: Date) {
  const existing = await prisma.reminder.findFirst({ where: { membershipId, type, remindAt } });
  if (existing) return false;
  await prisma.reminder.create({ data: { membershipId, type, remindAt } });
  return true;
}

export async function GET(req: Request) {
  if (!requireCronAuth(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const now = new Date();
  const d0 = startOfDay(now);
  const d1 = startOfDay(addDays(now, 1));
  const d2 = startOfDay(addDays(now, 2));

  const memberships = await prisma.membership.findMany({
    where: { endDate: { gte: d0, lt: addDays(d2, 1) } },
  });

  let created = 0;
  let updated = 0;

  for (const m of memberships) {
    const { status } = computeStatus(m.endDate, now);
    if (m.status !== status) {
      await prisma.membership.update({ where: { id: m.id }, data: { status } });
      updated++;
    }

    const endDay = startOfDay(m.endDate);

    if (endDay.getTime() === d2.getTime()) {
      if (await ensureReminder(m.id, "D2", d2)) created++;
    }
    if (endDay.getTime() === d1.getTime()) {
      if (await ensureReminder(m.id, "D1", d1)) created++;
    }
  }

  return NextResponse.json({
    ok: true,
    membershipsChecked: memberships.length,
    remindersCreated: created,
    statusesUpdated: updated,
    now: now.toISOString(),
  });
}
