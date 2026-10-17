"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoonIcon, Seal, SunIcon, UserIcon } from "@/components/icons";

const LINKS = [
  ["/", "Hoy"],
  ["/resultado", "Resultado"],
  ["/historico", "Archivo"],
  ["/laboratorio", "Lab"],
  ["/jugadas", "Mis boletas"],
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"day" | "night">("night");
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "day" || current === "night") setTheme(current);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return () => document.body.classList.remove("menu-open");
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  function toggleTheme() {
    const next = theme === "night" ? "day" : "night";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("quini-theme", next);
    setTheme(next);
  }

  const cuenta = pathname.startsWith("/cuenta") || pathname.startsWith("/login");

  return (
    <header className="nav">
      <Link className="brand" href="/">
        <Seal />
        <span>quini.pirata.app</span>
      </Link>
      <div className="nav-end">
        <Link className="cuenta-link" href="/cuenta" aria-label="Cuenta" data-active={cuenta}>
          <UserIcon />
        </Link>
        <button className="theme-btn" type="button" onClick={toggleTheme}>
          {theme === "night" ? <SunIcon /> : <MoonIcon />}
          <span>{theme === "night" ? "Día" : "Noche"}</span>
        </button>
        <button
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          <i />
          <i />
        </button>
      </div>
      <nav className="nav-links" data-open={open} aria-label="Secciones">
        <button ref={closeRef} className="menu-close" type="button" onClick={() => setOpen(false)}>
          Cerrar
        </button>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} data-active={isActive(pathname, href)}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
