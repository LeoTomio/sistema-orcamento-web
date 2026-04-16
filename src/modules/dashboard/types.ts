export interface DashBoard {
    budgets: number
    materials: number
    products: number
    clients: number
    finalTotal: number
    laborTotal: number
    productTotal: number
    lastBudgets: LastBudgets[]
}

interface LastBudgets {
    id: string
    total: number
    number: number
    createdAt: string
    client_name: string
}
