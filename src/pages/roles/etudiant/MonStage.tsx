import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  Building2,
  Calendar,
  Plus,
  X,
  Upload,
  FileText,
  Download,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  conventionsApi,
  stagesApi,
  rapportsApi,
  soutenancesApi,
  recommandationsApi,
  ApiError,
  type ConventionResponse,
  type StageResponse,
  type RapportResponse,
  type TypeRapport,
  type SoutenanceResponse,
  type RecommandationIAResponse,
} from '@/lib/api';
import { soutenanceStatutConfig } from '@/lib/statusStyles';

export default function MonStage() {
  const { token } = useAuth();
  const [convention, setConvention] = useState<ConventionResponse | null>(null);
  const [stage, setStage] = useState<StageResponse | null>(null);
  const [rapports, setRapports] = useState<RapportResponse[]>([]);
  const [soutenance, setSoutenance] = useState<SoutenanceResponse | null>(null);
  const [conseils, setConseils] = useState<RecommandationIAResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeposeModal, setShowDeposeModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingAttestation, setDownloadingAttestation] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const conv = await conventionsApi.maConvention(token);
      setConvention(conv);

      if (conv.statut === 'VALIDEE') {
        const stageData = await stagesApi.monStage(token);
        setStage(stageData);
        setRapports(await rapportsApi.parStage(stageData.id, token));

        try {
          setSoutenance(await soutenancesApi.pourStage(stageData.id, token));
        } catch (soutErr) {
          if (!(soutErr instanceof ApiError && soutErr.status === 404)) throw soutErr;
          setSoutenance(null);
        }

        const recommandations = await recommandationsApi.parStage(stageData.id, token);
        setConseils(recommandations.filter((r) => r.type === 'CONSEIL'));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setConvention(null);
      } else {
        setError(err instanceof ApiError ? err.message : 'Impossible de charger votre stage.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDownload = async (rapport: RapportResponse) => {
    if (!token) return;
    setDownloadingId(rapport.id);
    try {
      const blob = await rapportsApi.getFichierBlob(rapport.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError('Impossible de télécharger ce fichier.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAttestation = async () => {
    if (!token || !stage) return;
    setDownloadingAttestation(true);
    try {
      const blob = await stagesApi.getAttestationBlob(stage.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Impossible de télécharger l'attestation.");
    } finally {
      setDownloadingAttestation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!convention) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm max-w-sm">
            Vous n'avez pas encore de stage confirmé. Une fois qu'une entreprise aura accepté votre candidature,
            votre convention de stage apparaîtra ici.
          </p>
        </div>
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

      {/* Convention / stage header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700">
              {convention.entrepriseNom.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-lg">{convention.offreTitre}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {convention.entrepriseNom}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">{convention.reference}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4">{convention.sujet}</p>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(convention.dateDebut).toLocaleDateString('fr-FR')} → {new Date(convention.dateFin).toLocaleDateString('fr-FR')}
          </span>
          {convention.enseignantNom && (
            <span>Tuteur académique : <strong className="text-slate-700">{convention.enseignantNom}</strong></span>
          )}
        </div>

        {/* Validation progress */}
        {convention.statut !== 'VALIDEE' && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Validation de la convention</p>
            <div className="flex items-center gap-2">
              {convention.valideeParEnseignant ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <span className={`text-sm ${convention.valideeParEnseignant ? 'text-slate-700' : 'text-slate-400'}`}>
                Validation par l'enseignant référent
              </span>
            </div>
            <div className="flex items-center gap-2">
              {convention.valideeParAdmin ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <span className={`text-sm ${convention.valideeParAdmin ? 'text-slate-700' : 'text-slate-400'}`}>
                Validation administrative
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Soutenance & attestation */}
      {soutenance && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-900">Soutenance</h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${soutenanceStatutConfig[soutenance.statut].classes}`}>
              {soutenanceStatutConfig[soutenance.statut].label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(soutenance.dateSoutenance).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {soutenance.lieuOuLien}
            </span>
          </div>

          {soutenance.jury.length > 0 && (
            <p className="text-sm text-slate-500 mb-4">Jury : {soutenance.jury.join(', ')}</p>
          )}

          {soutenance.statut === 'REALISEE' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800 font-semibold">
                  Note finale : {soutenance.noteFinale?.toFixed(1)} / 20
                </p>
              </div>
              {soutenance.attestationDisponible && (
                <button
                  onClick={handleDownloadAttestation}
                  disabled={downloadingAttestation}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                >
                  {downloadingAttestation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Télécharger l'attestation
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Conseils IA */}
      {conseils.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <div>
              <h3 className="font-display font-bold text-slate-900">Conseils personnalisés</h3>
              <p className="text-xs text-slate-400 mt-0.5">Générés par l'assistant IA après chaque rapport déposé</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {conseils.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.contenu}</p>
                <p className="text-xs text-slate-400 mt-1.5">{new Date(c.dateGeneration).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports section — only once stage is validated */}
      {stage && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-slate-900">Rapports d'avancement</h3>
              <p className="text-xs text-slate-400 mt-0.5">Déposez vos rapports intermédiaires et final</p>
            </div>
            <button
              onClick={() => setShowDeposeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Déposer un rapport
            </button>
          </div>

          {rapports.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Aucun rapport déposé pour le moment.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {rapports.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.titre}</p>
                    <p className="text-xs text-slate-400">
                      {r.type === 'FINAL' ? 'Rapport final' : 'Rapport intermédiaire'} · {new Date(r.dateDepot).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(r)}
                    disabled={downloadingId === r.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors shrink-0"
                  >
                    {downloadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDeposeModal && stage && (
        <DeposerRapportModal
          stageId={stage.id}
          onClose={() => setShowDeposeModal(false)}
          onSuccess={() => {
            setShowDeposeModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function DeposerRapportModal({ stageId, onClose, onSuccess }: { stageId: number; onClose: () => void; onSuccess: () => void }) {
  const { token } = useAuth();
  const [type, setType] = useState<TypeRapport>('INTERMEDIAIRE');
  const [titre, setTitre] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [fichier, setFichier] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fichier) {
      setError('Merci de joindre un fichier PDF.');
      return;
    }
    if (fichier.type !== 'application/pdf') {
      setError('Le fichier doit être un PDF.');
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      await rapportsApi.deposer(stageId, type, titre, commentaire, fichier, token);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de déposer ce rapport.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors';

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Déposer un rapport</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Type de rapport</label>
            <select value={type} onChange={(e) => setType(e.target.value as TypeRapport)} className={fieldClass}>
              <option value="INTERMEDIAIRE">Rapport intermédiaire</option>
              <option value="FINAL">Rapport final</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre</label>
            <input required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Rapport - Mois 1" className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Commentaire (optionnel)</label>
            <textarea rows={3} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Résumé de l'avancement..." className={`${fieldClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fichier PDF</label>
            <label className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-300 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-500 flex-1 truncate">{fichier ? fichier.name : 'Choisir un fichier PDF'}</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Déposer le rapport'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
