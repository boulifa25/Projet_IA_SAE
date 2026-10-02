import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Clock, Briefcase, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { offresApi, candidaturesApi, ApiError, type OffreResponse, type OffreMatchingResultat } from '@/lib/api';
import PostulerWizard from './PostulerWizard';

export default function OffresEtudiant() {
  const { token } = useAuth();
  const [offres, setOffres] = useState<OffreResponse[]>([]);
  const [candidatures, setCandidatures] = useState<Set<number>>(new Set());
  const [matching, setMatching] = useState<Map<number, OffreMatchingResultat>>(new Map());
  const [matchingLoading, setMatchingLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');
  const [lieuFilter, setLieuFilter] = useState('');

  const [selectedOffre, setSelectedOffre] = useState<OffreResponse | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [offresData, candidaturesData] = await Promise.all([
        offresApi.list(token),
        candidaturesApi.mesCandidatures(token),
      ]);
      setOffres(offresData);
      setCandidatures(new Set(candidaturesData.map((c) => c.offreId)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les offres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setMatchingLoading(true);
    offresApi.matching(token)
      .then((results) => setMatching(new Map(results.map((r) => [r.offreId, r]))))
      .catch(() => setMatching(new Map())) // Le matching IA est un bonus : une erreur ne doit pas bloquer la page.
      .finally(() => setMatchingLoading(false));
  }, [token]);

  const filieres = useMemo(
    () => Array.from(new Set(offres.map((o) => o.filiere).filter((v): v is string => !!v))),
    [offres]
  );
  const lieux = useMemo(
    () => Array.from(new Set(offres.map((o) => o.lieu).filter((v): v is string => !!v))),
    [offres]
  );

  const filteredOffres = offres
    .filter((offre) => {
      const matchSearch = offre.titre.toLowerCase().includes(search.toLowerCase()) ||
        offre.entrepriseNom.toLowerCase().includes(search.toLowerCase());
      const matchFiliere = !filiereFilter || offre.filiere === filiereFilter;
      const matchLieu = !lieuFilter || offre.lieu === lieuFilter;
      return matchSearch && matchFiliere && matchLieu;
    })
    .sort((a, b) => (matching.get(b.id)?.score ?? -1) - (matching.get(a.id)?.score ?? -1));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Filters */}
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
          value={filiereFilter}
          onChange={(e) => setFiliereFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-primary-300"
        >
          <option value="">Toutes les filières</option>
          {filieres.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          value={lieuFilter}
          onChange={(e) => setLieuFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-primary-300"
        >
          <option value="">Tous les lieux</option>
          {lieux.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : filteredOffres.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune offre ne correspond à votre recherche pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffres.map((offre) => {
            const dejaPostule = candidatures.has(offre.id);
            const score = matching.get(offre.id)?.score;
            const raison = matching.get(offre.id)?.raison;
            const scoreClasses = score === undefined
              ? ''
              : score >= 70
                ? 'bg-emerald-50 text-emerald-700'
                : score >= 40
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-500';
            return (
              <div key={offre.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-soft transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                      {offre.entrepriseNom.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{offre.entrepriseNom}</p>
                      {offre.lieu && <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{offre.lieu}</p>}
                    </div>
                  </div>
                  {matchingLoading ? (
                    <Loader2 className="w-4 h-4 text-slate-300 animate-spin shrink-0" />
                  ) : score !== undefined ? (
                    <span
                      title={raison}
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${scoreClasses}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {score}%
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">{offre.titre}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{offre.description}</p>
                {offre.competencesRequises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {offre.competencesRequises.slice(0, 3).map((c) => (
                      <span key={c} className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">{c}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {offre.dureeMois && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {offre.dureeMois} mois
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedOffre(offre)}
                    disabled={dejaPostule}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      dejaPostule
                        ? 'bg-emerald-50 text-emerald-700 cursor-default'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {dejaPostule ? 'Déjà postulé' : 'Postuler'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOffre && (
        <PostulerWizard
          offre={selectedOffre}
          onClose={() => setSelectedOffre(null)}
          onSuccess={() => {
            setSelectedOffre(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
