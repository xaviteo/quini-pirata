import { describe, expect, it } from "vitest";
import { parseSix } from "./ticket";

describe("parseSix", () => {
  it("ordena y acepta una boleta válida", () => {
    expect(parseSix(["45", "02", "9", "13", "36", "44"])).toEqual({
      numbers: [2, 9, 13, 36, 44, 45],
    });
  });

  it("rechaza repetidos y números fuera de rango", () => {
    expect(parseSix(["1", "1", "2", "3", "4", "5"])).toEqual({
      error: "Los 6 números tienen que ser distintos.",
    });
    expect("error" in parseSix(["1", "2", "3", "4", "5", "46"])).toBe(true);
  });
});
