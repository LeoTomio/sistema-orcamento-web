export interface MaterialItem {
  id?: string;
  materialId: string;
  quantity: number;
  calc_type: "AREA" | "PERIMETER" | "HEIGHT" | "WIDTH" | "FIXED";
  _delete?: boolean
}

export interface ProductForm {
  id?: string;
  name: string;
  hasHeight: boolean;
  hasWidth: boolean;
  materials: MaterialItem[];

}

export interface Product extends ProductForm {
  price: number;
}



export interface ProductResponse {
  id: string;
  name: string;
  hasWidth: boolean;
  hasHeight: boolean;
  price: number;
  materials: {
    id: string;
    calcType: string;
    quantity: number;
    name: string;
    price: number;
  }[];
}