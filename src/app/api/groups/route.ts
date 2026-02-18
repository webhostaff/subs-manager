import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const groups = await prisma.group.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const schema = z.object({
    name: z.string().min(1),
    planDays: z.number().int().min(1).max(365),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  const group = await prisma.group.create({ data: parsed.data });
  return NextResponse.json({ group });
}
