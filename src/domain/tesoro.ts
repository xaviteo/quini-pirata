export type TesoroItem = { nombre: string; cantidad: number };

export type Tesoro = { apagado: true; frase: string } | { apagado: false; frase: string; items: TesoroItem[] };

const CONCRETOS = [
  { nombre: "Falcon 83", precio: 6_800_000 },
  { nombre: "alquileres", precio: 450_000 },
];

const DOMESTICOS = [
  { nombre: "asados", precio: 420_000 },
  { nombre: "sueldos", precio: 1_200_000 },
  { nombre: "fernet con coca", precio: 35_000 },
];

const ABSURDOS = [
  { nombre: "Mogul", precio: 25 },
  { nombre: "docenas de facturas", precio: 12_000 },
  { nombre: "chips de $1", precio: 1 },
];

function cantidad(monto: number, precio: number): number {
  return Math.floor(monto / precio);
}

function fraseCantidad(item: TesoroItem): string {
  return `${new Intl.NumberFormat("es-AR").format(item.cantidad)} ${item.nombre}`;
}

/** Cuatro unidades: dos concretas, una de la casa y una absurda. Sin monto, no hay tesoro. */
export function tesoro(monto: number | null, ganadores: number, sorteo: number): Tesoro | null {
  if (monto == null || monto <= 0) return null;
  if (ganadores > 0) {
    return { apagado: true, frase: "Esta vez el pozo se fue. Un boleto lo cambió de verdad." };
  }
  const domestico = DOMESTICOS[Math.abs(sorteo) % DOMESTICOS.length];
  const absurdo = ABSURDOS[Math.abs(sorteo) % ABSURDOS.length];
  const items = [...CONCRETOS, domestico, absurdo].map((item) => ({
    nombre: item.nombre,
    cantidad: cantidad(monto, item.precio),
  }));
  return {
    apagado: false,
    items,
    frase: `Con el Tradicional de hoy podrías: ${items.map(fraseCantidad).join(" · ")}.`,
  };
}

export function formatPesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(monto);
}
