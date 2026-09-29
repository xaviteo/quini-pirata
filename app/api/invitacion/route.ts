import { redirectTo, withSession } from "@/src/auth/http";
import { acceptInvite, findUserByEmail } from "@/src/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const phone = String(form.get("phone") ?? "").trim();
  if (name.length < 2) return redirectTo(req, `/invitacion/${token}`, { error: "Falta el nombre." });
  if (!email.includes("@")) return redirectTo(req, `/invitacion/${token}`, { error: "El mail no sirve." });
  if (password.length < 8) return redirectTo(req, `/invitacion/${token}`, { error: "La clave necesita 8 caracteres." });
  const error = await acceptInvite({ token, name, email, password, phone: phone || null });
  if (error) return redirectTo(req, `/invitacion/${token}`, { error });
  const user = findUserByEmail(email);
  if (!user) return redirectTo(req, "/login");
  return withSession(redirectTo(req, "/jugadas"), { uid: user.id, role: user.role });
}
