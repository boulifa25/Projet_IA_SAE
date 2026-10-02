import { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { candidaturesApi, ApiError, type CandidatureResponse } from '@/lib/api';
import { candidatureStatutConfig } from '@/lib/statusStyles';

export default function CandidaturesEtudiant() {
  const { token } = useAuth();
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    candidaturesApi.mesCandidatures(token)
      .then(setCandidatures)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger vos candidatures.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async (candidature: CandidatureResponse) => {
    if (!token) return;
    setDownloadingId(candidature.id);
    try {
      const blob = await candidaturesApi.getCvBlob(candidature.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError('Impossible de télécharger le CV.');
    } finally {
      setDownloadingId(null);
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
          <p className="text-slate-500 text-sm">Vous n'avez pas encore postulé à une offre.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {candidatures.map((c) => {
            const statut = candidatureStatutConfig[c.statut];
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {c.entrepriseNom.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.offreTitre}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {c.entrepriseNom} · Envoyée le {new Date(c.dateEnvoi).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(c)}
                  disabled={downloadingId === c.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors shrink-0"
                >
                  {downloadingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  CV
                </button>
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
