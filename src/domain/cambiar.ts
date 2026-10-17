const UNIDADES = [
  { claves: ["alquiler", "alquilar"], nombre: "alquileres de 2 ambientes en Santa Fe", precio: 450_000 },
  { claves: ["asado"], nombre: "asados para 10", precio: 420_000 },
  { claves: ["sueldo"], nombre: "sueldos", precio: 1_200_000 },
  { claves: ["falcon"], nombre: "Falcon 1983", precio: 6_800_000 },
  { claves: ["fernet"], nombre: "fernet con coca", precio: 35_000 },
  { claves: ["factura"], nombre: "docenas de facturas", precio: 12_000 },
  { claves: ["mogul"], nombre: "Mogul", precio: 25 },
  { claves: ["chip", "ficha"], nombre: "chips de $1", precio: 1 },
];

function pesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(monto);
}

/** Una frase, una respuesta. Solo unidades con precio publicado. */
export function cambiar(frase: string, monto: number): string[] {
  const texto = frase.trim();
  const limpia = texto.toLowerCase();
  if (!limpia) return ["Escribí en qué lo cambiarías. Un alquiler, un asado, un sueldo."];
  const unidad = UNIDADES.find((item) => item.claves.some((clave) => limpia.includes(clave)));
  if (!unidad) {
    return [
      "Esa frase no tiene un precio cargado.",
      "Puedo pasarlo a alquiler, asado, sueldo, Falcon, fernet, facturas o Mogul.",
    ];
  }
  const cantidad = Math.floor(monto / unidad.precio);
  return [
    `El Tradicional vacante es ${pesos(monto)}.`,
    `“${texto}” lo paso a ${unidad.nombre}, a ${pesos(unidad.precio)} cada uno.`,
    `Entran ${new Intl.NumberFormat("es-AR").format(cantidad)}. Misma plata, otra unidad.`,
  ];
}
