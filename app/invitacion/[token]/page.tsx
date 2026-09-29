import { findInvite } from "@/src/db";

export default async function InvitacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const invite = findInvite(token);

  return (
    <main className="page">
      <p className="kicker">Invitación</p>
      <h1>Sumate</h1>
      {!invite || invite.used_by ? <p className="note">Esta invitación ya no sirve.</p> : null}
      {query.error ? <p className="note">{query.error}</p> : null}
      {invite && !invite.used_by ? (
        <form className="form" method="post" action="/api/invitacion">
          <input type="hidden" name="token" value={token} />
          <label className="field">
            Nombre
            <input name="name" required />
          </label>
          <label className="field">
            Mail
            <input name="email" type="email" defaultValue={invite.email ?? ""} required />
          </label>
          <label className="field">
            WhatsApp
            <input name="phone" placeholder="+54 9 ..." />
          </label>
          <label className="field">
            Clave
            <input name="password" type="password" minLength={8} required />
          </label>
          <button className="pill" type="submit">Crear cuenta</button>
        </form>
      ) : null}
    </main>
  );
}
