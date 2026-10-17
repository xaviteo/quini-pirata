import { Resultado } from "@/components/resultado";
import { loadBoard } from "@/src/data/draws";

export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ cambiar?: string }> }) {
  const params = await searchParams;
  const { draws, last } = await loadBoard();
  return <Resultado draws={draws} sorteo={last.sorteo} cambiarFrase={params.cambiar} />;
}
