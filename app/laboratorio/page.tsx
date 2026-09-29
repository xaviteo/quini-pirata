import { loadBacktest, loadBoard, loadNumberStats } from "@/src/data/draws";
import { pad } from "@/src/domain/house";

export const dynamic = "force-dynamic";

export default function LaboratorioPage() {
  const board = loadBoard();
  const rows = loadBacktest();
  const stats = loadNumberStats();
  const expected = (6 * 6) / 46;

  return (
    <main className="page">
      <p className="kicker">Era 00–45 · {board.draws.length} sorteos</p>
      <h1>Laboratorio</h1>
      <p className="note">
        Cada receta jugó una boleta por sorteo, armada solo con lo anterior, y se midió contra Tradicional.
        El azar espera {expected.toFixed(2)} aciertos. Un 4 o más en Tradicional o en La Segunda es premio.
      </p>
      <div className="bands">
        {rows.map((row) => (
          <article className={row.id === "casa" ? "band is-casa" : "band"} key={row.id}>
            <h2>{row.label}</h2>
            <dl className="stats">
              <div><dt>Sorteos</dt><dd>{row.draws}</dd></div>
              <div><dt>Aciertos</dt><dd>{row.avgHitsTradicional.toFixed(3)}</dd></div>
              <div><dt>Premios de 4+</dt><dd>{row.prizesOfFour}</dd></div>
              <div><dt>Seis</dt><dd>{row.sixes}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p className="year">Atraso para el sorteo {board.upcoming.sorteo}. Marcados, los de la boleta.</p>
      <ol className="weight-grid">
        {stats.map((stat, index) => (
          <li
            key={stat.n}
            data-on={board.house.numbers.includes(stat.n)}
            style={{ ["--i" as string]: index }}
            title={`${stat.appearances} apariciones · peso ${stat.weight}`}
          >
            <b>{pad(stat.n)}</b>
            <small>{stat.delay}</small>
          </li>
        ))}
      </ol>
    </main>
  );
}
