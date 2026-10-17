export type Pozo = { ganadores: number; monto: number };

export type Premios = {
  sorteo: number;
  tradicional: Pozo | null;
  segunda: Pozo | null;
  revancha: Pozo | null;
  siempreSale: { categoria: number; ganadores: number; monto: number } | null;
  pozoProximo: number | null;
};

/** Lee el primer premio de cada modalidad en el HTML del blog. */
export function parseBloggerPremios(html: string, sorteo: number): Premios | null {
  const chunks = [...html.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4|pozo extra|$)/gi)];
  const found: Partial<Premios> = {};
  for (const chunk of chunks) {
    const title = chunk[1].replace(/<[^>]+>/g, " ").toLowerCase();
    const row = chunk[2].match(/<td>\s*(\d+)\s*<\/td>\s*<td>\s*([\d.]+)\s*<\/td>\s*<td>\s*([^<]*\d[^<]*)<\/td>/i);
    if (!row) continue;
    const categoria = Number(row[1]);
    const ganadores = Number(row[2].replace(/\./g, ""));
    const monto = pesosArgentinos(row[3]);
    if (!Number.isInteger(ganadores) || monto == null) continue;
    if (/tradicional primer/.test(title)) found.tradicional = { ganadores, monto };
    else if (/segunda/.test(title)) found.segunda = { ganadores, monto };
    else if (/revancha/.test(title)) found.revancha = { ganadores, monto };
    else if (/siempre sale/.test(title)) found.siempreSale = { categoria, ganadores, monto };
  }
  if (!found.tradicional && !found.segunda && !found.revancha && !found.siempreSale) return null;
  const dolares = [...html.matchAll(/\$\s*([0-9]{1,3}(?:\.[0-9]{3})+)/g)];
  const proximo = dolares.at(-1)?.[1];
  return {
    sorteo,
    tradicional: found.tradicional ?? null,
    segunda: found.segunda ?? null,
    revancha: found.revancha ?? null,
    siempreSale: found.siempreSale ?? null,
    pozoProximo: proximo ? pesosArgentinos(proximo) : null,
  };
}

export function pesosArgentinos(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(/\$/g, "");
  if (!/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned) && !/^\d+(,\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}
