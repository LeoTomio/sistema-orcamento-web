import { api } from "../../services/api";
import type { PaginatedResponse } from "../../utils/globalTypes";
import type { Material, MaterialForm } from "./types";

const materialService = {

    async getToBudget(): Promise<Material[]> {
        const response = await api.get("/material/budget");
        return response.data;
    },

    async getAll(page?: number): Promise<PaginatedResponse<MaterialForm>> {
        const response = await api.get("/material", { params: { page } });
        return response.data;
    },

    async create(material: Material): Promise<Material> {
        const { data } = await api.post("/material", material);
        return data;
    },

    async update(material: Material): Promise<Material> {
        const { data } = await api.patch(`/material/${material.id}`, material);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/material/${id}`);
    },
};

export default materialService;