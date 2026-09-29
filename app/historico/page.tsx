import Link from "next/link";
import { loadBoard } from "@/src/data/draws";
import { pad } from "@/src/domain/house";

export default async function HistoricoPage({ searchParams }: { searchParams: Promise<{ anio?: string }> }) {
  const params = await searchParams;
  const { draws } = loadBoard();
  const years = [...new Set(draws.map((draw) => draw.fecha.slice(0, 4)))].reverse();
  const anio = params.anio && years.includes(params.anio) ? params.anio : years[0];
  const shown = draws.filter((draw) => draw.fecha.startsWith(anio)).reverse();

  return (
    <main className="page">
      <p className="kicker">{draws.length} sorteos en archivo</p>
      <h1>{anio}</h1>
      <div className="pills scroll">
        {years.map((year) => (
          <Link className="pill" key={year} href={`/historico?anio=${year}`} data-active={year === anio}>
            {year}
          </Link>
        ))}
      </div>
      <div>
        {shown.map((draw) => (
          <article className="history-row" key={draw.sorteo}>
            <b>{draw.sorteo}</b>
            <div className="mini">
              <span>{draw.fecha}</span>
              <span>T {draw.tradicional.map(pad).join(" ")}</span>
              <span>S {draw.segunda.map(pad).join(" ")}</span>
              <span>R {draw.revancha.map(pad).join(" ")}</span>
              <span>SS {draw.siempreSale.map(pad).join(" ")}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
