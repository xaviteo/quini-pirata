import { loadBoard } from "@/src/data/draws";

export async function GET() {
  const { draws, last } = await loadBoard();
  return Response.json({
    ok: true,
    sorteos: draws.length,
    ultimo: { sorteo: last.sorteo, fecha: last.fecha },
  });
}
