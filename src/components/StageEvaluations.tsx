import { useEffect, useState, type FormEvent } from 'react';
import { Users, Loader2, AlertCircle, CheckCircle2, FileCheck, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  soutenancesApi,
  evaluationsApi,
  ApiError,
  type StageResponse,
  type SoutenanceResponse,
  type EvaluationResponse,
} from '@/lib/api';
import { soutenanceStatutConfig } from '@/lib/statusStyles';

const CRITERES_STANDARD = ['Autonomie', 'Qualité technique', 'Communication', 'Assiduité', "Intégration à l'équipe"];

interface StageEvaluationsProps {
  loadStages: (token: string) => Promise<StageResponse[]>;
}

export default function StageEvaluations({ loadStages }: StageEvaluationsProps) {
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
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les stages.'))
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
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Aucun stage pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex gap-4">
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 overflow-y-auto scrollbar-thin self-start max-h-[70vh]">
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

        <div className="flex-1 bg-white rounded-2xl border border-slate-200">
          {selected && <EvaluationPanel key={selected.id} stage={selected} />}
        </div>
      </div>
    </div>
  );
}

function EvaluationPanel({ stage }: { stage: StageResponse }) {
  const { token, user } = useAuth();
  const [soutenance, setSoutenance] = useState<SoutenanceResponse | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const s = await soutenancesApi.pourStage(stage.id, token);
      setSoutenance(s);
      setEvaluations(await evaluationsApi.parSoutenance(s.id, token));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSoutenance(null);
      } else {
        setError(err instanceof ApiError ? err.message : 'Impossible de charger la soutenance.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id, token]);

  const dejaSoumis = evaluations.some((e) => e.evaluateurId === user?.id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !soutenance) return;

    const incomplete = CRITERES_STANDARD.some((c) => !notes[c]);
    if (incomplete) {
      setError('Merci de renseigner une note pour chaque critère.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await evaluationsApi.soumettre(
        soutenance.id,
        CRITERES_STANDARD.map((c) => ({ critere: c, note: Number(notes[c]) })),
        token
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer votre évaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!soutenance) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <FileCheck className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm">Aucune soutenance planifiée pour ce stage pour le moment.</p>
      </div>
    );
  }

  const statut = soutenanceStatutConfig[soutenance.statut];

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(soutenance.dateSoutenance).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {soutenance.lieuOuLien}
          </span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${statut.classes}`}>{statut.label}</span>
      </div>

      {soutenance.statut === 'REALISEE' && soutenance.noteFinale !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-semibold">Note finale : {soutenance.noteFinale.toFixed(1)} / 20</p>
        </div>
      )}

      {evaluations.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Évaluations soumises</p>
          {evaluations.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{e.evaluateurNom} · {e.critere}</span>
              <span className="font-semibold text-slate-900">{e.note} / 20</span>
            </div>
          ))}
        </div>
      )}

      {!dejaSoumis && soutenance.statut === 'PLANIFIEE' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Votre grille d'évaluation</p>
          {CRITERES_STANDARD.map((critere) => (
            <div key={critere} className="flex items-center gap-3">
              <label className="text-sm text-slate-600 flex-1">{critere}</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={notes[critere] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [critere]: e.target.value }))}
                placeholder="/ 20"
                className="w-24 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 text-center transition-colors"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Soumettre mon évaluation'}
          </button>
        </form>
      )}

      {dejaSoumis && soutenance.statut === 'PLANIFIEE' && (
        <p className="text-sm text-slate-400 text-center py-4">
          Vous avez soumis votre évaluation. En attente de l'autre évaluateur et de la validation administrative.
        </p>
      )}
    </div>
  );
}
