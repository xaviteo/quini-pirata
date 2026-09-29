import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { backtest } from "./backtest";
import { houseTicket, isArithmetic, nextSorteo, recipeTicket } from "./house";
import { missingRanges, parseCsv } from "./parse";
import { evaluate, hits, pozoExtra } from "./prizes";
import type { Draw } from "./types";

const csv = readFileSync(path.join(process.cwd(), "quini6_historico.csv"), "utf8");
const draws = parseCsv(csv);

function draw(parcial: Partial<Draw> & Pick<Draw, "sorteo" | "fecha">): Draw {
  return {
    tradicional: [1, 2, 3, 4, 5, 6],
    segunda: [7, 8, 9, 10, 11, 12],
    revancha: [13, 14, 15, 16, 17, 18],
    siempreSale: [19, 20, 21, 22, 23, 24],
    ...parcial,
  };
}

describe("histórico", () => {
  it("llega al 3412 y conserva el hueco 2570-2755", () => {
    expect(draws[0].sorteo).toBe(1279);
    expect(draws.at(-1)?.sorteo).toBe(3412);
    expect(draws.at(-1)?.fecha).toBe("2026-09-27");
    const gap = missingRanges(draws).find((range) => range.from <= 2570 && range.to >= 2755);
    expect(gap).toBeTruthy();
  });

  it("el próximo sorteo después del domingo 27 es el miércoles 30", () => {
    expect(nextSorteo(draws.at(-1)!)).toEqual({ sorteo: 3413, fecha: "2026-09-30" });
  });
});

describe("premios", () => {
  const last = draws.at(-1)!;

  it("cuenta aciertos y cobra 4 o más en Tradicional y Segunda", () => {
    const ticket = last.tradicional;
    const result = evaluate(ticket, last, 5);
    expect(hits(ticket, last.tradicional)).toBe(6);
    expect(result.tradicional.pays).toBe(true);
    expect(result.revancha.pays).toBe(false);
  });

  it("la Revancha cobra solo con 6", () => {
    const four = last.revancha.slice(0, 4).concat([0, 1].filter((n) => !last.revancha.includes(n)).slice(0, 2));
    expect(evaluate(four, last).revancha.pays).toBe(false);
    expect(evaluate(last.revancha, last).revancha.pays).toBe(true);
  });

  it("Siempre Sale cobra en la categoría publicada, no en las de abajo", () => {
    const withFive = last.siempreSale.slice(0, 5).concat([0].filter((n) => !last.siempreSale.includes(n)));
    expect(evaluate(withFive, last, 5).siempreSale.pays).toBe(true);
    expect(evaluate(withFive, last, 6).siempreSale.pays).toBe(false);
    expect(evaluate(withFive, last, null).siempreSale.pays).toBeNull();
  });

  it("el Pozo Extra es la unión de los tres primeros bombos", () => {
    const set = pozoExtra(last);
    expect(set.length).toBeGreaterThanOrEqual(6);
    expect(set.length).toBeLessThanOrEqual(18);
    for (const n of [...last.tradicional, ...last.segunda, ...last.revancha]) {
      expect(set).toContain(n);
    }
    expect(evaluate(last.tradicional, last).pozoExtra.pays).toBe(true);
  });
});

describe("boleta de la casa", () => {
  const history = draws.slice(0, -1);
  const upcoming = 3413;

  it("es reproducible y entra en la franja", () => {
    const first = houseTicket(history, upcoming);
    const second = houseTicket(history, upcoming);
    expect(first.numbers).toEqual(second.numbers);
    expect(new Set(first.numbers).size).toBe(6);
    expect(first.odds).toBeGreaterThanOrEqual(2);
    expect(first.odds).toBeLessThanOrEqual(4);
    expect(first.lows).toBeGreaterThanOrEqual(2);
    expect(first.lows).toBeLessThanOrEqual(4);
    expect(first.sum).toBeGreaterThanOrEqual(first.sumLo);
    expect(first.sum).toBeLessThanOrEqual(first.sumHi);
    expect(isArithmetic(first.numbers)).toBe(false);
  });

  it("rechaza escaleras y progresiones", () => {
    expect(isArithmetic([0, 1, 2, 3, 4, 5])).toBe(true);
    expect(isArithmetic([0, 5, 10, 15, 20, 25])).toBe(true);
    expect(isArithmetic([0, 1, 2, 3, 4, 6])).toBe(false);
  });

  it("no repite una modalidad del sorteo anterior", () => {
    const last = history.at(-1)!;
    const ticket = recipeTicket(history, upcoming, "casa");
    const key = ticket.join("-");
    expect([last.tradicional, last.segunda, last.revancha, last.siempreSale].map((n) => n.join("-"))).not.toContain(key);
  });
});

describe("backtest corto", () => {
  it("el azar queda cerca de 0,78 aciertos por boleta", () => {
    const slice = draws.slice(200, 280);
    const rows = backtest(slice, 40);
    const random = rows.find((row) => row.id === "azar");
    expect(random?.draws).toBe(40);
    expect(random?.avgHitsTradicional).toBeGreaterThan(0.3);
    expect(random?.avgHitsTradicional).toBeLessThan(1.5);
  });
});

describe("backtest completo", () => {
  it("corre el histórico y deja el azar cerca de 0,78", () => {
    const rows = backtest(draws);
    const random = rows.find((row) => row.id === "azar")!;
    const casa = rows.find((row) => row.id === "casa")!;
    expect(random.avgHitsTradicional).toBeGreaterThan(0.6);
    expect(random.avgHitsTradicional).toBeLessThan(1);
    expect(casa.draws).toBe(random.draws);
  }, 120_000);
});

describe("fecha siguiente a un miércoles", () => {
  it("suma cuatro días", () => {
    expect(nextSorteo(draw({ sorteo: 10, fecha: "2026-09-23" }))).toEqual({
      sorteo: 11,
      fecha: "2026-09-27",
    });
  });
});
