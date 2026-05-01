import { api } from "../../services/api";

const loginService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        return response.data;
    },
};
export default loginService