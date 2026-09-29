import type { Draw } from "./types";

function six(raw: string, label: string, sorteo: number): number[] {
  const nums = raw
    .trim()
    .split(/\s+/)
    .map((part) => Number(part));
  if (nums.length !== 6 || nums.some((n) => !Number.isInteger(n) || n < 0 || n > 45)) {
    throw new Error(`Sorteo ${sorteo}: ${label} no tiene 6 números entre 00 y 45`);
  }
  const unique = new Set(nums);
  if (unique.size !== 6) {
    throw new Error(`Sorteo ${sorteo}: ${label} repite un número`);
  }
  return [...nums].sort((a, b) => a - b);
}

export function parseCsv(text: string): Draw[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  const draws: Draw[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    if (cols.length < 6) continue;
    const sorteo = Number(cols[0]);
    const fecha = cols[1];
    if (!Number.isInteger(sorteo) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new Error(`Fila inválida: ${line.slice(0, 80)}`);
    }
    draws.push({
      sorteo,
      fecha,
      tradicional: six(cols[2], "tradicional", sorteo),
      segunda: six(cols[3], "segunda", sorteo),
      revancha: six(cols[4], "revancha", sorteo),
      siempreSale: six(cols[5], "siempre sale", sorteo),
      fuente: cols[6]?.trim() || undefined,
    });
  }
  draws.sort((a, b) => a.sorteo - b.sorteo);
  return draws;
}

export function missingRanges(draws: Draw[]): { from: number; to: number; count: number }[] {
  const ranges: { from: number; to: number; count: number }[] = [];
  for (let i = 1; i < draws.length; i++) {
    const prev = draws[i - 1].sorteo;
    const cur = draws[i].sorteo;
    if (cur > prev + 1) {
      ranges.push({ from: prev + 1, to: cur - 1, count: cur - prev - 1 });
    }
  }
  return ranges;
}
