import { pad } from "./house";
import { hits } from "./prizes";
import type { NumberStat } from "./stats";
import type { Draw } from "./types";

export type ModoRevision = { nombre: string; aciertos: number; pegados: number[] };

export type Revision = {
  numeros: number[];
  linea: string;
  modos: ModoRevision[];
  celebrar: boolean;
  pegados: number[];
};

export type ArchivoBoleta = {
  exacta: { sorteo: number; fecha: string } | null;
  mejor: number;
  de4: number;
  de5: number;
  de6: number;
  ultima: { sorteo: number; fecha: string; modalidad: string; aciertos: number } | null;
};

const MODOS = [
  ["Tradicional", "tradicional"],
  ["Segunda", "segunda"],
  ["Revancha", "revancha"],
  ["Siempre Sale", "siempreSale"],
] as const;

export function revisar(numeros: number[], draw: Draw): Revision {
  const modos = MODOS.map(([nombre, key]) => {
    const drawn = draw[key];
    const pegados = numeros.filter((n) => drawn.includes(n));
    return { nombre, aciertos: pegados.length, pegados };
  });
  const celebrar = modos.some((modo) => {
    if (modo.nombre === "Tradicional" || modo.nombre === "Segunda") return modo.aciertos >= 4;
    if (modo.nombre === "Revancha") return modo.aciertos === 6;
    return modo.aciertos >= 5;
  });
  const pegados = [...new Set(modos.flatMap((modo) => modo.pegados))].sort((a, b) => a - b);
  return {
    numeros,
    linea: modos.map((modo) => `${modo.aciertos} en ${modo.nombre}`).join(" · ") + ".",
    modos,
    celebrar,
    pegados,
  };
}

export function archivoBoleta(numeros: number[], draws: Draw[]): ArchivoBoleta {
  let exacta: ArchivoBoleta["exacta"] = null;
  let mejor = 0;
  let de4 = 0;
  let de5 = 0;
  let de6 = 0;
  let ultima: ArchivoBoleta["ultima"] = null;
  for (const draw of draws) {
    if (hits(numeros, draw.tradicional) === 6) exacta = { sorteo: draw.sorteo, fecha: draw.fecha };
    for (const [nombre, key] of MODOS) {
      const aciertos = hits(numeros, draw[key]);
      if (aciertos > mejor) mejor = aciertos;
      const premioChico = (nombre === "Tradicional" || nombre === "Segunda") && aciertos >= 4;
      const revancha = nombre === "Revancha" && aciertos === 6;
      const sale = nombre === "Siempre Sale" && aciertos >= 5;
      if (premioChico) {
        if (aciertos === 4) de4 += 1;
        if (aciertos === 5) de5 += 1;
        if (aciertos === 6) de6 += 1;
      }
      if (premioChico || revancha || sale) {
        ultima = { sorteo: draw.sorteo, fecha: draw.fecha, modalidad: nombre, aciertos };
      }
    }
  }
  return { exacta, mejor, de4, de5, de6, ultima };
}

export function fraseArchivo(archivo: ArchivoBoleta): string {
  const exacta = archivo.exacta
    ? `Esa combinación salió en Tradicional, sorteo ${archivo.exacta.sorteo} (${archivo.exacta.fecha}).`
    : "Esta combinación exacta nunca salió en Tradicional.";
  const premios = archivo.de4 + archivo.de5 + archivo.de6;
  const premio = premios === 0
    ? "En el archivo no junta 4 en Tradicional ni en La Segunda."
    : `En Tradicional y La Segunda: ${archivo.de4} de 4, ${archivo.de5} de 5, ${archivo.de6} de 6.`;
  return `${exacta} ${premio}`;
}

function bajos(numeros: number[]): number {
  return numeros.filter((n) => n <= 14).length;
}

function altos(numeros: number[]): number {
  return numeros.filter((n) => n >= 31).length;
}

export function consejos(boletas: number[][], stats: NumberStat[]): string[] {
  const notas: string[] = [];
  if (boletas.length >= 2) {
    const comunes = boletas[0].filter((n) => boletas.every((boleta) => boleta.includes(n)));
    for (const n of comunes) {
      notas.push(`El ${pad(n)} está en las ${boletas.length}. Si querés cubrir más palo, reemplazalo en una sola.`);
    }
  }
  for (const boleta of boletas) {
    if (bajos(boleta) >= 5 && altos(boleta) >= 1) {
      notas.push("Estás muy del lado 00–14. No es mejor ni peor; es menos variado.");
      break;
    }
  }
  const peor = [...stats].sort((a, b) => b.delay - a.delay)[0];
  if (peor && boletas.some((boleta) => boleta.includes(peor.n))) {
    notas.push(
      `El ${pad(peor.n)} no sale hace ${peor.delay}. Eso no lo hace más probable. Si te cansó, cambialo por gusto, no por sistema.`,
    );
  }
  return notas.slice(0, 3);
}

export function compartenCinco(boletas: number[][]): boolean {
  for (let i = 0; i < boletas.length; i++) {
    for (let j = i + 1; j < boletas.length; j++) {
      const set = new Set(boletas[i]);
      const comunes = boletas[j].filter((n) => set.has(n)).length;
      if (comunes >= 5) return true;
    }
  }
  return false;
}

export function reemplazoAlAzar(ocupados: number[], semilla: number): number {
  const libres = Array.from({ length: 46 }, (_, n) => n).filter((n) => !ocupados.includes(n));
  const index = Math.abs(semilla) % libres.length;
  return libres[index] ?? 0;
}
