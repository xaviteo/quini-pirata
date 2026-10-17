import Link from "next/link";
import { Checker } from "@/components/checker";
import { CopyButton } from "@/components/copy-button";
import { StaticNumbers } from "@/components/numbers";
import { premiosDe } from "@/src/data/premios";
import { loadBoard } from "@/src/data/draws";
import { pad } from "@/src/domain/house";
import { formatPesos } from "@/src/domain/premios";

export default async function HomePage() {
  const { upcoming, house, last } = await loadBoard();
  const weekday = upcoming.fechaLarga.split(",")[0] ?? upcoming.fechaLarga;
  const rest = upcoming.fechaLarga.split(",").slice(1).join(",").trim();
  const premio = premiosDe(last.sorteo)?.tradicional ?? null;
  const texto = house.numbers.map(pad).join(" ");
  const estado = premio
    ? `${premio.ganadores === 0 ? "Vacante" : `${premio.ganadores} ganadores`} · ${formatPesos(premio.monto)}`
    : null;

  return (
    <main className="poster">
      <section className="poster-top">
        <p className="kicker">Próximo sorteo · {rest}</p>
        <h1 className="weekday">{weekday}</h1>
        <div className="pills">
          <span className="pill">21:15</span>
          <span className="pill">sorteo {upcoming.sorteo}</span>
          <span className="pill">00 – 45</span>
        </div>
      </section>
      <div className="circle" aria-hidden="true">
        <svg className="ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="40" />
        </svg>
        <span>{upcoming.sorteo}</span>
      </div>
      <section className="poster-bottom">
        <p className="kicker">Último extracto</p>
        <p className="extract">
          <Link href={`/resultado/${last.sorteo}`}>
            Tradicional del {last.sorteo} · {last.tradicional.map(pad).join(" ")}
          </Link>
        </p>
        {estado ? <p className="pozo">{estado}</p> : null}
        <p className="kicker">Verificar</p>
        <Checker draw={last} />
        <p className="kicker">Boleta de la casa</p>
        <div className="boleta boleta-chica">
          <StaticNumbers numbers={house.numbers} />
        </div>
        <p className="fine">Combinación del sistema. Misma chance que cualquier otra: 1 en 9.366.819.</p>
        <div className="pills">
          <CopyButton text={texto} />
          <Link className="pill" href={`/jugadas?boleta=${house.numbers.map(pad).join("+")}`}>Guardar en mis boletas</Link>
        </div>
      </section>
    </main>
  );
}
