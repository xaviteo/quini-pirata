import { loadBacktest, loadBoard, loadNumberStats } from "@/src/data/draws";
import { pad } from "@/src/domain/house";

const RECETAS: Record<string, string> = {
  azar: "Seis números al azar, sin mirar cuáles salieron.",
  franja: "Descarta la boleta rara de suma y de forma. No elige un número porque esté atrasado.",
  atraso: "Prefiere los que hace más que no salen. No por eso son más probables.",
  casa: "La boleta del sistema. Misma chance que cualquier otra.",
};

export const dynamic = "force-dynamic";

export default async function LaboratorioPage() {
  const board = await loadBoard();
  const rows = loadBacktest(board.draws);
  const stats = loadNumberStats(board.draws);
  const sorteos = rows[0]?.draws ?? 0;
  const seis = rows.reduce((total, row) => total + row.sixes, 0);
  const cierre = seis === 0 ? "Cero seises." : `${seis} seises.`;
  const casa = board.house.numbers;
  const baja = casa.filter((n) => n <= 14).length;
  const media = casa.filter((n) => n >= 15 && n <= 30).length;
  const alta = casa.filter((n) => n >= 31).length;

  return (
    <main className="page">
      <p className="kicker">Lab</p>
      <h1>Cuatro recetas</h1>
      <p className="note">
        Probamos 4 formas de armar una boleta en {sorteos} sorteos. Todas rinden como elegir al azar. {cierre}
      </p>
      <div className="bands">
        {rows.map((row) => (
          <article className={row.id === "casa" ? "band is-casa" : "band"} key={row.id}>
            <h2>{row.label}</h2>
            <p className="note">{RECETAS[row.id]}</p>
            <dl className="stats">
              <div><dt>Sorteos</dt><dd>{row.draws}</dd></div>
              <div><dt>Aciertos</dt><dd>{row.avgHitsTradicional.toFixed(3)}</dd></div>
              <div><dt>Premios de 4+</dt><dd>{row.prizesOfFour}</dd></div>
              <div><dt>Seis</dt><dd>{row.sixes}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p className="year">La boleta de la casa, sorteo {board.upcoming.sorteo}</p>
      <p className="note">
        Semilla {board.upcoming.sorteo}. Suma {board.house.sum}. Impares {board.house.odds}. Franjas {baja} en 00–14, {media} en 15–30, {alta} en 31–45.
      </p>
      <dl className="glossary">
        <dt>Atraso</dt>
        <dd>Sorteos seguidos sin salir. 0 es que salió en el último. 8 es ocho sorteos sin aparecer.</dd>
        <dt>Semilla</dt>
        <dd>El número del sorteo que se va a jugar. Con el archivo anterior, la boleta se puede repetir.</dd>
        <dt>Franja</dt>
        <dd>00–14, 15–30 y 31–45. Es una forma de mirar la boleta, no una ventaja.</dd>
        <dt>4+</dt>
        <dd>Cuatro o más. En Tradicional y La Segunda eso cobra. Revancha cobra con 6. Siempre Sale, con la categoría que publique.</dd>
      </dl>
      <p className="year">Atraso para el sorteo {board.upcoming.sorteo}. Marcados, los de la boleta de la casa.</p>
      <ol className="weight-grid">
        {stats.map((stat) => (
          <li key={stat.n} data-on={board.house.numbers.includes(stat.n)} title={`${pad(stat.n)} · atraso ${stat.delay}`}>
            <b>{pad(stat.n)}</b>
            <small>{stat.delay}</small>
          </li>
        ))}
      </ol>
    </main>
  );
}
