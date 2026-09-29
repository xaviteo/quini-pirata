import { NextResponse } from "next/server";
import { signSession, type Session } from "@/src/auth/token";
import { SESSION_COOKIE } from "@/src/auth/session";

export function redirectTo(req: Request, pathname: string, params?: Record<string, string>): NextResponse {
  const url = new URL(pathname, req.url);
  for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

export function withSession(response: NextResponse, session: Session): NextResponse {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return response;
  response.cookies.set(SESSION_COOKIE, signSession(session, secret), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function clearSession(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
