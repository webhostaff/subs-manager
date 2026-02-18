import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { computeStatus } from "@/lib/status";

export async function GET() {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const memberships = await prisma.membership.findMany({
    include: { group: true, customer: true },
    orderBy: { endDate: "asc" },
  });

  const now = new Date();
  const enriched = memberships.map(m => {
    const s = computeStatus(m.endDate, now);
    return { ...m, computed: s };
  });

  return NextResponse.json({ memberships: enriched });
}

export async function POST(req: Request) {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const schema = z.object({
    groupId: z.string().min(1),
    customerId: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  const membership = await prisma.membership.create({
    data: {
      groupId: parsed.data.groupId,
      customerId: parsed.data.customerId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      notes: parsed.data.notes || null,
    },
  });
  return NextResponse.json({ membership });
}
