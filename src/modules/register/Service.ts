import { api } from "../../services/api";
import type { RegisterData } from "./types";

const registerService = {
    register: async (data: RegisterData) => {
        const response = await api.post('/user/register', data);
        return response.data;
    },
};
export default registerService