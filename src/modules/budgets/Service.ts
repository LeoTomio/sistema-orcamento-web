import { api } from "../../services/api";
import type { PaginatedResponse, PaginationParams } from "../../utils/globalTypes";
import type { Budget, BudgetFromApi } from "./types";

const BudgetService = {
    async getById(id: string): Promise<BudgetFromApi> {
        const { data } = await api.get(`/budget/${id}`);
        return data;
    },

    async getAll({ page }: PaginationParams): Promise<PaginatedResponse<Budget>> {
        const response = await api.get('/budget', { params: { page } });
        return response.data
    },
    async create(budget: Budget) {
        const { data } = await api.post('/budget', budget);
        return data
    },
    async update(budget: Budget) {
        const { data } = await api.patch(`/budget/${budget.id}`, budget);
        return data
    },
    async delete(id: string) {
        const { data } = await api.delete(`/budget/${id}`);
        return data
    },

    async generatePdf(id: string) {
        const response = await api.get(`/budget/pdf/${id}`, {
            responseType: "blob"
        });

        return response.data;
    }
};

export default BudgetService