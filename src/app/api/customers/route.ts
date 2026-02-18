import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const auth = requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const schema = z.object({
    fullName: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")).transform(v => v || undefined),
    contactType: z.enum(["WHATSAPP","FACEBOOK"]),
    contactValue: z.string().min(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json({ customer });
}
