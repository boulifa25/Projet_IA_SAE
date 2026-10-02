import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Loader2, AlertCircle, X, CheckCircle2, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  stagesApi,
  soutenancesApi,
  evaluationsApi,
  ApiError,
  type StageResponse,
  type SoutenanceResponse,
} from '@/lib/api';
import { soutenanceStatutConfig } from '@/lib/statusStyles';

export default function SoutenancesAdmin() {
  const { token } = useAuth();
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planifierStage, setPlanifierStage] = useState<StageResponse | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [stagesData, soutenancesData] = await Promise.all([stagesApi.toutes(token), soutenancesApi.toutes(token)]);
      setStages(stagesData);
      setSoutenances(soutenancesData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stagesSansSoutenance = stages.filter((s) => !soutenances.some((sout) => sout.stageId === s.id));
  const planifiees = soutenances.filter((s) => s.statut === 'PLANIFIEE');
  const realisees = soutenances.filter((s) => s.statut === 'REALISEE');

  const handleFinaliser = async (id: number) => {
    if (!token) return;
    setBusyId(id);
    try {
      await evaluationsApi.finaliser(id, token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de finaliser cette soutenance.');
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
    <div className="p-6 space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Stages à planifier</h3>
          <p className="text-xs text-slate-400 mt-0.5">Stages en cours sans soutenance planifiée</p>
        </div>
        {stagesSansSoutenance.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Tous les stages en cours ont une soutenance planifiée.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {stagesSansSoutenance.map((stage) => (
              <div key={stage.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                  {stage.etudiantPrenom[0]}{stage.etudiantNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{stage.etudiantPrenom} {stage.etudiantNom}</p>
                  <p className="text-xs text-slate-400 truncate">{stage.entrepriseNom} · {stage.sujet}</p>
                </div>
                <button
                  onClick={() => setPlanifierStage(stage)}
                  className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-2 rounded-lg transition-colors shrink-0"
                >
                  Planifier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Soutenances planifiées</h3>
        </div>
        {planifiees.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune soutenance planifiée pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {planifiees.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{s.etudiantPrenom} {s.etudiantNom}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {s.entrepriseNom} · {new Date(s.dateSoutenance).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} · {s.lieuOuLien}
                  </p>
                </div>
                <button
                  onClick={() => handleFinaliser(s.id)}
                  disabled={busyId === s.id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                >
                  {busyId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Finaliser
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Soutenances réalisées</h3>
        </div>
        {realisees.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune soutenance finalisée pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {realisees.map((s) => {
              const statut = soutenanceStatutConfig[s.statut];
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.etudiantPrenom} {s.etudiantNom}</p>
                    <p className="text-xs text-slate-400 truncate">{s.entrepriseNom}</p>
                  </div>
                  {s.noteFinale !== null && (
                    <span className="text-sm font-semibold text-slate-700 shrink-0">{s.noteFinale.toFixed(1)} / 20</span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>{statut.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {planifierStage && (
        <PlanifierModal stage={planifierStage} onClose={() => setPlanifierStage(null)} onSuccess={() => { setPlanifierStage(null); load(); }} />
      )}
    </div>
  );
}

function PlanifierModal({ stage, onClose, onSuccess }: { stage: StageResponse; onClose: () => void; onSuccess: () => void }) {
  const { token } = useAuth();
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [lieuOuLien, setLieuOuLien] = useState('');
  const [jury, setJury] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) return;

    setLoading(true);
    try {
      await soutenancesApi.planifier(
        {
          stageId: stage.id,
          dateSoutenance: new Date(`${date}T${heure || '09:00'}`).toISOString(),
          lieuOuLien,
          jury: jury.split(',').map((j) => j.trim()).filter(Boolean),
        },
        token
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de planifier cette soutenance.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors';

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-bold text-slate-900">Planifier la soutenance</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500">{stage.etudiantPrenom} {stage.etudiantNom} · {stage.entrepriseNom}</p>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Heure</label>
              <input required type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Salle ou lien visio
            </label>
            <input required value={lieuOuLien} onChange={(e) => setLieuOuLien(e.target.value)} placeholder="Salle B204 ou lien Zoom" className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Membres du jury</label>
            <input value={jury} onChange={(e) => setJury(e.target.value)} placeholder="Noms séparés par des virgules" className={fieldClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Calendar className="w-4 h-4" /> Planifier</>}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
