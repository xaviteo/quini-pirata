import { StaticNumbers } from "@/components/numbers";
import { loadBoard } from "@/src/data/draws";
import { formatFecha } from "@/src/domain/house";
import { pozoExtra } from "@/src/domain/prizes";

export default function ResultadoPage() {
  const { last } = loadBoard();
  const extra = pozoExtra(last);
  const bands = [
    ["Tradicional", last.tradicional],
    ["La Segunda", last.segunda],
    ["Revancha", last.revancha],
    ["Siempre Sale", last.siempreSale],
  ] as const;

  return (
    <main className="page">
      <p className="kicker">Sorteo {last.sorteo}</p>
      <h1>{formatFecha(last.fecha)}</h1>
      <p className="note">
        Los premios en pesos entran cuando el sincronizador confirme dos fuentes. Hoy el archivo trae los números, no los montos.
      </p>
      <div className="bands">
        {bands.map(([label, numbers]) => (
          <section className="band" key={label}>
            <h2>{label}</h2>
            <StaticNumbers numbers={numbers} />
          </section>
        ))}
        <section className="band">
          <h2>Pozo Extra · {extra.length} números distintos</h2>
          <StaticNumbers numbers={extra} dense />
        </section>
      </div>
    </main>
  );
}
