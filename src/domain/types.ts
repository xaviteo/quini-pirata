export type Draw = {
  sorteo: number;
  fecha: string;
  tradicional: number[];
  segunda: number[];
  revancha: number[];
  siempreSale: number[];
  fuente?: string;
};

export type RecipeId = "casa" | "atraso" | "franja" | "azar";

export const UNIVERSE = 46;
export const PICK = 6;
export const COMBINATIONS = 9_366_819;

export type Modality = "tradicional" | "segunda" | "revancha" | "siempreSale";
