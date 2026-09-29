import type { Draw } from "./types";

export type NumberStat = {
  n: number;
  appearances: number;
  delay: number;
  weight: number;
};

export function numberStats(draws: Draw[], weights: number[]): NumberStat[] {
  const appearances = Array<number>(46).fill(0);
  const lastSeen = Array<number>(46).fill(-1);
  draws.forEach((draw, index) => {
    const nums = [...draw.tradicional, ...draw.segunda, ...draw.revancha, ...draw.siempreSale];
    for (const n of nums) appearances[n] += 1;
    for (const n of new Set(nums)) lastSeen[n] = index;
  });
  return appearances.map((count, n) => ({
    n,
    appearances: count,
    delay: lastSeen[n] < 0 ? draws.length : draws.length - 1 - lastSeen[n],
    weight: weights[n],
  }));
}
