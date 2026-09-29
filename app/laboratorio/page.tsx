import { loadBacktest, loadBoard, loadNumberStats } from "@/src/data/draws";
import { pad } from "@/src/domain/house";

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
      <table className="sheet">
        <thead>
          <tr>
            <th>Receta</th>
            <th>Sorteos</th>
            <th>Aciertos promedio</th>
            <th>Premios de 4+</th>
            <th>Seis en Tradicional</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.id === "casa" ? "is-casa" : undefined}>
              <td>{row.label}</td>
              <td>{row.draws}</td>
              <td>{row.avgHitsTradicional.toFixed(3)}</td>
              <td>{row.prizesOfFour}</td>
              <td>{row.sixes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="year">Peso de la casa para el sorteo {board.upcoming.sorteo}</p>
      <table className="sheet">
        <thead>
          <tr>
            <th>N°</th>
            <th>Apariciones</th>
            <th>Sorteos de atraso</th>
            <th>Peso</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.n} className={board.house.numbers.includes(stat.n) ? "is-casa" : undefined}>
              <td>{pad(stat.n)}</td>
              <td>{stat.appearances}</td>
              <td>{stat.delay}</td>
              <td>{stat.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
