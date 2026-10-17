"use client";

import { useState } from "react";
import { pad } from "@/src/domain/house";
import { revisar } from "@/src/domain/revisar";
import { parseSix } from "@/src/domain/ticket";
import type { Draw } from "@/src/domain/types";

export function Checker({ draw }: { draw: Draw }) {
  const [values, setValues] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [done, setDone] = useState<ReturnType<typeof revisar> | null>(null);

  function verify() {
    const parsed = parseSix(values);
    if ("error" in parsed) {
      setDone(null);
      setError(parsed.error);
      return;
    }
    setError("");
    setDone(revisar(parsed.numbers, draw));
  }

  const query = done ? done.numeros.map(pad).join("+") : "";

  return (
    <form
      className="checker"
      onSubmit={(event) => {
        event.preventDefault();
        verify();
      }}
    >
      <div className="row-6">
        {values.map((value, index) => (
          <input
            key={index}
            inputMode="numeric"
            maxLength={2}
            aria-label={`Número ${index + 1}`}
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value.replace(/\D/g, "").slice(0, 2);
              setValues(next);
            }}
          />
        ))}
      </div>
      <button className="pill" type="submit">Verificar</button>
      {error ? <p className="note">{error}</p> : null}
      {done ? (
        <div className="check-result">
          <ol className="balls">
            {done.numeros.map((n) => (
              <li key={n} className={done.pegados.includes(n) ? "hit" : "miss"}>{pad(n)}</li>
            ))}
          </ol>
          <p className={done.celebrar ? "note spark" : "note"}>{done.linea}</p>
          <a className="pill" href={`/jugadas?boleta=${query}`}>Ver en el archivo</a>
        </div>
      ) : null}
    </form>
  );
}
