import { Numbers } from "@/components/numbers";
import { loadBoard } from "@/src/data/draws";
import { pad } from "@/src/domain/house";

export default function HomePage() {
  const { upcoming, house } = loadBoard();
  const weekday = upcoming.fechaLarga.split(",")[0] ?? upcoming.fechaLarga;
  const rest = upcoming.fechaLarga.split(",").slice(1).join(",").trim();

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
        <span>{upcoming.sorteo}</span>
      </div>
      <section className="poster-bottom">
        <p className="kicker">Boleta de la casa</p>
        <Numbers numbers={house.numbers} />
        <p className="fine">
          Semilla {upcoming.sorteo}. Suma {house.sum}, entre {house.sumLo} y {house.sumHi}. {house.odds} impares y {house.lows} bajos.
          Los números son {house.numbers.map(pad).join(" ")}. La chance de estos seis es la misma que la de cualquier otra boleta: 1 en 9.366.819.
        </p>
      </section>
    </main>
  );
}
