import { redirectTo } from "@/src/auth/http";
import { getSession } from "@/src/auth/session";
import { createInvite, findUserById } from "@/src/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return redirectTo(req, "/login", { next: "/cuenta" });
  const user = findUserById(session.uid);
  if (!user || user.role !== "admin") return redirectTo(req, "/cuenta", { error: "Solo el admin invita." });
  const form = await req.formData();
  const emailRaw = String(form.get("email") ?? "").trim().toLowerCase();
  const token = createInvite(user.id, emailRaw || null);
  return redirectTo(req, "/cuenta", { invite: token });
}
