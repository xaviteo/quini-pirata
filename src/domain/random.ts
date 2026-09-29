/** Mulberry32. Misma semilla, misma serie. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleDistinct(rng: () => number, count: number, weights?: number[]): number[] {
  const pool: number[] = [];
  for (let n = 0; n <= 45; n++) pool.push(n);
  const picked: number[] = [];
  while (picked.length < count) {
    const size = pool.length;
    let index = size - 1;
    if (weights) {
      let total = 0;
      for (let i = 0; i < size; i++) total += weights[pool[i]];
      let roll = rng() * total;
      for (let i = 0; i < size; i++) {
        roll -= weights[pool[i]];
        if (roll < 0) {
          index = i;
          break;
        }
      }
    } else {
      index = Math.floor(rng() * size);
    }
    const chosen = pool[index];
    pool[index] = pool[size - 1];
    pool.pop();
    picked.push(chosen);
  }
  return picked.sort((a, b) => a - b);
}
