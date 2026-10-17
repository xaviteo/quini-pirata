"use client";

import { useEffect, useState } from "react";
import { formatPesos, type TesoroItem } from "@/src/domain/tesoro";

export function PozoTesoro({ monto, items }: { monto: number; items: TesoroItem[] }) {
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(monto);
      setReady(true);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      const eased = t >= 1 ? 1 : 1 - 2 ** (-10 * t);
      setShown(Math.round(monto * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setReady(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [monto]);

  return (
    <>
      <p className="pozo">{formatPesos(shown)}</p>
      {ready ? (
        <>
          <ul className="tesoro-list">
            {items.map((item, index) => (
              <li key={item.nombre} style={{ ["--i" as string]: index }}>
                {new Intl.NumberFormat("es-AR").format(item.cantidad)} {item.nombre}
              </li>
            ))}
          </ul>
          <p className="note">Con el Tradicional de hoy podrías.</p>
        </>
      ) : null}
    </>
  );
}
