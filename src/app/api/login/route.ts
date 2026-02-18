import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  const ok = await checkPassword(parsed.data.email, parsed.data.password);
  if (!ok) return NextResponse.json({ error: "BAD_CREDENTIALS" }, { status: 401 });

  setAdminCookie(parsed.data.email);
  return NextResponse.json({ ok: true });
}
