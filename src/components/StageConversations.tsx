import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, type StageResponse } from '@/lib/api';
import StageChat from '@/components/StageChat';

interface StageConversationsProps {
  loadStages: (token: string) => Promise<StageResponse[]>;
}

export default function StageConversations({ loadStages }: StageConversationsProps) {
  const { token } = useAuth();
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [selected, setSelected] = useState<StageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadStages(token)
      .then((data) => {
        setStages(data);
        setSelected((current) => current ?? data[0] ?? null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les conversations.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (stages.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucune conversation pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex gap-4 h-[70vh]">
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 overflow-y-auto scrollbar-thin">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelected(stage)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 text-left transition-colors ${
                selected?.id === stage.id ? 'bg-primary-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                {stage.etudiantPrenom[0]}{stage.etudiantNom[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{stage.etudiantPrenom} {stage.etudiantNom}</p>
                <p className="text-xs text-slate-400 truncate">{stage.entrepriseNom}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {selected && <StageChat key={selected.id} stageId={selected.id} />}
        </div>
      </div>
    </div>
  );
}
