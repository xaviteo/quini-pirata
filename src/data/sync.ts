import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dedupeDraws, parseBloggerHtml, sameDraw } from "@/src/domain/feed";
import { parseBloggerPremios, type Premios } from "@/src/domain/premios";
import { writePremios } from "@/src/data/premios";
import { nextSorteo, pad } from "@/src/domain/house";
import { parseCsv } from "@/src/domain/parse";
import type { Draw } from "@/src/domain/types";

const FEED = "https://www.quini-6.com.ar/feeds/posts/default?alt=json&max-results=12";
const RETRY_MS = 15 * 60 * 1000;

type FeedPayload = {
  feed?: {
    entry?: { content?: { $t?: string } }[];
    link?: { rel?: string; href?: string }[];
  };
};

let inflight: Promise<void> | null = null;
let lastAttempt = 0;

export function historicoPath(): string {
  return path.join(process.cwd(), "quini6_historico.csv");
}

export function livePath(): string {
  return path.join(process.cwd(), "data", "quini6_live.csv");
}

export function readDraws(): Draw[] {
  const base = parseCsv(readFileSync(historicoPath(), "utf8"));
  let extra: Draw[] = [];
  try {
    extra = parseCsv(readFileSync(livePath(), "utf8"));
  } catch {
    extra = [];
  }
  const byId = new Map(base.map((draw) => [draw.sorteo, draw]));
  for (const draw of extra) {
    const previous = byId.get(draw.sorteo);
    if (!previous) byId.set(draw.sorteo, draw);
    else if (!sameDraw(previous, draw)) {
      console.error(`Sorteo ${draw.sorteo} del vivo no coincide con el archivo. Se deja el archivo.`);
    }
  }
  return [...byId.values()].sort((a, b) => a.sorteo - b.sorteo);
}

function row(draw: Draw): string {
  const cell = (numbers: number[]) => numbers.map(pad).join(" ");
  return [
    draw.sorteo,
    draw.fecha,
    cell(draw.tradicional),
    cell(draw.segunda),
    cell(draw.revancha),
    cell(draw.siempreSale),
    draw.fuente ?? "quini-6.com.ar_blogger",
  ].join(",");
}

function writeLive(draws: Draw[]): void {
  const dir = path.dirname(livePath());
  mkdirSync(dir, { recursive: true });
  const body = ["sorteo,fecha,tradicional,segunda,revancha,siempre_sale,fuentes", ...draws.map(row)].join("\n");
  writeFileSync(livePath(), `${body}\n`, "utf8");
}

async function fetchPage(url: string): Promise<FeedPayload> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Feed ${response.status}`);
  return (await response.json()) as FeedPayload;
}

async function pullNewer(knownMax: number): Promise<{ draws: Draw[]; premios: Premios[] }> {
  const found: Draw[] = [];
  const premios: Premios[] = [];
  let url: string | null = FEED;
  for (let page = 0; page < 8 && url; page++) {
    const payload = await fetchPage(url);
    const entries = payload.feed?.entry ?? [];
    let sawKnown = false;
    for (const entry of entries) {
      const html = entry.content?.$t ?? "";
      const draw = parseBloggerHtml(html);
      if (!draw) continue;
      const premio = parseBloggerPremios(html, draw.sorteo);
      if (premio) premios.push(premio);
      if (draw.sorteo <= knownMax) sawKnown = true;
      else found.push(draw);
    }
    if (sawKnown || entries.length === 0) break;
    url = payload.feed?.link?.find((link) => link.rel === "next")?.href ?? null;
  }
  return { draws: dedupeDraws(found), premios };
}

async function pull(known: Draw[]): Promise<void> {
  const last = known.at(-1);
  if (!last) return;
  const pulled = await pullNewer(last.sorteo);
  if (pulled.premios.length > 0) writePremios(pulled.premios);
  const newer = pulled.draws;
  if (newer.length === 0) return;
  let current: Draw[] = [];
  try {
    current = parseCsv(readFileSync(livePath(), "utf8"));
  } catch {
    current = [];
  }
  const baseIds = new Set(known.map((draw) => draw.sorteo));
  const merged = new Map<number, Draw>();
  for (const draw of [...current, ...newer]) {
    if (baseIds.has(draw.sorteo)) continue;
    const previous = merged.get(draw.sorteo);
    if (!previous) merged.set(draw.sorteo, draw);
    else if (!sameDraw(previous, draw)) merged.delete(draw.sorteo);
  }
  writeLive([...merged.values()].sort((a, b) => a.sorteo - b.sorteo));
}

export function refreshIfStale(draws: Draw[]): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VITEST) return Promise.resolve();
  const last = draws.at(-1);
  if (!last) return Promise.resolve();
  const upcoming = nextSorteo(last);
  // El Quini sale 21:15, hora de Argentina, sin horario de verano.
  const due = Date.parse(`${upcoming.fecha}T21:20:00-03:00`);
  if (Number.isNaN(due) || Date.now() < due) return Promise.resolve();
  if (Date.now() - lastAttempt < RETRY_MS) return Promise.resolve();
  lastAttempt = Date.now();
  if (!inflight) {
    inflight = pull(draws)
      .catch((error: unknown) => {
        console.error("No se pudo actualizar el extracto", error);
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}
