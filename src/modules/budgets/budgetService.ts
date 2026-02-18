import type { Budget } from "./BudgetType";

let budgets: Budget[] = [];

const budgetService = {
    getAll: () => budgets,

    create: (budget: Budget) => {
        budgets.push(budget);
    },
};

export default budgetService