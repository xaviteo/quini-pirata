import type { Draw, RecipeId } from "./types";
import { mulberry32, sampleDistinct } from "./random";

const RECENT = 60;

export type Band = { sumLo: number; sumHi: number };

export type TicketReport = {
  numbers: number[];
  sum: number;
  odds: number;
  lows: number;
  sumLo: number;
  sumHi: number;
};

export function isLow(n: number): boolean {
  return n <= 22;
}

export function shape(numbers: number[]): { sum: number; odds: number; lows: number } {
  return {
    sum: numbers.reduce((total, n) => total + n, 0),
    odds: numbers.filter((n) => n % 2 === 1).length,
    lows: numbers.filter(isLow).length,
  };
}

export function isArithmetic(sorted: number[]): boolean {
  const step = sorted[1] - sorted[0];
  if (step <= 0) return true;
  return sorted.every((n, i) => i === 0 || n - sorted[i - 1] === step);
}

export function inBand(numbers: number[], band: Band): boolean {
  const form = shape(numbers);
  return form.odds >= 2 && form.odds <= 4 && form.lows >= 2 && form.lows <= 4 && form.sum >= band.sumLo && form.sum <= band.sumHi;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - index) + sorted[hi] * (index - lo);
}

export function sumBand(draws: Draw[]): Band {
  const sums = draws.map((draw) => draw.tradicional.reduce((total, n) => total + n, 0));
  return {
    sumLo: Math.round(percentile(sums, 0.2)),
    sumHi: Math.round(percentile(sums, 0.8)),
  };
}

function appearances(draw: Draw): number[] {
  return [...draw.tradicional, ...draw.segunda, ...draw.revancha, ...draw.siempreSale];
}

/** Peso visible de cada número. Piso 50 sobre una escala de 1000, para que ninguno quede en cero. */
export function numberWeights(draws: Draw[]): number[] {
  const freq = Array<number>(46).fill(0);
  const lastSeen = Array<number>(46).fill(-1);
  const recent = draws.slice(-RECENT);
  for (const draw of recent) {
    for (const n of appearances(draw)) freq[n] += 1;
  }
  draws.forEach((draw, index) => {
    for (const n of new Set(appearances(draw))) lastSeen[n] = index;
  });
  const maxFreq = Math.max(...freq, 1);
  const span = Math.max(draws.length, 1);
  return freq.map((count, n) => {
    const delay = lastSeen[n] < 0 ? span : span - 1 - lastSeen[n];
    const delayScore = delay / span;
    const coldScore = 1 - count / maxFreq;
    return Math.max(50, Math.round((0.5 * delayScore + 0.5 * coldScore) * 1000));
  });
}

function bannedKeys(draws: Draw[]): Set<string> {
  const last = draws[draws.length - 1];
  return new Set([last.tradicional, last.segunda, last.revancha, last.siempreSale].map((nums) => nums.join("-")));
}

function accept(numbers: number[], band: Band, banned: Set<string>, useBand: boolean): boolean {
  const key = numbers.join("-");
  if (banned.has(key) || isArithmetic(numbers)) return false;
  if (useBand && !inBand(numbers, band)) return false;
  return true;
}

export type PreparedDraw = {
  band: Band;
  weights: number[];
  banned: Set<string>;
};

export function prepareDraw(history: Draw[]): PreparedDraw {
  return {
    band: sumBand(history),
    weights: numberWeights(history),
    banned: bannedKeys(history),
  };
}

const SALTS: Record<RecipeId, number> = { casa: 1, atraso: 2, franja: 3, azar: 4 };

/**
 * Boleta reproducible. La semilla es el número de sorteo que se está por jugar,
 * y el histórico es solo lo anterior a ese sorteo.
 */
export function recipeTicket(history: Draw[], sorteo: number, recipe: RecipeId, prepared?: PreparedDraw): number[] {
  if (history.length < 30) {
    throw new Error("Hace falta más histórico para armar una boleta");
  }
  const rng = mulberry32((Math.imul(sorteo, 997) ^ SALTS[recipe]) >>> 0);
  const { band, weights, banned } = prepared ?? prepareDraw(history);
  const weighted = recipe === "casa" || recipe === "atraso";
  const useBand = recipe === "casa" || recipe === "franja";

  for (let attempt = 0; attempt < 4000; attempt++) {
    const numbers = sampleDistinct(rng, 6, weighted ? weights : undefined);
    if (accept(numbers, band, banned, useBand)) return numbers;
  }
  throw new Error(`No salió una boleta ${recipe} para el sorteo ${sorteo}`);
}

export function houseTicket(history: Draw[], sorteo: number): TicketReport {
  const numbers = recipeTicket(history, sorteo, "casa");
  const form = shape(numbers);
  const band = sumBand(history);
  return { numbers, ...form, ...band };
}

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function nextSorteo(last: Draw): { sorteo: number; fecha: string } {
  const [year, month, day] = last.fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const add = weekday === 0 ? 3 : 4;
  date.setUTCDate(date.getUTCDate() + add);
  const fecha = date.toISOString().slice(0, 10);
  return { sorteo: last.sorteo + 1, fecha };
}

export function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
