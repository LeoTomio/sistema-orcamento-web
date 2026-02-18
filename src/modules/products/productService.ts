import type { Product } from "./ProductType";

let products: Product[] = [];

const productService = {
    getAll: () => products,

    create: (product: Product) => {
        products.push(product);
    },

    delete: (id: string) => {
        products = products.filter(p => p.id !== id);
    },
};

export default productService