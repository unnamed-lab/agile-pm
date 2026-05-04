'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
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
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Something went wrong</h1>
      <p className="text-stone-500 max-w-sm mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}
