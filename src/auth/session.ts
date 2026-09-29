import { cookies } from "next/headers";
import { readSession, type Session } from "@/src/auth/token";

export const SESSION_COOKIE = "quini_session";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value, process.env.AUTH_SECRET);
}
