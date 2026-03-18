import { api } from "../../services/api";
import type { PaginatedResponse } from "../../utils/globalTypes";
import type { Product, ProductForm } from "./types";

const productService = {
    async getAll(page?: number): Promise<PaginatedResponse<ProductForm>> {
        const response = await api.get("/product", { params: { page } });

        return response.data;
    },

    async create(product: Product): Promise<Product> {
        const { data } = await api.post("/product", product);
        return data;
    },

    async update(product: Product): Promise<Product> {
        const { data } = await api.patch(`/product/${product.id}`, product);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/product/${id}`);
    },
};

export default productService;