import { onlyNumbers } from "./validators";

export function formatMoney(value: number): string {
  if (!value) return "0,00";

  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value);
}

export function formatDocument(value: string) {
  const numbers = onlyNumbers(value).slice(0, 14);

  if (numbers.length <= 11) {
    // CPF
    return numbers
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  // CNPJ
  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  const part1 = numbers.slice(0, 2);
  const part2 = numbers.slice(2, 3);
  const part3 = numbers.slice(3, 7);
  const part4 = numbers.slice(7, 11);

  if (numbers.length <= 2) {
    return `(${part1}`;
  }

  if (numbers.length <= 3) {
    return `(${part1}) ${part2}`;
  }

  if (numbers.length <= 7) {
    return `(${part1}) ${part2} ${part3}`;
  }

  return `(${part1}) ${part2} ${part3}-${part4}`;
}