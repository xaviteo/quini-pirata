import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { originFrom } from "@/src/auth/http";
import { getSession } from "@/src/auth/session";
import { ensureAdmin, findUserById } from "@/src/db";

export default async function CuentaPage({ searchParams }: { searchParams: Promise<{ error?: string; invite?: string }> }) {
  await ensureAdmin();
  const session = await getSession();
  if (!session) redirect("/login?next=/cuenta");
  const user = findUserById(session.uid);
  if (!user) redirect("/login");
  const params = await searchParams;
  const inviteLink = params.invite ? `${originFrom(await headers())}/invitacion/${params.invite}` : null;

  return (
    <main className="page">
      <p className="kicker">{user.role === "admin" ? "Admin" : "Miembro"}</p>
      <h1>{user.name}</h1>
      <p className="note">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
      <p className="note">El aviso por mail sale cuando esté el SMTP. WhatsApp espera la plantilla de Meta.</p>
      {params.error ? <p className="note">{params.error}</p> : null}
      {inviteLink ? <p className="note">Invitación nueva: {inviteLink}</p> : null}
      {user.role === "admin" ? (
        <form className="form" method="post" action="/api/invitaciones">
          <label className="field">
            Mail de la invitación, si ya lo sabés
            <input name="email" type="email" />
          </label>
          <button className="pill" type="submit">Crear invitación</button>
        </form>
      ) : null}
      <form method="post" action="/api/logout">
        <button className="pill" type="submit">Salir</button>
      </form>
    </main>
  );
}
