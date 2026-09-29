import { clearSession, redirectTo } from "@/src/auth/http";

export async function POST(req: Request) {
  return clearSession(redirectTo(req, "/"));
}
