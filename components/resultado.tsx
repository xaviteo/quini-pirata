import Link from "next/link";
import { notFound } from "next/navigation";
import { StaticNumbers } from "@/components/numbers";
import { premiosDe } from "@/src/data/premios";
import { getSession } from "@/src/auth/session";
import { listTickets } from "@/src/db";
import { cronica } from "@/src/domain/cronica";
import { formatFecha, pad } from "@/src/domain/house";
import { formatPesos } from "@/src/domain/premios";
import { pozoExtra } from "@/src/domain/prizes";
import { revisar } from "@/src/domain/revisar";
import type { Draw } from "@/src/domain/types";

export async function Resultado({ draws, sorteo }: { draws: Draw[]; sorteo: number }) {
  const index = draws.findIndex((draw) => draw.sorteo === sorteo);
  const draw = draws[index];
  if (!draw) notFound();
  const prev = index > 0 ? draws[index - 1] : null;
  const next = index < draws.length - 1 ? draws[index + 1] : null;
  const premios = premiosDe(draw.sorteo);
  const extra = pozoExtra(draw);
  const lines = cronica(draw, premios);
  const session = await getSession();
  const tickets = session ? listTickets(session.uid).filter((ticket) => ticket.active === 1) : [];

  const bands = [
    ["Tradicional", draw.tradicional, premios?.tradicional ?? null],
    ["La Segunda", draw.segunda, premios?.segunda ?? null],
    ["Revancha", draw.revancha, premios?.revancha ?? null],
  ] as const;

  return (
    <main className="page">
      <div className="pager">
        {prev ? <Link href={`/resultado/${prev.sorteo}`}>‹ {prev.sorteo}</Link> : <span />}
        <b>Sorteo {draw.sorteo}</b>
        {next ? <Link href={`/resultado/${next.sorteo}`}>{next.sorteo} ›</Link> : <span />}
      </div>
      <h1>{formatFecha(draw.fecha)}</h1>
      <p className="chip">{premios ? "Números y premios listos" : "Números listos · premios todavía no"}</p>
      <div className="bands">
        {bands.map(([label, numbers, premio]) => (
          <section className="band" key={label}>
            <h2>
              {label}
              {premio ? (premio.ganadores === 0 ? " · vacante" : ` · ${premio.ganadores} ganadores`) : ""}
            </h2>
            <StaticNumbers numbers={numbers} />
            {premio ? <p className="pozo">{formatPesos(premio.monto)}</p> : null}
          </section>
        ))}
        <section className="band">
          <h2>
            Siempre Sale
            {premios?.siempreSale ? ` · ${premios.siempreSale.ganadores} con ${premios.siempreSale.categoria}` : ""}
          </h2>
          <StaticNumbers numbers={draw.siempreSale} />
          {premios?.siempreSale ? <p className="pozo">{formatPesos(premios.siempreSale.monto)}</p> : null}
        </section>
        <section className="band">
          <h2>Pozo extra · {extra.length} números</h2>
          <StaticNumbers numbers={extra} dense />
        </section>
      </div>
      {tickets.length > 0 ? (
        <section className="band">
          <h2>Tu boleta</h2>
          {tickets.map((ticket) => {
            const numbers = ticket.numbers.split(" ").map(Number);
            const result = revisar(numbers, draw);
            const nombre = ticket.alias ? `${ticket.alias} · ${ticket.numbers}` : ticket.numbers;
            return <p className={result.celebrar ? "note spark" : "note"} key={ticket.id}>{nombre}: {result.linea}</p>;
          })}
        </section>
      ) : null}
      <section className="band">
        <h2>Crónica</h2>
        {lines.map((line) => <p className="note" key={line}>{line}</p>)}
      </section>
      <p className="fine-inline">Bolillas {draw.tradicional.map(pad).join(" ")} en Tradicional.</p>
    </main>
  );
}
