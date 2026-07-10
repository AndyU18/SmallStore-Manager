'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { DashboardStats, dashboardService } from '@/services/dashboard.service';

const formatMoney = (value: number) => `${value.toFixed(2)} Bs`;

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = 'cyan',
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof DollarSign;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
}) {
  const colors = {
    cyan: 'bg-cyan-400/15 text-cyan-200',
    emerald: 'bg-emerald-400/15 text-emerald-200',
    amber: 'bg-amber-400/15 text-amber-200',
    rose: 'bg-rose-400/15 text-rose-200',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-lg p-2 ${colors[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await dashboardService.getStats());
    } catch {
      setError('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const topProductsChart = useMemo(
    () =>
      stats?.topProducts.map((item) => ({
        name: item.product?.name || 'Producto',
        cantidad: item.quantity,
        ganancia: item.profit,
      })) || [],
    [stats],
  );

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              KPIs de ventas, utilidad, productos activos y alertas de inventario.
            </p>
          </div>
          <button onClick={loadStats} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
            Actualizar
          </button>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        {loading ? <div className="rounded-xl border border-white/10 bg-slate-900 p-6 text-slate-400">Cargando metricas...</div> : null}

        {stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="Ventas del dia" value={formatMoney(stats.todaySales)} helper={`${stats.todaySalesCount} ventas completadas`} icon={ShoppingCart} />
              <KpiCard title="Ganancia del dia" value={formatMoney(stats.todayProfit)} helper="Ventas anuladas excluidas" icon={TrendingUp} tone="emerald" />
              <KpiCard title="Ventas del mes" value={formatMoney(stats.monthlySales)} helper={`${stats.monthlySalesCount} ventas del mes`} icon={DollarSign} tone="cyan" />
              <KpiCard title="Ganancia del mes" value={formatMoney(stats.monthlyProfit)} helper="Utilidad neta estimada" icon={TrendingUp} tone="emerald" />
              <KpiCard title="Productos activos" value={String(stats.activeProducts)} helper="Catalogo disponible para venta" icon={PackageCheck} tone="amber" />
              <KpiCard title="Bajo stock" value={String(stats.lowStockProducts)} helper="stock actual <= stock minimo" icon={AlertTriangle} tone={stats.lowStockProducts ? 'rose' : 'emerald'} />
              <KpiCard title="Items recientes" value={String(stats.recentSales.length)} helper="Ultimas ventas completadas" icon={Boxes} tone="cyan" />
              <KpiCard title="Top productos" value={String(stats.topProducts.length)} helper="Ranking por unidades vendidas" icon={PackageCheck} tone="amber" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <h2 className="text-lg font-semibold">Ventas ultimos 7 dias</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.salesLast7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }} />
                      <Area type="monotone" dataKey="total" name="Ventas" stroke="#22d3ee" fill="#22d3ee33" />
                      <Area type="monotone" dataKey="profit" name="Ganancia" stroke="#34d399" fill="#34d39922" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <h2 className="text-lg font-semibold">Productos mas vendidos</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={110} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }} />
                      <Bar dataKey="cantidad" name="Unidades" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <h2 className="text-lg font-semibold">Alertas de bajo stock</h2>
                <div className="mt-4 divide-y divide-white/10">
                  {stats.lowStockItems.length ? stats.lowStockItems.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-slate-400">{product.category?.name || 'Sin categoria'} · SKU {product.sku}</div>
                      </div>
                      <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-200">
                        {product.stock} / min {product.minStock}
                      </span>
                    </div>
                  )) : <p className="py-6 text-sm text-slate-400">Sin alertas de bajo stock.</p>}
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <h2 className="text-lg font-semibold">Ventas recientes</h2>
                <div className="mt-4 divide-y divide-white/10">
                  {stats.recentSales.length ? stats.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="font-medium">{new Date(sale.createdAt).toLocaleString()}</div>
                        <div className="text-xs text-slate-400">{sale.items.length} items · {sale.user?.name || 'Usuario'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatMoney(sale.total)}</div>
                        <div className="text-xs text-emerald-300">+{formatMoney(sale.profit)}</div>
                      </div>
                    </div>
                  )) : <p className="py-6 text-sm text-slate-400">Sin ventas recientes.</p>}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </ProtectedShell>
  );
}
