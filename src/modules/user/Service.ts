import { api } from "../../services/api";

const userService = {
    async getUser() {
        const response = await api.get(`/user/me`);
        return response.data;
    },

    async updateUser(user: any) {
        const response = await api.patch("/user", user);
        return response.data;
    },

    async updateSignature(signature: string) {
        const response = await api.patch(`/user/subscribe`, {
            signature,
        });

        return response.data;
    },
};

export default userService;