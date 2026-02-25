import type { PaginatedResponse, PaginationParams } from "../../utils/globalTypes";
import type { Product } from "./ProductType";

let products: Product[] = [
    { id: "1", name: "Horas", price: 150 },
    { id: "2", name: "teste2", price: 150 },
    { id: "3", name: "teste3", price: 150 },
    { id: "4", name: "teste4", price: 150 },
    { id: "5", name: "teste5", price: 150 },
    { id: "6", name: "teste6", price: 150 },
    { id: "7", name: "teste7", price: 150 },
    { id: "8", name: "teste8", price: 150 },
    { id: "9", name: "teste9", price: 150 },
    { id: "10", name: "teste10", price: 150 },
    { id: "11", name: "teste11", price: 150 },
    { id: "12", name: "teste12", price: 150 },
    { id: "13", name: "Candomble babibutemo cromado e engessado", price: 150 },
];



const productService = {
    getAll: async ({ page, limit }: PaginationParams): Promise<PaginatedResponse<Product>> => {

        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedData = products.slice(start, end);

        return {
            data: paginatedData,
            total: products.length,
            page,
            limit
        };
    },

    getToSelect: async (): Promise<Product[]> => {
        return products
    },

    create: async (product: Product) => {
        products.push(product);
    },

    update: async (product: Product) => {
        const index = products.findIndex((p) => p.id === product.id);

        if (index !== -1) {
            products[index] = product;
        }
    },

    delete: async (id: string) => {
        products = products.filter(p => p.id !== id);
    },
};

export default productService;
