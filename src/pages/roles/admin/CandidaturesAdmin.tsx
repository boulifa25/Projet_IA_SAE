import { useEffect, useState } from 'react';
import { Search, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { candidaturesApi, ApiError, type CandidatureResponse, type StatutCandidature } from '@/lib/api';
import { candidatureStatutConfig } from '@/lib/statusStyles';

export default function CandidaturesAdmin() {
  const { token } = useAuth();
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutCandidature | ''>('');

  useEffect(() => {
    if (!token) return;
    candidaturesApi.toutes(token)
      .then(setCandidatures)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les candidatures.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = candidatures.filter((c) => {
    const matchSearch = `${c.etudiantPrenom} ${c.etudiantNom} ${c.offreTitre} ${c.entrepriseNom}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatut = !statutFilter || c.statut === statutFilter;
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
            placeholder="Rechercher un étudiant, une offre..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value as StatutCandidature | '')}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-primary-300"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_EVALUATION">En évaluation</option>
          <option value="ACCEPTEE">Acceptée</option>
          <option value="REFUSEE">Refusée</option>
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
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune candidature ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {filtered.map((c) => {
            const statut = candidatureStatutConfig[c.statut];
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {c.etudiantPrenom[0]}{c.etudiantNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.etudiantPrenom} {c.etudiantNom}</p>
                  <p className="text-xs text-slate-400 truncate">{c.offreTitre} · {c.entrepriseNom}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{new Date(c.dateEnvoi).toLocaleDateString('fr-FR')}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                  {statut.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
