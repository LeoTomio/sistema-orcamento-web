

export interface BudgetItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Budget {
    id?: string;
    clientName: string;
    items: BudgetItem[];
    total: number;
}
