import { cache } from "react";
import { backtest, type BacktestRow } from "@/src/domain/backtest";
import { formatFecha, houseTicket, nextSorteo, numberWeights, type TicketReport } from "@/src/domain/house";
import { numberStats, type NumberStat } from "@/src/domain/stats";
import type { Draw } from "@/src/domain/types";
import { readDraws, refreshIfStale } from "@/src/data/sync";

export type Board = {
  draws: Draw[];
  last: Draw;
  upcoming: { sorteo: number; fecha: string; fechaLarga: string };
  house: TicketReport;
};

function boardFrom(draws: Draw[]): Board {
  const last = draws.at(-1);
  if (!last) throw new Error("El histórico está vacío");
  const upcoming = nextSorteo(last);
  return {
    draws,
    last,
    upcoming: { ...upcoming, fechaLarga: formatFecha(upcoming.fecha) },
    house: houseTicket(draws, upcoming.sorteo),
  };
}

export const loadBoard = cache(async (): Promise<Board> => {
  await refreshIfStale(readDraws());
  return boardFrom(readDraws());
});

let backtestMemo: BacktestRow[] | null = null;
let backtestKey = "";

export function loadBacktest(draws: Draw[]): BacktestRow[] {
  const key = `${draws.length}:${draws.at(-1)?.sorteo ?? 0}`;
  if (!backtestMemo || backtestKey !== key) {
    backtestMemo = backtest(draws);
    backtestKey = key;
  }
  return backtestMemo;
}

export function loadNumberStats(draws: Draw[]): NumberStat[] {
  return numberStats(draws, numberWeights(draws));
}
