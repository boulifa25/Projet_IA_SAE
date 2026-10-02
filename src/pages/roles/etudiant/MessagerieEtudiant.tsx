import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { stagesApi, ApiError, type StageResponse } from '@/lib/api';
import StageChat from '@/components/StageChat';

export default function MessagerieEtudiant() {
  const { token } = useAuth();
  const [stage, setStage] = useState<StageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    stagesApi.monStage(token)
      .then(setStage)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          setError(err instanceof ApiError ? err.message : 'Impossible de charger votre stage.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm max-w-sm">
            La messagerie sera disponible une fois votre convention de stage validée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-[70vh]">
        <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
          <p className="text-sm font-semibold text-slate-900">{stage.entrepriseNom}{stage.enseignantNom ? ` · ${stage.enseignantNom}` : ''}</p>
          <p className="text-xs text-slate-400">{stage.sujet}</p>
        </div>
        <div className="flex-1 min-h-0">
          <StageChat stageId={stage.id} />
        </div>
      </div>
    </div>
  );
}
