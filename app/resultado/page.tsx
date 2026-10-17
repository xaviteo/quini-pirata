import { Resultado } from "@/components/resultado";
import { loadBoard } from "@/src/data/draws";

export default async function ResultadoPage() {
  const { draws, last } = await loadBoard();
  return <Resultado draws={draws} sorteo={last.sorteo} />;
}
