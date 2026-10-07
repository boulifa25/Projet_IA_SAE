import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, MessageSquare, FileText, FileCheck, ClipboardCheck, Award, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, type NotificationResponse, type TypeNotification } from '@/lib/api';

const POLL_INTERVAL_MS = 20_000;

const iconParType: Record<TypeNotification, typeof Briefcase> = {
  OFFRE: Briefcase,
  MESSAGE: MessageSquare,
  CANDIDATURE: FileText,
  CONVENTION: FileCheck,
  SOUTENANCE: ClipboardCheck,
  EVALUATION: Award,
};

function formatRelatif(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;
  return new Date(dateIso).toLocaleDateString('fr-FR');
}

export default function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!token) return;
    notificationsApi.lister(token).then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nonLues = notifications.filter((n) => !n.lu).length;

  const handleClickNotification = async (n: NotificationResponse) => {
    if (!token) return;
    if (!n.lu) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
      notificationsApi.marquerLue(n.id, token).catch(() => {});
    }
    setOpen(false);
    if (n.lien) navigate(n.lien);
  };

  const handleMarquerTout = async () => {
    if (!token || nonLues === 0) return;
    setNotifications((prev) => prev.map((x) => ({ ...x, lu: true })));
    try {
      await notificationsApi.marquerToutesLues(token);
    } catch {
      load();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {nonLues > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-900 text-sm">Notifications</h3>
            {nonLues > 0 && (
              <button
                onClick={handleMarquerTout}
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">Aucune notification pour le moment.</p>
            ) : (
              notifications.map((n) => {
                const Icon = iconParType[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClickNotification(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.lu ? 'bg-primary-50/40' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.lu ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!n.lu ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{n.titre}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-slate-300 mt-1">{formatRelatif(n.dateCreation)}</p>
                    </div>
                    {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
