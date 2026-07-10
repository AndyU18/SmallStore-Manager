import { useState, useEffect } from 'react';
import { salesService } from '../services/sales.service';
import { Sale } from '../types/sale';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await salesService.getAll();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSales();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return { sales, loading, refetch: fetchSales };
}
