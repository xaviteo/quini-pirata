import type { Draw } from "./types";

const MODALITIES: { pattern: RegExp; key: "tradicional" | "segunda" | "revancha" | "siempreSale" }[] = [
  { pattern: /tradicional primer/, key: "tradicional" },
  { pattern: /segunda/, key: "segunda" },
  { pattern: /revancha/, key: "revancha" },
  { pattern: /siempre sale/, key: "siempreSale" },
];

function six(raw: string): number[] | null {
  const nums = [...raw.matchAll(/<li[^>]*>\s*(\d{1,2})\s*<\/li>/gi)].map((match) => Number(match[1]));
  if (nums.length !== 6 || new Set(nums).size !== 6 || nums.some((n) => n > 45)) return null;
  return [...nums].sort((a, b) => a - b);
}

/** Lee el HTML de una entrada del blog quini-6.com.ar. Devuelve null si falta una modalidad. */
export function parseBloggerHtml(html: string): Draw | null {
  const head = html.match(/Sorteo:\s*(\d+)\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!head) return null;
  const sorteo = Number(head[1]);
  const day = Number(head[2]);
  const month = Number(head[3]);
  const year = Number(head[4]);
  if (!Number.isInteger(sorteo) || sorteo < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const found: Partial<Pick<Draw, "tradicional" | "segunda" | "revancha" | "siempreSale">> = {};
  const sections = html.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const section of sections) {
    const title = section[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
    const modality = MODALITIES.find((item) => item.pattern.test(title));
    if (!modality || found[modality.key]) continue;
    const nums = six(section[2]);
    if (!nums) return null;
    found[modality.key] = nums;
  }
  if (!found.tradicional || !found.segunda || !found.revancha || !found.siempreSale) return null;
  const fecha = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    sorteo,
    fecha,
    tradicional: found.tradicional,
    segunda: found.segunda,
    revancha: found.revancha,
    siempreSale: found.siempreSale,
    fuente: "quini-6.com.ar_blogger",
  };
}

export function sameDraw(a: Draw, b: Draw): boolean {
  const key = (draw: Draw) =>
    [draw.fecha, draw.tradicional, draw.segunda, draw.revancha, draw.siempreSale].flat().join(",");
  return a.sorteo === b.sorteo && key(a) === key(b);
}

/** Si dos entradas del mismo sorteo no coinciden, se descarta ese sorteo. */
export function dedupeDraws(draws: Draw[]): Draw[] {
  const kept = new Map<number, Draw>();
  const rejected = new Set<number>();
  for (const draw of draws) {
    if (rejected.has(draw.sorteo)) continue;
    const previous = kept.get(draw.sorteo);
    if (!previous) {
      kept.set(draw.sorteo, draw);
      continue;
    }
    if (!sameDraw(previous, draw)) {
      kept.delete(draw.sorteo);
      rejected.add(draw.sorteo);
    }
  }
  return [...kept.values()].sort((a, b) => a.sorteo - b.sorteo);
}
