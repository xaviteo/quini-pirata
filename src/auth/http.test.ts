import { describe, expect, it } from "vitest";
import { originFrom } from "./http";

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null };
}

describe("origen público", () => {
  it("ignora el host interno del contenedor", () => {
    expect(originFrom(headers({ host: "0.0.0.0:3000" }), "https://0.0.0.0:3000/api/login")).toBe("https://quini.pirata.app");
  });

  it("usa el host que manda el proxy", () => {
    expect(originFrom(headers({ "x-forwarded-host": "quini.pirata.app", "x-forwarded-proto": "https", host: "0.0.0.0:3000" }))).toBe("https://quini.pirata.app");
  });

  it("conserva el puerto local", () => {
    expect(originFrom(headers({ host: "localhost:3210" }), "http://localhost:3210/api/login")).toBe("http://localhost:3210");
  });

  it("no sigue un host ajeno", () => {
    expect(originFrom(headers({ "x-forwarded-host": "evil.example", host: "quini.pirata.app" }))).toBe("https://quini.pirata.app");
  });
});
