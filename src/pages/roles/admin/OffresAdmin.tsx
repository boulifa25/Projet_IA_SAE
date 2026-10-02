import { useEffect, useState } from 'react';
import { Search, Briefcase, Loader2, AlertCircle, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { offresApi, ApiError, type OffreResponse, type StatutOffre } from '@/lib/api';
import { offreStatutConfig } from '@/lib/statusStyles';

export default function OffresAdmin() {
  const { token } = useAuth();
  const [offres, setOffres] = useState<OffreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutOffre | ''>('');

  useEffect(() => {
    if (!token) return;
    offresApi.toutes(token)
      .then(setOffres)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = offres.filter((o) => {
    const matchSearch = `${o.titre} ${o.entrepriseNom}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !statutFilter || o.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 flex-1 min-w-[220px] focus-within:border-primary-300 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une offre, une entreprise..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value as StatutOffre | '')}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-primary-300"
        >
          <option value="">Tous les statuts</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="PUBLIEE">Publiée</option>
          <option value="CLOTUREE">Clôturée</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune offre ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {filtered.map((offre) => {
            const statut = offreStatutConfig[offre.statut];
            return (
              <div key={offre.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                  {offre.entrepriseNom.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{offre.titre}</p>
                  <p className="text-xs text-slate-400 truncate">{offre.entrepriseNom}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 shrink-0">
                  {offre.lieu && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{offre.lieu}</span>}
                  {offre.dureeMois && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{offre.dureeMois} mois</span>}
                </div>
                <span className="text-xs text-slate-500 shrink-0">{offre.nombreCandidatures} candidature{offre.nombreCandidatures !== 1 ? 's' : ''}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>{statut.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
