
export interface Budget {
  id?: string;
  total: number;
  number?: number;
  clientId: string;
  client?: { name: string }
  items: BudgetItem[];
  labor?: number
}
export interface BudgetItem {
  id?: string;
  quantity: number;
  price: number;
  width?: number;
  height?: number;
  name: string;
  productId?: string;
  hasWidth?: boolean;
  hasHeight?: boolean;
  materials?: BudgetItemMaterial[]
}

export interface BudgetItemMaterial {
  id?: string;
  quantity: number;
  calcType: string;
  unitPrice: number;
  total: number;
  materialId: string;
  name: string;
}

export interface BudgetResponse {
  id: string;
  clientId: string;
  total: number;
  number: number;
  items: BudgetItemResponse[];
  labor: number;
}

export interface BudgetItemResponse {
  id: string;
  quantity: number;
  price: number;
  width?: number;
  height?: number;
  product: ProductResponse;

  materials?: {
    id: string;
    calcType: string;
    quantity: number;
    unitPrice: number;
    total: number;
    material: {
      id: string;
      name: string;
      price: number;
    }
  }[];
}

export interface ProductResponse {
  id: string
  name: string;
  hasWidth: boolean;
  hasHeight: boolean;
  materials: ProductMaterialResponse[];
}

export interface ProductMaterialResponse {
  id: string;
  calcType: string;
  quantity: number;
  name: string;
  price: number;
}
