import { useEffect, useState } from 'react';
import { Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, ApiError, type EtudiantAdminResponse, type StatutStageAdmin } from '@/lib/api';

const statutConfig: Record<StatutStageAdmin, { label: string; classes: string }> = {
  AUCUN: { label: 'Sans stage', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
  EN_COURS: { label: 'Stage en cours', classes: 'bg-primary-50 text-primary-700 border-primary-200' },
  TERMINE: { label: 'Stage terminé', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function EtudiantsAdmin() {
  const { token } = useAuth();
  const [etudiants, setEtudiants] = useState<EtudiantAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    adminApi.etudiants(token)
      .then(setEtudiants)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les étudiants.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = etudiants.filter((e) =>
    `${e.prenom} ${e.nom} ${e.filiere ?? ''} ${e.email}`.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Rechercher un étudiant..."
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
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucun étudiant ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {filtered.map((e) => {
            const statut = statutConfig[e.statutStage];
            return (
              <div key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {e.prenom[0]}{e.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{e.prenom} {e.nom}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {e.filiere || 'Filière non renseignée'}{e.promotion ? ` · ${e.promotion}` : ''} · {e.matricule || 'Sans matricule'}
                  </p>
                </div>
                {e.entrepriseNom && (
                  <span className="hidden sm:block text-xs text-slate-500 shrink-0">{e.entrepriseNom}</span>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>{statut.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
