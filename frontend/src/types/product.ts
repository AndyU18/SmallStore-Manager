export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}
