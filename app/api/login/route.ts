import { verifyPassword } from "@/src/auth/password";
import { redirectTo, withSession } from "@/src/auth/http";
import { ensureAdmin, findUserByEmail } from "@/src/db";

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) {
    return new Response("Falta AUTH_SECRET", { status: 500 });
  }
  await ensureAdmin();
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safePath(String(form.get("next") ?? "/jugadas"));
  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return redirectTo(req, "/login", { error: "1", next });
  }
  return withSession(redirectTo(req, next), { uid: user.id, role: user.role });
}

function safePath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/jugadas";
}
