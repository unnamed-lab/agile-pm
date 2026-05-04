interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ value, max = 100, label, color = 'bg-emerald-500' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label && <span className="text-xs font-medium text-stone-700">{label}</span>}
        <span className="text-xs text-stone-500 ml-auto">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
