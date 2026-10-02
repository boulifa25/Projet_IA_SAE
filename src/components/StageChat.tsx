import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { messagesApi, ApiError, type MessageResponse, type Role } from '@/lib/api';

const roleLabels: Record<Role, string> = {
  ETUDIANT: 'Étudiant',
  ENSEIGNANT: 'Enseignant',
  ENTREPRISE: 'Entreprise',
  ADMINISTRATEUR: 'Administrateur',
};

interface StageChatProps {
  stageId: number;
}

export default function StageChat({ stageId }: StageChatProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contenu, setContenu] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      setMessages(await messagesApi.parStage(stageId, token));
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Impossible de charger les messages.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !contenu.trim()) return;
    setSending(true);
    try {
      await messagesApi.envoyer(stageId, contenu.trim(), token);
      setContenu('');
      await load(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer ce message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 mb-3 mx-4 mt-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Aucun message pour le moment. Lancez la conversation !</p>
        ) : (
          messages.map((m) => {
            const isMine = m.auteurId === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {!isMine && (
                    <p className="text-xs font-semibold mb-0.5 text-slate-500">
                      {m.auteurPrenom} {m.auteurNom} · {roleLabels[m.auteurRole]}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{m.contenu}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-slate-400'}`}>
                    {new Date(m.dateEnvoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
        <input
          type="text"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !contenu.trim()}
          className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
