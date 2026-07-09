'use client';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          SmallStore Manager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Inicia sesión en tu cuenta
        </p>
        <div className="mt-8 space-y-6">
          <p className="text-sm text-center text-gray-500 animate-pulse">Página de Login (Esqueleto)</p>
        </div>
      </div>
    </div>
  );
}
