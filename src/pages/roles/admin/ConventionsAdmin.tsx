import { useEffect, useState } from 'react';
import { FileCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { conventionsApi, ApiError, type ConventionResponse } from '@/lib/api';

export default function ConventionsAdmin() {
  const { token } = useAuth();
  const [conventions, setConventions] = useState<ConventionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setConventions(await conventionsApi.aValiderAdmin(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les conventions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleValider = async (id: number) => {
    if (!token) return;
    setBusyId(id);
    try {
      await conventionsApi.validerAdmin(id, token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de valider cette convention.');
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

      {conventions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <FileCheck className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune convention en attente de validation administrative.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {conventions.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                {c.etudiantPrenom[0]}{c.etudiantNom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{c.etudiantPrenom} {c.etudiantNom}</p>
                <p className="text-xs text-slate-400 truncate">
                  {c.offreTitre} · {c.entrepriseNom} · Tuteur : {c.enseignantNom}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">{c.reference}</span>
              <button
                onClick={() => handleValider(c.id)}
                disabled={busyId === c.id}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
              >
                {busyId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Valider
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
