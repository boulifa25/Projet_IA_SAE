import { useEffect, useState } from 'react';
import { Briefcase, FileText, GraduationCap, Building2, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, offresApi, ApiError, type DashboardStatsResponse, type OffreResponse } from '@/lib/api';

export default function DashboardAdmin() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [offres, setOffres] = useState<OffreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([adminApi.stats(token), offresApi.toutes(token)])
      .then(([statsData, offresData]) => {
        setStats(statsData);
        setOffres(offresData);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const cards = stats ? [
    { label: 'Offres actives', value: stats.offresActives, icon: Briefcase, color: 'primary' },
    { label: 'Candidatures', value: stats.candidaturesTotal, icon: FileText, color: 'accent' },
    { label: 'Étudiants placés', value: stats.etudiantsPlaces, icon: GraduationCap, color: 'emerald' },
    { label: 'Entreprises partenaires', value: stats.entreprisesPartenaires, icon: Building2, color: 'amber' },
  ] : [];

  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'ring-accent-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  };

  const topOffres = [...offres].sort((a, b) => b.nombreCandidatures - a.nombreCandidatures).slice(0, 4);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-400/20 rounded-full translate-y-1/2 blur-2xl" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">Bonjour, {user?.prenom} 👋</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">Vue d'ensemble de la plateforme</h2>
          <p className="text-primary-100 text-sm max-w-lg">
            Voici l'activité en temps réel de toutes les offres, candidatures et stages en cours.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-soft transition-all duration-300 group">
              <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300 mb-4`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-slate-900">Offres les plus populaires</h3>
            <p className="text-xs text-slate-400 mt-0.5">Classées par nombre de candidatures reçues</p>
          </div>
        </div>
        {topOffres.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Aucune offre pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            {topOffres.map((offre) => (
              <div key={offre.id} className="rounded-xl border border-slate-200 p-4 hover:border-primary-200 hover:shadow-soft transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700">
                    {offre.entrepriseNom.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{offre.entrepriseNom}</p>
                    <p className="text-xs text-slate-400">{offre.lieu}</p>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[2.5rem]">{offre.titre}</h4>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {offre.nombreCandidatures} candidature{offre.nombreCandidatures !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
