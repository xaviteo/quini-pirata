export function parseSix(values: string[]): { numbers: number[] } | { error: string } {
  if (values.length !== 6) return { error: "Hacen falta 6 números." };
  const numbers = values.map((value) => Number(value.trim()));
  if (numbers.some((n) => !Number.isInteger(n) || n < 0 || n > 45)) {
    return { error: "Cada número va del 00 al 45." };
  }
  if (new Set(numbers).size !== 6) return { error: "Los 6 números tienen que ser distintos." };
  numbers.sort((a, b) => a - b);
  return { numbers };
}

export function formatSix(numbers: number[]): string {
  return numbers.map((n) => n.toString().padStart(2, "0")).join(" ");
}
