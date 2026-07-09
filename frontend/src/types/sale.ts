import { User } from './user';
import { Product } from './product';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  purchasePrice: number;
  profit: number;
}

export interface Sale {
  id: string;
  subtotal: number;
  total: number;
  profit: number;
  status: 'COMPLETED' | 'CANCELLED';
  customerId?: string;
  userId: string;
  user?: User;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}
