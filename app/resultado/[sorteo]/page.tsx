import { notFound } from "next/navigation";
import { Resultado } from "@/components/resultado";
import { loadBoard } from "@/src/data/draws";

export default async function SorteoPage({ params }: { params: Promise<{ sorteo: string }> }) {
  const { sorteo } = await params;
  const numero = Number(sorteo);
  if (!Number.isInteger(numero)) notFound();
  const { draws } = await loadBoard();
  return <Resultado draws={draws} sorteo={numero} />;
}
