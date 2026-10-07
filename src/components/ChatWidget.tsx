import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { chatbotApi, ApiError, type ChatMessage } from '@/lib/api';

export default function ChatWidget() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !token || sending) return;

    const historique = messages;
    setMessages((m) => [...m, { role: 'user', contenu: question }]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const { reponse } = await chatbotApi.envoyer(question, historique, token);
      setMessages((m) => [...m, { role: 'model', contenu: reponse }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de contacter l'assistant.");
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-primary-600 to-accent-500 text-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-display font-bold text-sm">Assistant StageIO</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-primary-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Posez-moi vos questions sur vos candidatures, votre convention, votre stage, ou le fonctionnement de la plateforme.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.contenu}</p>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            {error && <p className="text-xs text-rose-600 text-center">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Assistant StageIO"
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </button>
    </>,
    document.body
  );
}
