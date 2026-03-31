import { api } from "../../services/api";
import type { PaginatedResponse } from "../../utils/globalTypes";
import type { Client } from "./types";

const clientService = {
    async getById(id: string): Promise<Client> {
        const { data } = await api.get(`/client/${id}`);
        return data;
    },

    async getAll(page?: number): Promise<PaginatedResponse<Client>> {
        const response = await api.get('/client', { params: { page } });
        return response.data
    },
    async create(client: Client) {
        const { data } = await api.post('/client', client);
        return data
    },
    async update(client: Client) {
        const { data } = await api.patch(`/client/${client.id}`, client);
        return data
    },
    async delete(id: string) {
        const { data } = await api.delete(`/client/${id}`);
        return data
    },
};

export default clientService