"use client";

import { useEffect, useState } from "react";
import { pad } from "@/src/domain/house";

export function Numbers({ numbers, className = "nums" }: { numbers: number[]; className?: string }) {
  const [shown, setShown] = useState(numbers);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(numbers);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = numbers.map((target, index) => {
        const local = (now - start - index * 80) / 680;
        if (local <= 0) return 0;
        const eased = 1 - (1 - Math.min(1, local)) ** 3;
        return Math.round(eased * target);
      });
      setShown(next);
      const done = numbers.every((_, index) => now - start - index * 80 >= 680);
      if (!done) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numbers]);

  return (
    <ol className={className}>
      {shown.map((n, index) => (
        <li key={index} style={{ ["--i" as string]: index }}>{pad(n)}</li>
      ))}
    </ol>
  );
}

export function StaticNumbers({ numbers, dense = false }: { numbers: number[]; dense?: boolean }) {
  return (
    <ol className={dense ? "nums dense" : "nums"}>
      {numbers.map((n, index) => (
        <li key={n} style={{ ["--i" as string]: index }}>{pad(n)}</li>
      ))}
    </ol>
  );
}
