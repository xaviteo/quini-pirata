"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      className="pill"
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => setDone(true));
      }}
    >
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}
