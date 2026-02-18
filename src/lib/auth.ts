import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE = "subs_admin";

export function getAdminIdentity() {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  // very simple: store admin email; in production use proper session/jwt
  return c;
}

export function requireAdmin() {
  const admin = getAdminIdentity();
  if (!admin) {
    return { ok: false as const, error: "UNAUTHORIZED" };
  }
  return { ok: true as const, admin };
}

export async function checkPassword(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedEmail || !expectedPassword) return false;
  if (email !== expectedEmail) return false;

  // Allow plain compare, but also accept bcrypt hash if user stores it
  const looksHashed = expectedPassword.startsWith("$2a$") || expectedPassword.startsWith("$2b$");
  if (looksHashed) return await bcrypt.compare(password, expectedPassword);
  return password === expectedPassword;
}

export function setAdminCookie(email: string) {
  cookies().set(COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}
