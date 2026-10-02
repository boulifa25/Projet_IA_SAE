import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  sprint: string;
  to?: string;
}

interface RoleDashboardProps {
  tagline: string;
  description: string;
  features: Feature[];
}

export default function RoleDashboard({ tagline, description, features }: RoleDashboardProps) {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-400/20 rounded-full translate-y-1/2 blur-2xl" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">Bonjour, {user?.prenom} 👋</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">{tagline}</h2>
          <p className="text-primary-100 text-sm max-w-lg">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const content = (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{feature.description}</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  feature.to ? 'text-emerald-700 bg-emerald-50' : 'text-primary-600 bg-primary-50'
                }`}
              >
                {feature.to ? 'Disponible' : feature.sprint}
              </span>
            </>
          );

          const className = 'bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-soft transition-all duration-300 block';

          return feature.to ? (
            <Link key={feature.title} to={feature.to} className={`${className} hover:border-primary-200`}>
              {content}
            </Link>
          ) : (
            <div key={feature.title} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
