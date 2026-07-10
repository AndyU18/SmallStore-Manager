'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { categoriesService } from '@/services/categories.service';
import { productsService } from '@/services/products.service';
import { Category, Product } from '@/types/product';

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 5,
  categoryId: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsService.getAll({ search: search || undefined, categoryId: categoryId || undefined, lowStock }),
        categoriesService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      if (!form.categoryId && categoriesData[0]) {
        setForm((current) => ({ ...current, categoryId: categoriesData[0].id }));
      }
    } catch {
      setError('No se pudieron cargar los productos');
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
  }, [categoryId, lowStock]);

  const filteredProducts = useMemo(() => products, [products]);

  const updateField = (field: keyof typeof emptyForm, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await productsService.update(editingId, form);
      } else {
        await productsService.create(form);
      }
      resetForm();
      await loadData();
    } catch {
      setError('No se pudo guardar el producto. Revisa SKU, categoria y valores.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId,
    });
  };

  const handleDeactivate = async (id: string) => {
    setError('');
    try {
      await productsService.delete(id);
      await loadData();
    } catch {
      setError('No se pudo desactivar el producto');
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-slate-400">Catalogo con precios, stock y ganancia estimada.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Nombre" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <input required value={form.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="SKU" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <select required value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Descripcion" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <input required type="number" min="0.01" step="0.01" value={form.purchasePrice} onChange={(e) => updateField('purchasePrice', Number(e.target.value))} placeholder="Precio compra" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <input required type="number" min="0.01" step="0.01" value={form.salePrice} onChange={(e) => updateField('salePrice', Number(e.target.value))} placeholder="Precio venta" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <input required type="number" min="0" value={form.stock} onChange={(e) => updateField('stock', Number(e.target.value))} placeholder="Stock" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
            <input required type="number" min="0" value={form.minStock} onChange={(e) => updateField('minStock', Number(e.target.value))} placeholder="Stock minimo" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
          </div>
          <div className="mt-4 flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {editingId ? <button type="button" onClick={resetForm} className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">Cancelar</button> : null}
          </div>
        </form>

        <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_220px_auto_auto]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU" className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400">
            <option value="">Todas las categorias</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm">
            <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
            Bajo stock
          </label>
          <button onClick={loadData} className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">Buscar</button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Compra</th>
                <th className="px-4 py-3">Venta</th>
                <th className="px-4 py-3">Ganancia</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-400">Cargando...</td></tr>
              ) : filteredProducts.map((product) => {
                const isLow = product.stock <= product.minStock;
                return (
                  <tr key={product.id} className={isLow ? 'bg-red-500/5' : 'hover:bg-white/[0.03]'}>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-slate-300">{product.sku}</td>
                    <td className="px-4 py-3">{product.category?.name || '-'}</td>
                    <td className="px-4 py-3">{product.purchasePrice.toFixed(2)} Bs</td>
                    <td className="px-4 py-3">{product.salePrice.toFixed(2)} Bs</td>
                    <td className="px-4 py-3 text-emerald-300">{(product.salePrice - product.purchasePrice).toFixed(2)} Bs</td>
                    <td className="px-4 py-3">
                      <span className={isLow ? 'rounded-full bg-red-500/20 px-2 py-1 text-red-200' : ''}>{product.stock} / min {product.minStock}</span>
                    </td>
                    <td className="px-4 py-3">{product.status ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20">Editar</button>
                        {product.status ? <button onClick={() => handleDeactivate(product.id)} className="rounded-md bg-red-500/15 px-3 py-1 text-red-200 hover:bg-red-500/25">Desactivar</button> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedShell>
  );
}
