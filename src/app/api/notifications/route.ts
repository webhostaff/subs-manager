import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addDays, startOfDay } from "date-fns";

export async function GET() {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const now = new Date();
  const from = startOfDay(now);
  const to = addDays(from, 3);

  const reminders = await prisma.reminder.findMany({
    where: { remindAt: { gte: from, lt: to } },
    include: { membership: { include: { group: true, customer: true } } },
    orderBy: { remindAt: "asc" },
  });

  return NextResponse.json({ reminders });
}
