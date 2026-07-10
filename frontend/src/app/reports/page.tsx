'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { ReportsResponse, reportsService } from '@/services/reports.service';

const formatMoney = (value: number) => `${value.toFixed(2)} Bs`;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIsoDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(monthStartIsoDate);
  const [endDate, setEndDate] = useState(todayIsoDate);
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      setReport(await reportsService.getReport({ startDate, endDate }));
    } catch {
      setError('No se pudo generar el reporte. Verifica el rango de fechas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => report?.salesByDay || [], [report]);

  const exportCsv = () => {
    if (!report) return;

    const rows = [
      ['fecha', 'venta_id', 'estado', 'items', 'total_bs', 'ganancia_bs'],
      ...report.sales.map((sale) => [
        new Date(sale.createdAt).toISOString(),
        sale.id,
        sale.status,
        sale.items.map((item) => `${item.product?.name || item.productId} x${item.quantity}`).join(' | '),
        sale.total.toFixed(2),
        sale.profit.toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${startDate}-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedShell>
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="mt-1 text-sm text-slate-400">
              Ventas, ganancias, productos mas vendidos y bajo stock por rango de fechas.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={!report?.sales.length}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Exportar CSV
          </button>
        </div>

        {error ? <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadReport();
          }}
          className="grid gap-3 rounded-xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[180px_180px_auto]"
        >
          <label className="text-sm text-slate-300">
            Inicio
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </label>
          <label className="text-sm text-slate-300">
            Fin
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </label>
          <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">
            <Filter size={17} />
            Generar
          </button>
        </form>

        {loading ? <div className="rounded-xl border border-white/10 bg-slate-900 p-6 text-slate-400">Generando reporte...</div> : null}

        {report ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Ventas</p>
                <p className="mt-2 text-2xl font-bold">{report.summary.salesCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Subtotal</p>
                <p className="mt-2 text-2xl font-bold">{formatMoney(report.summary.subtotal)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Total vendido</p>
                <p className="mt-2 text-2xl font-bold">{formatMoney(report.summary.total)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Ganancia</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{formatMoney(report.summary.profit)}</p>
              </div>
            </div>

            <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <h2 className="text-lg font-semibold">Ventas por dia</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }} />
                    <Bar dataKey="total" name="Ventas" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="profit" name="Ganancia" fill="#34d399" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900">
                <div className="border-b border-white/10 p-4">
                  <h2 className="text-lg font-semibold">Ventas del rango</h2>
                </div>
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Ganancia</th>
                      <th className="px-4 py-3">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {report.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-3">{new Date(sale.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{sale.items.map((item) => `${item.product?.name} x${item.quantity}`).join(', ')}</td>
                        <td className="px-4 py-3">{formatMoney(sale.total)}</td>
                        <td className="px-4 py-3 text-emerald-300">{formatMoney(sale.profit)}</td>
                        <td className="px-4 py-3">{sale.user?.name || '-'}</td>
                      </tr>
                    ))}
                    {!report.sales.length ? <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin ventas en el rango.</td></tr> : null}
                  </tbody>
                </table>
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <h2 className="text-lg font-semibold">Productos mas vendidos</h2>
                <div className="mt-4 divide-y divide-white/10">
                  {report.topProducts.length ? report.topProducts.map((item) => (
                    <div key={item.product?.id || item.product?.name} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="font-medium">{item.product?.name || 'Producto'}</div>
                        <div className="text-xs text-slate-400">{item.product?.category?.name || 'Sin categoria'}</div>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity} unidades</div>
                        <div className="text-xs text-emerald-300">{formatMoney(item.profit)}</div>
                      </div>
                    </div>
                  )) : <p className="py-6 text-sm text-slate-400">Sin productos vendidos.</p>}
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <h2 className="text-lg font-semibold">Reporte de bajo stock</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {report.lowStockProducts.map((product) => (
                  <div key={product.id} className="rounded-lg border border-red-400/20 bg-red-500/5 p-3">
                    <div className="font-medium">{product.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{product.category?.name || 'Sin categoria'} · {product.sku}</div>
                    <div className="mt-3 text-sm text-red-200">Stock {product.stock} / minimo {product.minStock}</div>
                  </div>
                ))}
                {!report.lowStockProducts.length ? <p className="text-sm text-slate-400">No hay productos con bajo stock.</p> : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </ProtectedShell>
  );
}
