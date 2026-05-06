import { api } from "../../services/api";
import type { RegisterData } from "./types";

const registerService = {
    register: async (data: RegisterData) => {
        console.log(data)
        const response = await api.post('/user', data);
        return response.data;
    },
};
export default registerService