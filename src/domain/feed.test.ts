import { describe, expect, it } from "vitest";
import { dedupeDraws, parseBloggerHtml } from "./feed";

const ENTRY = `
<h3>Sorteo: 3417 - 14/10/2026</h3>
<h4>Tradicional Primer Sorteo</h4>
<ul><li>09</li><li>01</li><li>24</li><li>37</li><li>23</li><li>32</li></ul>
<h4>Tradicional la Segunda del Quini</h4>
<ul><li>44</li><li>43</li><li>23</li><li>05</li><li>08</li><li>13</li></ul>
<h4>Quini6 Revancha</h4>
<ul><li>04</li><li>30</li><li>37</li><li>10</li><li>25</li><li>06</li></ul>
<h4>El Quini que Siempre Sale</h4>
<ul><li>01</li><li>43</li><li>14</li><li>41</li><li>18</li><li>44</li></ul>
`;

describe("feed del blog", () => {
  it("ordena los seis números y arma la fecha", () => {
    const draw = parseBloggerHtml(ENTRY);
    expect(draw).toMatchObject({
      sorteo: 3417,
      fecha: "2026-10-14",
      tradicional: [1, 9, 23, 24, 32, 37],
      segunda: [5, 8, 13, 23, 43, 44],
      revancha: [4, 6, 10, 25, 30, 37],
      siempreSale: [1, 14, 18, 41, 43, 44],
    });
  });

  it("ignora una entrada incompleta", () => {
    expect(parseBloggerHtml("<h3>Sorteo: 9 - 1/1/2026</h3>")).toBeNull();
  });

  it("si el mismo sorteo trae números distintos, no se queda con ninguno", () => {
    const first = parseBloggerHtml(ENTRY)!;
    const other = { ...first, tradicional: [0, 1, 2, 3, 4, 5] };
    expect(dedupeDraws([first, other])).toEqual([]);
    expect(dedupeDraws([first, { ...first }])).toEqual([first]);
  });
});
