"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  ["/", "Portada"],
  ["/mesa", "Mesa"],
  ["/resultado", "Resultado"],
  ["/historico", "Histórico"],
  ["/laboratorio", "Laboratorio"],
  ["/jugadas", "Jugadas"],
  ["/cuenta", "Cuenta"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"day" | "night">("night");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "day" || current === "night") setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "night" ? "day" : "night";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("quini-theme", next);
    setTheme(next);
  }

  return (
    <header className="nav">
      <Link className="brand" href="/">quini.pirata.app</Link>
      <nav className="nav-links">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} data-active={pathname === href}>
            {label}
          </Link>
        ))}
        <button className="theme-btn" type="button" onClick={toggle}>
          {theme === "night" ? "Día" : "Noche"}
        </button>
      </nav>
    </header>
  );
}
