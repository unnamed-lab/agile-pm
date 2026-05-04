import Link from 'next/link';
import { Sprout, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
        <Sprout className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-stone-900 mb-3">404</h1>
      <h2 className="text-xl font-semibold text-stone-700 mb-2">Page not found</h2>
      <p className="text-stone-500 max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
