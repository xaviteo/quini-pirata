import Link from "next/link";
import { loadBoard } from "@/src/data/draws";
import { pad } from "@/src/domain/house";
import type { Draw } from "@/src/domain/types";

const CHIPS = [
  ["T", "Tradicional"],
  ["S", "La Segunda"],
  ["R", "Revancha"],
  ["SS", "Siempre Sale"],
] as const;

function coincide(draw: Draw, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  if (String(draw.sorteo).includes(query)) return true;
  if (draw.fecha.includes(query)) return true;
  const fecha = query.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!fecha) return false;
  const iso = `${fecha[3]}-${fecha[2].padStart(2, "0")}-${fecha[1].padStart(2, "0")}`;
  return draw.fecha === iso;
}

export default async function HistoricoPage({ searchParams }: { searchParams: Promise<{ anio?: string; q?: string }> }) {
  const params = await searchParams;
  const { draws } = await loadBoard();
  const min = Number(draws[0].fecha.slice(0, 4));
  const max = Number(draws.at(-1)!.fecha.slice(0, 4));
  const years = Array.from({ length: max - min + 1 }, (_, index) => String(max - index));
  const q = params.q?.trim() ?? "";
  const anio = params.anio && years.includes(params.anio) ? params.anio : years[0];
  const vacio = !draws.some((draw) => draw.fecha.startsWith(anio));
  const shown = (q ? draws : draws.filter((draw) => draw.fecha.startsWith(anio)))
    .filter((draw) => coincide(draw, q))
    .reverse();

  return (
    <main className="page">
      <p className="kicker">{draws.length} sorteos en archivo</p>
      <h1>{q ? q : anio}</h1>
      <form className="form" method="get" action="/historico">
        <label className="field">
          Sorteo o fecha
          <input name="q" defaultValue={q} placeholder="3417 o 14/10/2026" />
        </label>
        <button className="pill" type="submit">Buscar</button>
      </form>
      <div className="pills scroll">
        {years.map((year) => {
          const empty = !draws.some((draw) => draw.fecha.startsWith(year));
          return (
            <Link className="pill" key={year} href={`/historico?anio=${year}`} data-active={year === anio && !q} data-empty={empty}>
              {empty ? `${year} · sin datos` : year}
            </Link>
          );
        })}
      </div>
      {q && shown.length === 0 ? <p className="note">Nada con ese dato.</p> : null}
      {!q && vacio ? <p className="note">{anio} · sin datos. El hueco queda vacío.</p> : null}
      <div>
        {shown.map((draw) => {
          const grupos = [draw.tradicional, draw.segunda, draw.revancha, draw.siempreSale];
          return (
            <Link className="history-row" key={draw.sorteo} href={`/resultado/${draw.sorteo}`}>
              <b>{draw.sorteo}</b>
              <div className="mini">
                <span>{draw.fecha}</span>
                {CHIPS.map(([label, title], index) => (
                  <span key={label} title={title}>{label} {grupos[index].map(pad).join(" ")}</span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
