import { api } from "../../services/api";
import type { User } from "./types";

const userService = {
    async getUser(): Promise<User> {
        const response = await api.get(`/user/me`);
        return response.data;
    },

    async updateUser(user: User) {
        const response = await api.patch("/user", user);
        return response.data;
    },

    async updateDocument(document: string) {
        console.log(document)
        const response = await api.patch("/user/document", { document });
        return response.data;
    }
};

export default userService;