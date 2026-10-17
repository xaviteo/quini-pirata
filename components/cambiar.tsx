import { cambiar } from "@/src/domain/cambiar";

export function Cambiar({ monto, frase, action }: { monto: number; frase?: string; action: string }) {
  const lines = frase != null ? cambiar(frase, monto) : null;
  return (
    <section className="cambiar">
      <p className="kicker">En qué lo cambiás vos</p>
      <form className="form" method="get" action={action}>
        <label className="field">
          Una frase
          <input name="cambiar" defaultValue={frase ?? ""} maxLength={80} placeholder="dejar de alquilar" />
        </label>
        <button className="pill" type="submit">Traducir</button>
      </form>
      {lines?.map((line) => (
        <p className="note" key={line}>{line}</p>
      ))}
    </section>
  );
}
