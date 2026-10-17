const ERRORES: Record<string, string> = {
  "1": "Mail o clave incorrectos.",
  mail: "Ese mail no sirve.",
  clave: "La clave necesita 8 caracteres.",
  existe: "Ese mail ya tiene cuenta.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/jugadas";
  const error = params.error ? ERRORES[params.error] ?? "No se pudo entrar." : null;

  return (
    <main className="page">
      <p className="kicker">Mis boletas</p>
      <h1>Entrar</h1>
      <p className="note">Para guardar boletas y ver si alguna vez pegaste.</p>
      {error ? <p className="note">{error}</p> : null}
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
      <h2 className="subhead">Crear cuenta</h2>
      <form className="form" method="post" action="/api/cuenta">
        <label className="field">
          Nombre
          <input name="name" autoComplete="name" />
        </label>
        <label className="field">
          Mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          Clave
          <input name="password" type="password" minLength={8} autoComplete="new-password" required />
        </label>
        <button className="pill" type="submit">Crear cuenta</button>
      </form>
    </main>
  );
}
