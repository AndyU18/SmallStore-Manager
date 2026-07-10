'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types/product';

type CategoryWithCount = Category & { _count?: { products: number } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      setCategories(await categoriesService.getAll());
    } catch {
      setError('No se pudieron cargar las categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await categoriesService.update(editingId, { name, description });
      } else {
        await categoriesService.create({ name, description });
      }
      resetForm();
      await loadCategories();
    } catch {
      setError('No se pudo guardar la categoria. Verifica que el nombre no este duplicado.');
    }
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await categoriesService.delete(id);
      await loadCategories();
    } catch {
      setError('No se puede eliminar una categoria con productos asignados.');
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="mt-1 text-sm text-slate-400">Clasifica productos por linea, rubro o familia.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_2fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            placeholder="Nombre de categoria"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? 'Guardar' : 'Crear'}
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripcion</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Cargando...</td></tr>
              ) : categories.map((category) => (
                <tr key={category.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-slate-300">{category.description || '-'}</td>
                  <td className="px-4 py-3">{category._count?.products ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(category)} className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20">Editar</button>
                      <button onClick={() => handleDelete(category.id)} className="rounded-md bg-red-500/15 px-2 py-1 text-red-200 hover:bg-red-500/25" aria-label="Eliminar categoria">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedShell>
  );
}
