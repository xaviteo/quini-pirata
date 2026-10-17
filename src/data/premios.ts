import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Premios } from "@/src/domain/premios";

const CONOCIDOS: Premios[] = [
  {
    sorteo: 3413,
    tradicional: { ganadores: 0, monto: 1_244_265_095 },
    segunda: { ganadores: 0, monto: 4_322_169_936 },
    revancha: { ganadores: 0, monto: 1_527_929_741 },
    siempreSale: { categoria: 5, ganadores: 12, monto: 31_202_037 },
    pozoProximo: 9_400_000_000,
  },
  {
    sorteo: 3414,
    tradicional: { ganadores: 0, monto: 1_605_244_410 },
    segunda: { ganadores: 0, monto: 4_683_149_251 },
    revancha: { ganadores: 0, monto: 2_145_847_680 },
    siempreSale: { categoria: 5, ganadores: 45, monto: 11_108_448 },
    pozoProximo: 10_100_000_000,
  },
  {
    sorteo: 3415,
    tradicional: { ganadores: 0, monto: 1_854_657_756 },
    segunda: { ganadores: 0, monto: 4_932_562_597 },
    revancha: null,
    siempreSale: { categoria: 5, ganadores: 31, monto: 11_920_273 },
    pozoProximo: 11_650_000_000,
  },
  {
    sorteo: 3416,
    tradicional: { ganadores: 0, monto: 2_225_118_974 },
    segunda: { ganadores: 2, monto: 2_651_511_907 },
    revancha: { ganadores: 0, monto: 3_206_956_234 },
    siempreSale: { categoria: 5, ganadores: 29, monto: 17_636_538 },
    pozoProximo: 8_000_000_000,
  },
  {
    sorteo: 3417,
    tradicional: { ganadores: 0, monto: 2_469_571_272 },
    segunda: { ganadores: 0, monto: 1_100_000_000 },
    revancha: { ganadores: 0, monto: 3_625_515_763 },
    siempreSale: { categoria: 5, ganadores: 7, monto: 52_059_996 },
    pozoProximo: 9_100_000_000,
  },
];

function livePath(): string {
  return path.join(process.cwd(), "data", "premios_live.json");
}

export function readPremios(): Premios[] {
  const byId = new Map(CONOCIDOS.map((item) => [item.sorteo, item]));
  try {
    const extra = JSON.parse(readFileSync(livePath(), "utf8")) as Premios[];
    for (const item of extra) {
      if (item && Number.isInteger(item.sorteo)) byId.set(item.sorteo, item);
    }
  } catch {
    // Todavía no hay premios nuevos en disco.
  }
  return [...byId.values()].sort((a, b) => a.sorteo - b.sorteo);
}

export function premiosDe(sorteo: number): Premios | null {
  return readPremios().find((item) => item.sorteo === sorteo) ?? null;
}

export function writePremios(extra: Premios[]): void {
  const dir = path.dirname(livePath());
  mkdirSync(dir, { recursive: true });
  const current = readPremios().filter((item) => !CONOCIDOS.some((known) => known.sorteo === item.sorteo));
  const merged = new Map<number, Premios>();
  for (const item of [...current, ...extra]) merged.set(item.sorteo, item);
  const rows = [...merged.values()].filter((item) => !CONOCIDOS.some((known) => known.sorteo === item.sorteo));
  writeFileSync(livePath(), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}
