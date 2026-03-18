export interface Product {
  id?: string;
  name: string;
  price: number;
}

export type ProductForm = {
  id?: string;
  name: string;
  price: string | number;
};