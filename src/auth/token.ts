import { createHmac, timingSafeEqual } from "node:crypto";

export type Session = { uid: number; role: "admin" | "member" };

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

export function signSession(session: Session, secret: string, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ ...session, exp: now + MAX_AGE_MS })).toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSession(token: string | undefined, secret: string | undefined, now = Date.now()): Session | null {
  if (!token || !secret) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  let data: { uid?: unknown; role?: unknown; exp?: unknown };
  try {
    data = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid?: unknown; role?: unknown; exp?: unknown };
  } catch {
    return null;
  }
  if (typeof data.exp !== "number" || data.exp < now) return null;
  if (typeof data.uid !== "number" || (data.role !== "admin" && data.role !== "member")) return null;
  return { uid: data.uid, role: data.role };
}
