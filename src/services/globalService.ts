import axios from "axios";

const globalService = {
    async getStates() {
        const { data } = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
        return data
    },

    async getCities(uf: string) {
        const { data } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        return data
    },

    async getAddressByPostalCode(postalCode: string) {
        const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`);
        const data = await response.json();
        if (data.erro) {
            throw new Error("CEP não encontrado");
        }
        return data;
    }
}


export default globalService;

