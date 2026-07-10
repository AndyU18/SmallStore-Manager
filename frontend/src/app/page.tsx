'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  ShoppingCart, 
  TrendingUp, 
  ClipboardList, 
  LogIn 
} from 'lucide-react';

export default function Home() {
  const modules = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Métricas de ventas, ganancias y alertas' },
    { name: 'Productos', path: '/products', icon: ShoppingBag, desc: 'Gestión de catálogo, precios y existencias' },
    { name: 'Categorías', path: '/categories', icon: Tag, desc: 'Organización de productos de la tienda' },
    { name: 'Ventas (POS)', path: '/sales', icon: ShoppingCart, desc: 'Registro de ventas y cálculo de utilidad' },
    { name: 'Inventario (Stock)', path: '/stock', icon: ClipboardList, desc: 'Movimientos, entradas y salidas de stock' },
    { name: 'Reportes', path: '/reports', icon: TrendingUp, desc: 'Reportes de ventas y ganancias avanzadas' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur bg-slate-900/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wide bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SmallStore Manager
            </span>
          </div>
          <Link 
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all rounded-lg font-medium text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Main Hero & Navigation Portal */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center gap-12 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-full text-xs font-semibold uppercase tracking-wider">
            Portal de Control
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-b from-white to-slate-300 bg-clip-text text-transparent leading-none">
            Gestiona tu tienda con precisión profesional
          </h1>
          <p className="text-slate-400 text-lg">
            Sistema de inventario, registro de ventas, cálculo de utilidades y reportes financieros integrados.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link 
                key={mod.name} 
                href={mod.path}
                className="group p-6 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/40 group-hover:bg-indigo-600/10 rounded-lg w-fit transition-colors duration-300">
                    <Icon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-white transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Acceder al módulo &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/60 text-slate-500 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} SmallStore Manager. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
