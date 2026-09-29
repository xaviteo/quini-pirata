import { Numbers } from "@/components/numbers";
import { loadBoard } from "@/src/data/draws";

export default function MesaPage() {
  const { upcoming, house } = loadBoard();

  return (
    <main className="page">
      <p className="kicker">Cerrada antes del sorteo {upcoming.sorteo}</p>
      <h1>Mesa</h1>
      <p className="note">
        La boleta de la casa ya está guardada con la semilla del sorteo. La segunda boleta, y el informe, los escribe el modelo cuando el servidor tenga la clave de xAI. Hasta ese momento no hay una boleta de la mesa: no se inventa una después de ver el resultado.
      </p>
      <section className="band">
        <h2>Boleta de la casa</h2>
        <div className="boleta">
          <Numbers numbers={house.numbers} />
        </div>
      </section>
    </main>
  );
}
