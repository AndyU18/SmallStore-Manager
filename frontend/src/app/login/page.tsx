'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('admin@smallstore.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/products');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Datos invalidos');
      return;
    }

    try {
      setSubmitting(true);
      await login(parsed.data);
      router.replace('/products');
    } catch {
      setError('Email o contrasena incorrectos');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
            SmallStore Manager
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Inicia sesion para gestionar productos, stock y ventas.
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-300">Contrasena</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn size={18} />
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>

        <div className="rounded-lg bg-white/5 p-3 text-xs text-slate-400">
          Admin de prueba: admin@smallstore.com / admin123
        </div>
      </form>
    </div>
  );
}
