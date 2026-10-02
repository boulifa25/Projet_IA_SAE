import { useEffect, useState } from 'react';
import { Search, Building2, Loader2, AlertCircle, Briefcase, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, ApiError, type EntrepriseAdminResponse } from '@/lib/api';

export default function EntreprisesAdmin() {
  const { token } = useAuth();
  const [entreprises, setEntreprises] = useState<EntrepriseAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    adminApi.entreprises(token)
      .then(setEntreprises)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les entreprises.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = entreprises.filter((e) =>
    `${e.raisonSociale} ${e.secteur ?? ''} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 max-w-md focus-within:border-primary-300 transition-colors">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une entreprise..."
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune entreprise ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                  {e.raisonSociale.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{e.raisonSociale}</p>
                  <p className="text-xs text-slate-400 truncate">{e.secteur || 'Secteur non précisé'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4 truncate">{e.email}</p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
                    <Briefcase className="w-3.5 h-3.5 text-primary-500" />
                    {e.nombreOffresActives}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Offres actives</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
                    <FileText className="w-3.5 h-3.5 text-accent-500" />
                    {e.nombreCandidaturesRecues}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Candidatures</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {e.nombreEmbauches}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Embauches</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
