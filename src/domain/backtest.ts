import { prepareDraw, recipeTicket } from "./house";
import { hits } from "./prizes";
import type { Draw, RecipeId } from "./types";

export type BacktestRow = {
  id: RecipeId;
  label: string;
  draws: number;
  avgHitsTradicional: number;
  prizesOfFour: number;
  sixes: number;
};

const RECIPES: { id: RecipeId; label: string }[] = [
  { id: "azar", label: "Azar" },
  { id: "franja", label: "Solo franja" },
  { id: "atraso", label: "Atrasos" },
  { id: "casa", label: "Casa" },
];

/** Aciertos contra Tradicional. El esperado de cualquier boleta es 6 × 6/46 ≈ 0,78. */
export function backtest(draws: Draw[], fromIndex = 80): BacktestRow[] {
  const totals = RECIPES.map(() => ({ hits: 0, prizes: 0, sixes: 0, count: 0 }));

  for (let i = fromIndex; i < draws.length; i++) {
    const history = draws.slice(0, i);
    const prepared = prepareDraw(history);
    const draw = draws[i];
    RECIPES.forEach((recipe, index) => {
      const ticket = recipeTicket(history, draw.sorteo, recipe.id, prepared);
      const tradicional = hits(ticket, draw.tradicional);
      const segunda = hits(ticket, draw.segunda);
      const row = totals[index];
      row.hits += tradicional;
      row.count += 1;
      if (tradicional >= 4) row.prizes += 1;
      if (segunda >= 4) row.prizes += 1;
      if (tradicional === 6) row.sixes += 1;
    });
  }

  return RECIPES.map((recipe, index) => {
    const row = totals[index];
    return {
      id: recipe.id,
      label: recipe.label,
      draws: row.count,
      avgHitsTradicional: row.count === 0 ? 0 : row.hits / row.count,
      prizesOfFour: row.prizes,
      sixes: row.sixes,
    };
  });
}
