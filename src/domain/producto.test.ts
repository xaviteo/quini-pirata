import { describe, expect, it } from "vitest";
import { formatPesos, pesosArgentinos } from "./premios";
import { archivoBoleta, fraseArchivo, reemplazoAlAzar, revisar } from "./revisar";
import type { Draw } from "./types";

function draw(parcial: Partial<Draw> & Pick<Draw, "sorteo" | "fecha">): Draw {
  return {
    tradicional: [1, 2, 3, 4, 5, 6],
    segunda: [7, 8, 9, 10, 11, 12],
    revancha: [13, 14, 15, 16, 17, 18],
    siempreSale: [19, 20, 21, 22, 23, 24],
    ...parcial,
  };
}

describe("premios en pesos", () => {
  it("rechaza un monto de revancha ilegible y formatea el resto", () => {
    expect(pesosArgentinos("2.57.2821.792")).toBeNull();
    expect(pesosArgentinos("2.469.571.272")).toBe(2_469_571_272);
    expect(formatPesos(2_469_571_272)).toContain("2.469.571.272");
  });
});

describe("revisar una boleta", () => {
  const ultimo = draw({
    sorteo: 10,
    fecha: "2026-10-14",
    tradicional: [1, 9, 23, 24, 32, 37],
  });

  it("cuenta aciertos y no festeja un 3", () => {
    const result = revisar([1, 9, 23, 2, 3, 4], ultimo);
    expect(result.linea).toBe("3 en Tradicional · 1 en Segunda · 0 en Revancha · 1 en Siempre Sale.");
    expect(result.celebrar).toBe(false);
  });

  it("dice si la combinación exacta no está en Tradicional", () => {
    const archivo = archivoBoleta([1, 2, 3, 4, 5, 7], [ultimo]);
    expect(fraseArchivo(archivo)).toContain("nunca salió en Tradicional");
    expect(reemplazoAlAzar([0, 1, 2, 3, 4, 5], 3)).toBeGreaterThanOrEqual(0);
  });
});
