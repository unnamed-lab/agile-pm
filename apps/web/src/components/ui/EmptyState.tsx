import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
        {icon ?? <FolderOpen className="w-8 h-8 text-stone-400" />}
      </div>
      <h3 className="text-base font-semibold text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 max-w-xs leading-relaxed">{description}</p>

      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref} className="btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
