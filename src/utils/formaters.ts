export function formatMoney(value: number): string {
  if (!value) return "0,00";

  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value);
}