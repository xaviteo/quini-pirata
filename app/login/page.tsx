export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/jugadas";

  return (
    <main className="page">
      <p className="kicker">Grupo chico</p>
      <h1>Entrar</h1>
      {params.error ? <p className="note">Mail o clave incorrectos.</p> : null}
      <form className="form" method="post" action="/api/login">
        <input type="hidden" name="next" value={next} />
        <label className="field">
          Mail
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          Clave
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="pill" type="submit">Entrar</button>
      </form>
    </main>
  );
}
