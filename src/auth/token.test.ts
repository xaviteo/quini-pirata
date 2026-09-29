import { describe, expect, it } from "vitest";
import { readSession, signSession } from "./token";

describe("sesión", () => {
  it("vuelve a leer lo que firmó", () => {
    const token = signSession({ uid: 4, role: "admin" }, "secreto", 1_000);
    expect(readSession(token, "secreto", 1_000)).toEqual({ uid: 4, role: "admin" });
  });

  it("rechaza otra clave y una sesión vencida", () => {
    const token = signSession({ uid: 4, role: "member" }, "secreto", 1_000);
    expect(readSession(token, "otra", 1_000)).toBeNull();
    expect(readSession(token, "secreto", 1_000 + 1000 * 60 * 60 * 24 * 31)).toBeNull();
  });
});
