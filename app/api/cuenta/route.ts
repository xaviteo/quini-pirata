import { redirectTo, withSession } from "@/src/auth/http";
import { createMember, ensureAdmin, findUserByEmail } from "@/src/db";

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) return new Response("Falta AUTH_SECRET", { status: 500 });
  await ensureAdmin();
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!email.includes("@")) return redirectTo(req, "/login", { error: "mail" });
  if (password.length < 8) return redirectTo(req, "/login", { error: "clave" });
  const error = await createMember(email, password, name || "Jugador");
  if (error) return redirectTo(req, "/login", { error: "existe" });
  const user = findUserByEmail(email);
  if (!user) return redirectTo(req, "/login", { error: "1" });
  return withSession(redirectTo(req, "/jugadas"), { uid: user.id, role: user.role });
}
