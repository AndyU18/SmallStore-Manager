'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { productsService } from '@/services/products.service';
import { salesService } from '@/services/sales.service';
import { Product } from '@/types/product';
import { Sale } from '@/types/sale';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, salesData] = await Promise.all([
        productsService.getAll(),
        salesService.getAll(),
      ]);
      setProducts(productsData.filter((product: Product) => product.status));
      setSales(salesData);
    } catch {
      setError('No se pudieron cargar ventas y productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleProducts = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return products;
    return products.filter((product) =>
      `${product.name} ${product.sku}`.toLowerCase().includes(text),
    );
  }, [products, query]);

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        acc.total += item.product.salePrice * item.quantity;
        acc.profit += (item.product.salePrice - item.product.purchasePrice) * item.quantity;
        return acc;
      },
      { total: 0, profit: 0 },
    );
  }, [cart]);

  const addProduct = (product: Product) => {
    setError('');
    if (product.stock <= 0) {
      setError('Producto sin stock disponible');
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setError('No hay mas stock disponible para ese producto');
          return current;
        }
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.product.id !== productId) return [item];
        if (quantity <= 0) return [];
        return [{ ...item, quantity: Math.min(quantity, item.product.stock) }];
      }),
    );
  };

  const handleCreateSale = async () => {
    setError('');
    if (!cart.length) {
      setError('Agrega productos al carrito');
      return;
    }

    try {
      await salesService.create({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      setCart([]);
      await loadData();
    } catch {
      setError('No se pudo registrar la venta. Verifica el stock disponible.');
    }
  };

  const handleCancel = async (id: string) => {
    setError('');
    try {
      await salesService.cancel(id);
      await loadData();
    } catch {
      setError('No se pudo anular la venta');
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ventas POS</h1>
          <p className="mt-1 text-sm text-slate-400">Registra ventas con descuento automatico de stock y utilidad real.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
            <div className="mb-4 flex items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar producto por nombre o SKU"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="rounded-lg border border-white/10 bg-slate-950 p-3 text-left transition hover:border-cyan-400"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{product.sku}</div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>{product.salePrice.toFixed(2)} Bs</span>
                    <span className={product.stock <= product.minStock ? 'text-red-300' : 'text-slate-300'}>Stock {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-xl border border-white/10 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Carrito</h2>
            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <p className="rounded-lg bg-white/5 p-4 text-sm text-slate-400">Selecciona productos para iniciar una venta.</p>
              ) : cart.map((item) => (
                <div key={item.product.id} className="rounded-lg bg-slate-950 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-slate-400">{item.product.salePrice.toFixed(2)} Bs x unidad</div>
                    </div>
                    <div className="text-right font-semibold">{(item.product.salePrice * item.quantity).toFixed(2)} Bs</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="rounded-md bg-white/10 px-3 py-1">-</button>
                    <input
                      type="number"
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                      className="w-20 rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-center"
                    />
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="rounded-md bg-white/10 px-3 py-1">+</button>
                    <span className="text-xs text-slate-400">Max {item.product.stock}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{totals.total.toFixed(2)} Bs</span></div>
              <div className="flex justify-between text-emerald-300"><span>Ganancia estimada</span><span>{totals.profit.toFixed(2)} Bs</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{totals.total.toFixed(2)} Bs</span></div>
            </div>

            <button onClick={handleCreateSale} disabled={!cart.length} className="mt-5 w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
              Registrar venta
            </button>
          </aside>
        </div>

        <section className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Ganancia</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Cargando...</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className={sale.status === 'CANCELLED' ? 'bg-red-500/5 text-slate-400' : 'hover:bg-white/[0.03]'}>
                  <td className="px-4 py-3">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{sale.status}</td>
                  <td className="px-4 py-3">{sale.items.map((item) => `${item.product?.name} x${item.quantity}`).join(', ')}</td>
                  <td className="px-4 py-3">{sale.total.toFixed(2)} Bs</td>
                  <td className="px-4 py-3 text-emerald-300">{sale.profit.toFixed(2)} Bs</td>
                  <td className="px-4 py-3">{sale.user?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {sale.status !== 'CANCELLED' ? (
                      <button onClick={() => handleCancel(sale.id)} className="rounded-md bg-red-500/15 px-3 py-1 text-red-200 hover:bg-red-500/25">Anular</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </ProtectedShell>
  );
}
