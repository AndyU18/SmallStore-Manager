'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { productsService } from '@/services/products.service';
import { stockService } from '@/services/stock.service';
import { Product } from '@/types/product';

type Movement = {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  product?: Product;
  user?: { name: string; email: string };
};

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Reposicion manual');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, movementsData] = await Promise.all([
        productsService.getAll(),
        stockService.getAll({ type: filterType || undefined }),
      ]);
      setProducts(productsData);
      setMovements(movementsData);
      if (!productId && productsData[0]) {
        setProductId(productsData[0].id);
      }
    } catch {
      setError('No se pudo cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleAdjust = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await stockService.adjust({ productId, type, quantity, reason });
      await loadData();
    } catch {
      setError('No se pudo registrar el ajuste. Verifica stock disponible y motivo.');
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de stock</h1>
          <p className="mt-1 text-sm text-slate-400">Auditoria de entradas, salidas, ajustes y devoluciones.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <form onSubmit={handleAdjust} className="grid gap-3 rounded-xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_160px_120px_1fr_auto]">
          <select value={productId} onChange={(e) => setProductId(e.target.value)} required className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400">
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stock {product.stock}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400">
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
            <option value="ADJUSTMENT">Ajuste</option>
            <option value="RETURN">Devolucion</option>
          </select>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} required placeholder="Motivo" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
          <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">Registrar</button>
        </form>

        <div className="flex justify-end">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-400">
            <option value="">Todos los tipos</option>
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
            <option value="ADJUSTMENT">Ajuste</option>
            <option value="RETURN">Devolucion</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Anterior</th>
                <th className="px-4 py-3">Nuevo</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton columns={8} />
              ) : movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">{new Date(movement.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{movement.type}</td>
                  <td className="px-4 py-3 font-medium">{movement.product?.name || '-'}</td>
                  <td className="px-4 py-3">{movement.quantity}</td>
                  <td className="px-4 py-3">{movement.previousStock}</td>
                  <td className="px-4 py-3">{movement.newStock}</td>
                  <td className="px-4 py-3 text-slate-300">{movement.reason}</td>
                  <td className="px-4 py-3">{movement.user?.name || movement.user?.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedShell>
  );
}
