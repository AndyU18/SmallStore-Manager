import { useState, useEffect } from 'react';
import { productsService } from '../services/products.service';
import { Product } from '../types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProducts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return { products, loading, refetch: fetchProducts };
}
