export function isValidDocument(value: string) {
    const numbers = onlyNumbers(value);

    if (numbers.length === 11) {
        return isValidCPF(numbers);
    }

    if (numbers.length === 14) {
        return isValidCNPJ(numbers);
    }

    return false;
}

export function onlyNumbers(value: string) {
    return value.replace(/\D/g, "");
}

export function isValidCPF(value: string) {
    const cpf = value.replace(/\D/g, "");

    if (cpf.length !== 11) return false;

    // Bloqueia sequências tipo 00000000000
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += Number(cpf[i]) * (10 - i);
    }

    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10) firstDigit = 0;

    if (firstDigit !== Number(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += Number(cpf[i]) * (11 - i);
    }

    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10) secondDigit = 0;

    return secondDigit === Number(cpf[10]);
}

export function isValidCNPJ(value: string) {
    const cnpj = value.replace(/\D/g, "");

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1+$/.test(cnpj)) return false;

    const calculateDigit = (length: number) => {
        let sum = 0;
        let weight = length - 7;

        for (let i = 0; i < length; i++) {
            sum += Number(cnpj[i]) * weight--;
            if (weight < 2) weight = 9;
        }

        const result = sum % 11;
        return result < 2 ? 0 : 11 - result;
    };

    const firstDigit = calculateDigit(12);
    const secondDigit = calculateDigit(13);

    return (
        firstDigit === Number(cnpj[12]) &&
        secondDigit === Number(cnpj[13])
    );
}

export function isValidPhone(phone: string) {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 11;
}