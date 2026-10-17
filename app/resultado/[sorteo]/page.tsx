import { notFound } from "next/navigation";
import { Resultado } from "@/components/resultado";
import { loadBoard } from "@/src/data/draws";

export default async function SorteoPage({
  params,
  searchParams,
}: {
  params: Promise<{ sorteo: string }>;
  searchParams: Promise<{ cambiar?: string }>;
}) {
  const { sorteo } = await params;
  const query = await searchParams;
  const numero = Number(sorteo);
  if (!Number.isInteger(numero)) notFound();
  const { draws } = await loadBoard();
  return <Resultado draws={draws} sorteo={numero} cambiarFrase={query.cambiar} />;
}
