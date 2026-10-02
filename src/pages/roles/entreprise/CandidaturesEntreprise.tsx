import { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, Download, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { candidaturesApi, ApiError, type CandidatureResponse } from '@/lib/api';
import { candidatureStatutConfig } from '@/lib/statusStyles';

export default function CandidaturesEntreprise() {
  const { token } = useAuth();
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setCandidatures(await candidaturesApi.recues(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les candidatures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDownload = async (candidature: CandidatureResponse) => {
    if (!token) return;
    setBusyId(candidature.id);
    try {
      const blob = await candidaturesApi.getCvBlob(candidature.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError('Impossible de télécharger le CV.');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatut = async (id: number, statut: 'ACCEPTEE' | 'REFUSEE') => {
    if (!token) return;
    setBusyId(id);
    try {
      await candidaturesApi.changerStatut(id, statut, token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de mettre à jour cette candidature.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {candidatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune candidature reçue pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {candidatures.map((c) => {
            const statut = candidatureStatutConfig[c.statut];
            const busy = busyId === c.id;
            const enAttente = c.statut === 'EN_ATTENTE' || c.statut === 'EN_EVALUATION';
            return (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                  {c.etudiantPrenom[0]}{c.etudiantNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.etudiantPrenom} {c.etudiantNom}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {c.offreTitre} · {new Date(c.dateEnvoi).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.lettreMotivation}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(c)}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CV
                  </button>
                  {enAttente && (
                    <>
                      <button
                        onClick={() => handleStatut(c.id, 'ACCEPTEE')}
                        disabled={busy}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatut(c.id, 'REFUSEE')}
                        disabled={busy}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                        Refuser
                      </button>
                    </>
                  )}
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${statut.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                    {statut.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
