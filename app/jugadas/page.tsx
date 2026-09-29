import { redirect } from "next/navigation";
import { getSession } from "@/src/auth/session";
import { loadBoard } from "@/src/data/draws";
import { ensureAdmin, listTickets } from "@/src/db";
import { evaluate } from "@/src/domain/prizes";
import type { Draw } from "@/src/domain/types";

export default async function JugadasPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureAdmin();
  const session = await getSession();
  if (!session) redirect("/login?next=/jugadas");
  const params = await searchParams;
  const board = loadBoard();
  const tickets = listTickets(session.uid);

  return (
    <main className="page">
      <p className="kicker">Seis números · todas las modalidades · $4.000</p>
      <h1>Jugadas</h1>
      {params.error ? <p className="note">{params.error}</p> : null}
      <form className="form" method="post" action="/api/jugadas">
        <input type="hidden" name="action" value="create" />
        <div className="row-6">
          {["n0", "n1", "n2", "n3", "n4", "n5"].map((name, index) => (
            <input key={name} name={name} inputMode="numeric" maxLength={2} required aria-label={`Número ${index + 1}`} />
          ))}
        </div>
        <div className="choices">
          <label><input type="radio" name="kind" value="once" defaultChecked /> Solo el {board.upcoming.sorteo}</label>
          <label><input type="radio" name="kind" value="standing" /> Fija, todos los sorteos</label>
        </div>
        <button className="pill" type="submit">Guardar</button>
      </form>
      <div className="bands">
        {tickets.map((ticket) => {
          const numbers = ticket.numbers.split(" ").map(Number);
          const draw = drawFor(ticket.kind, ticket.starts_sorteo, ticket.active === 1, board.draws, board.last, board.upcoming.sorteo);
          const result = draw ? evaluate(numbers, draw) : null;
          return (
            <article className="band" key={ticket.id}>
              <h2>
                {ticket.numbers} · {ticket.kind === "standing" ? "fija" : `sorteo ${ticket.starts_sorteo}`}
                {ticket.active === 0 ? " · apagada" : ""}
              </h2>
              {result && draw ? (
                <p className="note">
                  Sorteo {draw.sorteo}. Tradicional {result.tradicional.hits}
                  {result.tradicional.pays ? " (premio)" : ""}. La Segunda {result.segunda.hits}
                  {result.segunda.pays ? " (premio)" : ""}. Revancha {result.revancha.hits}
                  {result.revancha.pays ? " (premio)" : ""}. Siempre Sale {result.siempreSale.hits}. Pozo Extra {result.pozoExtra.hits}
                  {result.pozoExtra.pays ? " (premio)" : ""}.
                  {result.anyPrize ? " Hay premio en alguna modalidad." : " En este sorteo no cobra."}
                </p>
              ) : (
                <p className="note">Entra en el sorteo {ticket.starts_sorteo}. Todavía no hay resultado.</p>
              )}
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
    </main>
  );
}

function drawFor(
  kind: "once" | "standing",
  starts: number,
  active: boolean,
  draws: Draw[],
  last: Draw,
  upcoming: number,
): Draw | null {
  if (kind === "once") return draws.find((draw) => draw.sorteo === starts) ?? null;
  if (!active || starts > last.sorteo) return starts === upcoming ? null : last;
  return last;
}
