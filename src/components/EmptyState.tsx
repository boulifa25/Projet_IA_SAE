import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  sprint: string;
}

export default function EmptyState({ icon: Icon, title, description, sprint }: EmptyStateProps) {
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <h3 className="font-display font-bold text-slate-900 text-lg mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 max-w-sm">{description}</p>
        <span className="mt-4 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
          {sprint}
        </span>
      </div>
    </div>
  );
}
