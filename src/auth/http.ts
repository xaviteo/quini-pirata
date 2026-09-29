import { NextResponse } from "next/server";
import { signSession, type Session } from "@/src/auth/token";
import { SESSION_COOKIE } from "@/src/auth/session";

const CANONICAL_ORIGIN = "https://quini.pirata.app";

type HeaderSource = { get(name: string): string | null };

export function originFrom(headers: HeaderSource, reqUrl?: string): string {
  const host = allowedHost(first(headers.get("x-forwarded-host"))) ?? allowedHost(first(headers.get("host")));
  if (host) return `${protoFor(headers, host)}://${host}`;
  if (reqUrl) {
    try {
      const url = new URL(reqUrl);
      const fromReq = allowedHost(url.host);
      if (fromReq) return `${url.protocol}//${fromReq}`;
    } catch {
      // req.url can be a path. Fall through to the public origin.
    }
  }
  const configured = process.env.PUBLIC_ORIGIN?.replace(/\/$/, "");
  if (configured === CANONICAL_ORIGIN) return configured;
  return CANONICAL_ORIGIN;
}

export function redirectTo(req: Request, pathname: string, params?: Record<string, string>): NextResponse {
  const url = new URL(pathname, originFrom(req.headers, req.url));
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

function first(value: string | null): string | null {
  const piece = value?.split(",")[0]?.trim();
  return piece || null;
}

function allowedHost(raw: string | null): string | null {
  if (!raw || /[\s@/\\]/.test(raw)) return null;
  let name = raw;
  let port = "";
  if (raw.startsWith("[")) {
    const end = raw.indexOf("]");
    if (end < 0) return null;
    name = raw.slice(1, end);
    port = raw.slice(end + 1);
  } else if ((raw.match(/:/g) ?? []).length === 1) {
    const colon = raw.indexOf(":");
    name = raw.slice(0, colon);
    port = raw.slice(colon);
  }
  const host = name.toLowerCase();
  if (host !== "quini.pirata.app" && host !== "localhost" && host !== "127.0.0.1" && host !== "::1") return null;
  if (port && !/^:\d{1,5}$/.test(port)) return null;
  if (host === "quini.pirata.app") return "quini.pirata.app";
  return `${host === "::1" ? "[::1]" : host}${port}`;
}

function protoFor(headers: HeaderSource, host: string): "http" | "https" {
  if (host === "quini.pirata.app") return "https";
  const forwarded = first(headers.get("x-forwarded-proto"));
  if (forwarded === "http" || forwarded === "https") return forwarded;
  return "http";
}
