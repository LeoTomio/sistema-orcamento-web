export interface BudgetItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Budget {
    id?: string;
    clientId: string;
    client?: { name: string }
    items: BudgetItem[];
    total: number;
}

export interface BudgetItemFromApi {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
    };
}

export interface BudgetFromApi {
    id: string;
    clientId: string;
    total: number;
    items: BudgetItemFromApi[];
}