import Link from "next/link";
import { getSession } from "@/src/auth/session";
import { loadBoard, loadNumberStats } from "@/src/data/draws";
import { ensureAdmin, listTickets } from "@/src/db";
import { pad } from "@/src/domain/house";
import { archivoBoleta, compartenCinco, consejos, fraseArchivo, reemplazoAlAzar, revisar } from "@/src/domain/revisar";
import { formatSix, parseSix } from "@/src/domain/ticket";

type Query = {
  error?: string;
  boleta?: string;
  cambio?: string;
  n0?: string;
  n1?: string;
  n2?: string;
  n3?: string;
  n4?: string;
  n5?: string;
};

function valores(params: Query): string[] | null {
  if (params.boleta) {
    const parts = params.boleta.split(/[\s+]+/).filter(Boolean);
    return parts.length ? parts : null;
  }
  const named = [params.n0, params.n1, params.n2, params.n3, params.n4, params.n5];
  if (named.every((value) => value == null || value === "")) return null;
  return named.map((value) => value ?? "");
}

export default async function JugadasPage({ searchParams }: { searchParams: Promise<Query> }) {
  await ensureAdmin();
  const session = await getSession();
  const params = await searchParams;
  const board = await loadBoard();
  const tickets = session ? listTickets(session.uid) : [];
  const crudos = valores(params);
  const parsed = crudos ? parseSix(crudos) : null;
  const ok = parsed && !("error" in parsed) ? parsed.numbers : null;
  const revision = ok ? revisar(ok, board.last) : null;
  const archivo = ok ? archivoBoleta(ok, board.draws) : null;
  const campos = ok ? ok.map(pad) : crudos ?? ["", "", "", "", "", ""];
  const activas = tickets.filter((ticket) => ticket.active === 1).map((ticket) => ticket.numbers.split(" ").map(Number));
  const notas = consejos(activas, loadNumberStats(board.draws));
  const repetidas = compartenCinco(activas);
  const ocupados = [...new Set(activas.flat())];
  const propuesta = ocupados.length > 0 ? reemplazoAlAzar(ocupados, board.upcoming.sorteo) : null;
  const query = ok ? ok.map(pad).join("+") : "";
  const loginHref = `/login?next=${encodeURIComponent(query ? `/jugadas?boleta=${query}` : "/jugadas")}`;

  return (
    <main className="page">
      <p className="kicker">Mis boletas</p>
      <h1>Verificar</h1>
      <p className="note">Seis números del 00 al 45, distintos. El archivo se mira acá, no en el navegador.</p>
      {params.error ? <p className="note">{params.error}</p> : null}
      <form className="form" method="get" action="/jugadas">
        <div className="row-6">
          {campos.map((value, index) => (
            <input
              key={index}
              name={`n${index}`}
              defaultValue={value}
              inputMode="numeric"
              maxLength={2}
              aria-label={`Número ${index + 1}`}
            />
          ))}
        </div>
        <button className="pill" type="submit">Verificar</button>
      </form>
      {parsed && "error" in parsed ? <p className="note">{parsed.error}</p> : null}
      {revision && archivo && ok ? (
        <section className="band">
          <h2>Sorteo {board.last.sorteo}</h2>
          <ol className="balls">
            {revision.numeros.map((n) => (
              <li key={n} className={revision.pegados.includes(n) ? "hit" : "miss"}>{pad(n)}</li>
            ))}
          </ol>
          <p className={revision.celebrar ? "note spark" : "note"}>{revision.linea}</p>
          <p className="note">{fraseArchivo(archivo)}</p>
          {archivo.ultima ? (
            <p className="note">
              Última vez con premio: {archivo.ultima.aciertos} en {archivo.ultima.modalidad}, sorteo {archivo.ultima.sorteo} ({archivo.ultima.fecha}).
            </p>
          ) : null}
          {session ? (
            <form className="form" method="post" action="/api/jugadas">
              <input type="hidden" name="action" value="create" />
              {ok.map((n, index) => (
                <input key={index} type="hidden" name={`n${index}`} value={pad(n)} />
              ))}
              <label className="field">
                Alias, si querés
                <input name="alias" maxLength={40} />
              </label>
              <div className="choices">
                <label><input type="radio" name="kind" value="once" defaultChecked /> Solo el {board.upcoming.sorteo}</label>
                <label><input type="radio" name="kind" value="standing" /> Fija, todos los sorteos</label>
              </div>
              <button className="pill" type="submit">Guardar en mis boletas</button>
            </form>
          ) : (
            <p className="note">
              <Link href={loginHref}>Entrá</Link> para guardarla. Para guardar boletas y ver si alguna vez pegaste.
            </p>
          )}
        </section>
      ) : null}
      {session ? (
        <section>
          <p className="year">Guardadas</p>
          {repetidas ? <p className="note">Dos boletas comparten 5 números.</p> : null}
          {notas.map((nota) => (
            <p className="note" key={nota}>{nota}</p>
          ))}
          {propuesta != null ? (
            params.cambio === "1" ? (
              <p className="note">Propuesta: {pad(propuesta)}. Al azar. Misma chance.</p>
            ) : (
              <p><Link className="pill" href="/jugadas?cambio=1">Proponer un reemplazo</Link></p>
            )
          ) : null}
          <div className="bands">
            {tickets.map((ticket) => {
              const numbers = ticket.numbers.split(" ").map(Number);
              const result = revisar(numbers, board.last);
              const pasado = archivoBoleta(numbers, board.draws);
              return (
                <article className="band" key={ticket.id}>
                  <h2>
                    {ticket.alias ? `${ticket.alias} · ` : ""}
                    {formatSix(numbers)}
                    {ticket.kind === "standing" ? " · fija" : ` · sorteo ${ticket.starts_sorteo}`}
                    {ticket.active === 0 ? " · apagada" : ""}
                  </h2>
                  <p className={result.celebrar ? "note spark" : "note"}>
                    Sorteo {board.last.sorteo}. {result.linea}
                  </p>
                  <p className="note">{fraseArchivo(pasado)}</p>
                  {ticket.active === 1 && ticket.kind === "standing" ? (
                    <form method="post" action="/api/jugadas">
                      <input type="hidden" name="action" value="off" />
                      <input type="hidden" name="id" value={ticket.id} />
                      <button className="pill" type="submit">Apagar</button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="note">
          <Link href={loginHref}>Entrar</Link> para guardar boletas y ver si alguna vez pegaste.
        </p>
      )}
    </main>
  );
}
