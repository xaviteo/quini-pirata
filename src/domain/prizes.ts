import type { Draw } from "./types";

export function hits(ticket: number[], drawn: number[]): number {
  const set = new Set(drawn);
  return ticket.reduce((count, n) => count + (set.has(n) ? 1 : 0), 0);
}

/** Números distintos de Tradicional + Segunda + Revancha. Siempre Sale no entra. */
export function pozoExtra(draw: Draw): number[] {
  return [...new Set([...draw.tradicional, ...draw.segunda, ...draw.revancha])].sort((a, b) => a - b);
}

export type Evaluation = {
  tradicional: { hits: number; pays: boolean };
  segunda: { hits: number; pays: boolean };
  revancha: { hits: number; pays: boolean };
  siempreSale: { hits: number; pays: boolean | null };
  pozoExtra: { hits: number; pays: boolean; conjunto: number[] };
  anyPrize: boolean;
};

/**
 * Siempre Sale solo se puede dar por cobrado si sabemos qué categoría se pagó.
 * Si la tabla todavía no está, `pays` queda en null: hay aciertos, falta el corte.
 * Se cobra únicamente en la categoría que se pagó, no en las de abajo.
 */
export function evaluate(ticket: number[], draw: Draw, siempreSalePaidAt?: number | null): Evaluation {
  const tradicionalHits = hits(ticket, draw.tradicional);
  const segundaHits = hits(ticket, draw.segunda);
  const revanchaHits = hits(ticket, draw.revancha);
  const siempreHits = hits(ticket, draw.siempreSale);
  const conjunto = pozoExtra(draw);
  const extraHits = hits(ticket, conjunto);
  const tradicional = { hits: tradicionalHits, pays: tradicionalHits >= 4 };
  const segunda = { hits: segundaHits, pays: segundaHits >= 4 };
  const revancha = { hits: revanchaHits, pays: revanchaHits === 6 };
  const siempreSale = {
    hits: siempreHits,
    pays: siempreSalePaidAt == null ? null : siempreHits === siempreSalePaidAt && siempreHits > 0,
  };
  const extra = { hits: extraHits, pays: extraHits === 6, conjunto };
  const anyPrize = tradicional.pays || segunda.pays || revancha.pays || siempreSale.pays === true || extra.pays;
  return { tradicional, segunda, revancha, siempreSale, pozoExtra: extra, anyPrize };
}
