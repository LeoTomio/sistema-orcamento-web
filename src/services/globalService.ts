import axios from "axios";

const globalService = {
    async getStates() {
        const { data } = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
        return data
    },

    async getCities(uf: string) {
        const { data } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        return data
    }
}

export default globalService;

