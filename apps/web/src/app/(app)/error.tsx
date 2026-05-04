'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-stone-500 max-w-xs mb-6">
        An unexpected error occurred. Your data is safe — try refreshing the page.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
