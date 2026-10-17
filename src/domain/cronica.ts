import { formatFecha, pad } from "./house";
import type { Premios } from "./premios";
import type { Draw } from "./types";

function bolas(numbers: number[]): string {
  return numbers.map(pad).join(" ");
}

function repetidos(draw: Draw): number[] {
  const counts = new Map<number, number>();
  for (const n of [...draw.tradicional, ...draw.segunda, ...draw.revancha, ...draw.siempreSale]) {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([n]) => n).sort((a, b) => a - b);
}

function pozo(label: string, numbers: number[], premio: { ganadores: number; monto: number } | null): string {
  const bolillas = bolas(numbers);
  if (!premio) return `${label}: ${bolillas}.`;
  if (premio.ganadores === 0) return `${label} vacante. ${bolillas}. El pozo sigue.`;
  const gente = premio.ganadores === 1 ? "1 boleto" : `${premio.ganadores} boletos`;
  return `${label}: ${gente} se lo llevó. ${bolillas}.`;
}

/** Seis a ocho líneas, con lo que pasó. Sin promesa. */
export function cronica(draw: Draw, premios: Premios | null): string[] {
  const lines = [`Sorteo ${draw.sorteo}, ${formatFecha(draw.fecha)}.`];
  lines.push(pozo("Tradicional", draw.tradicional, premios?.tradicional ?? null));
  lines.push(pozo("La Segunda", draw.segunda, premios?.segunda ?? null));
  lines.push(pozo("Revancha", draw.revancha, premios?.revancha ?? null));
  if (premios?.siempreSale) {
    const sale = premios.siempreSale;
    lines.push(
      `Siempre Sale pagó a ${sale.ganadores} con ${sale.categoria}. ${bolas(draw.siempreSale)}.`,
    );
  } else {
    lines.push(`Siempre Sale: ${bolas(draw.siempreSale)}.`);
  }
  const shared = repetidos(draw);
  if (shared.length > 0) {
    lines.push(`Salieron en más de un bombo: ${shared.map(pad).join(", ")}.`);
  }
  return lines.slice(0, 8);
}
