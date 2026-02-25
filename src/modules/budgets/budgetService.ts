import type { PaginatedResponse, PaginationParams } from "../../utils/globalTypes";
import type { Budget } from "./BudgetType";

let budgets: Budget[] = [
    {
        id: "1",
        clientName: "Cliente 1",
        items: [
            { productId: "1", name: "teste2", price: 150, quantity: 2 }
        ],
        total: 300
    },
];

const budgetService = {

    getAll: async ({ page, limit }: PaginationParams): Promise<PaginatedResponse<Budget>> => {
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedData = budgets.slice(start, end);

        return {
            data: paginatedData,
            total: budgets.length,
            page,
            limit
        };
    },

    create: (budget: Budget) => {
        budgets.push(budget);
    },

    update: async (budget: Budget) => {
        const index = budgets.findIndex((p) => p.id === budget.id);

        if (index !== -1) {
            budgets[index] = budget;
        }
    },

    delete: async (id: string) => {
        budgets = budgets.filter((b) => b.id !== id);
    },
};

export default budgetService