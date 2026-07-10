'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, FileText, LogOut, Package, Tags, ShoppingCart, Boxes } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/sales', label: 'Ventas', icon: ShoppingCart },
  { href: '/stock', label: 'Stock', icon: Boxes },
  { href: '/reports', label: 'Reportes', icon: FileText },
];

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-sm text-slate-300">Validando sesion...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-900/95 p-5 md:flex md:flex-col">
        <Link href="/products" className="text-xl font-bold tracking-tight">
          SmallStore
        </Link>
        <p className="mt-1 text-xs text-slate-400">{user.name} · {user.role}</p>
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  active ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </aside>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold">SmallStore</span>
          <button onClick={handleLogout} className="text-sm text-slate-300">Salir</button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md bg-white/10 px-3 py-1 text-xs">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="md:pl-64">{children}</main>
    </div>
  );
}
