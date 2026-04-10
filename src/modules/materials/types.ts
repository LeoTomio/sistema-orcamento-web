
export interface Material {
  id?: string;
  name: string;
  unit: string;
  price: number;
}

export type MaterialForm = {
  id?: string;
  name: string;
  unit: string
  price: number | string;
};

export const MaterialUnitEnum = {
  METRO: "m",
  METRO_QUADRADO: "m²",
  METRO_CUBICO: "m³",
  CENTIMETRO: "cm",
  MILIMETRO: "mm",
  UNIDADE: "un",
  LITRO: "L",
  QUILOGRAMA: "kg",
  GRAMA: "g",
  ROLO: "rolo",
  CAIXA: "caixa"
}