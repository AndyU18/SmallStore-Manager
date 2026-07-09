import { useState, useEffect } from 'react';
import { salesService } from '../services/sales.service';

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
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
    fetchSales();
  }, []);

  return { sales, loading, refetch: fetchSales };
}
